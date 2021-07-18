const { Connection, Request, TYPES } = require('tedious');
const {
    monitor,
    activeDevices,
    qtyt,
    activeMonitors,
} = require('./monitor_qtyt');

const dotenv = require('dotenv');
dotenv.config();

// Create connection to database
const config = {
    authentication: {
        options: {
            userName: process.env.authUserName, // update me
            password: process.env.authPassword, // update me
        },
        type: 'default',
    },
    server: process.env.server, // updated
    options: {
        database: process.env.optionsDatabase, //update me
        encrypt: true,
        useColumnNames: true,
    },
};
const connection = new Connection(config);
connection.on('connect', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log(`DB connected!`);
        // load Qtyt
        rqtyt = queryQtyt();
        rqtyt.on('row', (qt) => qtyt.push(qt));
        rqtyt.on('requestCompleted', () => {
            // load active device
            rq = queryDevice(true);
            rq.on('row', (dev) => activeDevices.push(dev));
            rq.on('requestCompleted', () => {
                for (const dev of activeDevices) {
                    let new_conn = this.newConnection();
                    new_conn.on("connect", (err) => {
                        var rqp = getPatientWithDevid(dev.dev_id.value);                    
                        rqp.on('row', (pat) => {
                            activeMonitors[pat.pat_id.value] = new monitor(
                                pat.pat_id.value,
                                dev
                            );
                        });
                        new_conn.execSql(rqp);
                    })                    
                    new_conn.connect();
                }   
            });
            connection.execSql(rq);
        });
        connection.execSql(rqtyt);
    }
});

connection.connect();
commonRequestCallback = (err, rowCount) => {
    if (err) {
        console.error(err);
    } else {
        console.log(`${rowCount} row(s) returned`);
    }
};

function removeMetadata(cols) {
    for (const key in cols) {
        if (Object.hasOwnProperty.call(cols, key)) {
            const element = cols[key];
            delete element.metadata;
        }
    }
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function insertTempData(patid, time, tempValue) {
    console.log(`putTempData(${patid}, ${time}, ${tempValue})`);
    sqlStr =
        'INSERT INTO temp_history(pat_id, recv_time, temp_value) OUTPUT INSERTED.* VALUES (@patid,@time,@value)';
    req = new Request(sqlStr, commonRequestCallback);
    req.addParameter('patid', TYPES.Int, patid);
    req.addParameter('time', TYPES.DateTime, new Date(time));
    req.addParameter('value', TYPES.Float, tempValue);

    return req;
}

function getPatient(id)
{
    sqlStr = 'SELECT * FROM patient';
    if (id)
    {
        sqlStr += ' WHERE pat_id = @patid';
    }

    req = new Request(sqlStr, commonRequestCallback);
    req.addParameter('patid', TYPES.Int, id);

    return req;
}

function getPatientWithDevid(devid) {
    sqlStr = `SELECT * FROM patient WHERE dev_id = ${devid}`;

    return new Request(sqlStr, commonRequestCallback);
}

function queryDevice(inuse) {
    if (inuse == true)
        sqlstr =
            'select * from device where dev_id in (select dev_id from patient)';
    else if (inuse == undefined) sqlstr = 'SELECT * FROM device';
    else if (inuse == false)
        sqlstr =
            'select * from device where dev_id not in (select dev_id from patient)';
    return new Request(sqlstr, commonRequestCallback);
}

//time ago unit is minute
function queryTempData(patID, time_ago) {
    baseSqlstr = 'SELECT * FROM temp_history';
    if (patID | time_ago) {
        baseSqlstr += ' WHERE';
    }
    baseSqlstr += patID ? ` pat_id = ${patID}` : '';
    baseSqlstr += time_ago
        ? (patID ? ' and' : '') +
          ` recv_time > DATEADD(Minute, ${-time_ago}, @now)`
        : '';

    req = new Request(baseSqlstr, commonRequestCallback);
    if (time_ago) req.addParameter('now', TYPES.DateTime, new Date(Date.now()));

    return req;
}

function queryQtyt(level) {
    sqlStr = '';
    if (!level) {
        sqlStr = `SELECT * FROM qtyt ORDER BY warning_level`;
    } else {
        sqlStr = `SELECT * FROM qtyt WHERE warning_level = ${level}`;
    }

    return new Request(sqlStr, commonRequestCallback);
}

function updateQtyt(qtyt) {
    sqlStr =
        'UPDATE qtyt SET temp_from = @tfrom, temp_to = @tto, duration = @duration WHERE warning_level = @wl';
    req = new Request(sqlStr, commonRequestCallback);
    req.addParameter('wl', TYPES.Int, qtyt.warning_level);
    req.addParameter('tfrom', TYPES.Float, qtyt.temp_from);
    req.addParameter('tto', TYPES.Float, qtyt.temp_to);
    req.addParameter('duration', TYPES.Float, qtyt.duration);

    return req;
}

// Long's Utils Function
function configureRequest(sql, conn, parameters) {
    var request = createRequest(sql, conn);

    parameters.forEach(function (param) {
        request.addParameter(param.name, param.type, param.data);
    });

    return request;
}
function createRequest(query, connection) {
    var Request = require('tedious').Request;

    var req = new Request(query, function (err, rowCount) {
        if (err) {
            console.log(err);
        }

        connection && connection.close();
    });

    return req;
}
function runQuery(query, connection, callback) {
    var request = query;

    if (typeof query == 'string') {
        request = createRequest(query, connection);
    }

    var values = '';

    // the rows are returned as a json array. Since it's sent in a batch,
    // different events are raised.
    // So the values are concatenated to create a single JSON object
    request.on('row', function (column) {
        values += column[0].value;
    });

    // if anything specific needs to be done after the process is complete
    request.on('done', function (rowCount, more, rows) {
        // check if the SQL Server returned anything
        values = checkValues(values);

        callback(values);
    });

    // if anything specific needs to be done after the stored procedure is complete
    // however, if we use connection.execSql(), it emits doneProc instead of done.
    request.on('doneProc', function (rowCount, more, rows) {
        // check if the SQL Server returned anything
        values = checkValues(values);
        callback(values);
    });

    try {
        executeRequest(request, connection);
    } catch (err) {
        throw err;
    }

    // return the values parsed as JSON
    // return JSON.parse(values);
    return values;
}
function checkValues(values) {
    if (values === '') {
        // needs to be set to null if the SQL Server return nothing.
        // This is required to ensure JSON is correctly parsed.
        values = null;
    }

    return values;
}

// execute request to pull the data
function executeRequest(request, connection) {
    connection.on('connect', function (err) {
        if (err) {
            console.log(err);
            res.send(err);
        }

        connection.execSql(request);
    });
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

exports.connection = connection;
exports.newConnection = () => new Connection(config);
exports.putTempData = insertTempData;
exports.commonRequestCallback = commonRequestCallback;
exports.queryQtyt = queryQtyt;
exports.queryTempData = queryTempData;
exports.queryDevice = queryDevice;
exports.getPatientWithDevid = getPatientWithDevid;
exports.removeMetadata = removeMetadata;
exports.updateQtyt = updateQtyt;
exports.queryTempData = queryTempData;
// Long's Utils export
// exports.createRequest = createRequest;
// exports.executeRequest = executeRequest;
// exports.configureRequest = configureRequest;
// exports.runQuery = runQuery;
// exports.getPatient = getPatient;
