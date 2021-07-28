const { Connection, Request, TYPES } = require('tedious');
const {
    monitor,
    activeDevices,
    qtyt,
    activeMonitors,
} = require('./monitor_qtyt');

// Create connection to database
const config = {
    authentication: {
        options: {
            userName: process.env.AUTH_USER_NAME, // update me
            password: process.env.AUTH_PASSWORD, // update me
        },
        type: 'default',
    },
    server: process.env.SERVER, // updated
    options: {
        database: process.env.DATABASE_OPTIONS, //update me
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
            request = queryDevice('true');
            request.on('row', (dev) => activeDevices.push(dev));
            request.on('requestCompleted', () => {
                for (const dev of activeDevices) {
                    let new_conn = this.newConnection();
                    new_conn.on("connect", (err) => {
                        var rqp = getPatientWithDevid(dev.dev_id.value);                    
                        rqp.on('row', (pat) => {
                            activeMonitors[pat.pat_id.value] = new monitor(
                                process.env.USER_NAME,
                                process.env.IO_KEY,
                                pat.pat_id.value,
                                dev
                            );
                        });
                        new_conn.execSql(rqp);
                    })                    
                    new_conn.connect();
                }   
            });
            connection.execSql(request);
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
    sql =
        'INSERT INTO temp_history(pat_id, recv_time, temp_value) OUTPUT INSERTED.* VALUES (@patid,@time,@value)';
    request = new Request(sql, commonRequestCallback);
    request.addParameter('patid', TYPES.Int, patid);
    request.addParameter('time', TYPES.DateTime, new Date(time));
    request.addParameter('value', TYPES.Float, tempValue);

    return request;
}

function getPatientWithDevid(deviceId) {
    sql = `SELECT * FROM patient WHERE dev_id = ${deviceId}`;

    return new Request(sql, commonRequestCallback);
}

function queryDevice(inuse) {
    if (inuse == 'true')
        sql =
            'select * from device where dev_id in (select dev_id from patient)';
    else if (inuse == undefined) sql = 'SELECT * FROM device';
    else if (inuse == 'false')
        sql =
            'select * from device where dev_id not in (select dev_id from patient)';
    return new Request(sql, commonRequestCallback);
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

    request = new Request(baseSqlstr, commonRequestCallback);
    if (time_ago)
        request.addParameter('now', TYPES.DateTime, new Date(Date.now()));

    return request;
}

function queryQtyt(level) {
    sql = '';
    if (!level) {
        sql = `SELECT * FROM qtyt ORDER BY warning_level`;
    } else {
        sql = `SELECT * FROM qtyt WHERE warning_level = ${level}`;
    }

    return new Request(sql, commonRequestCallback);
}

function updateQtyt(body) {
    sql =
        'UPDATE qtyt SET temp_from = @tfrom, temp_to = @tto, duration = @duration WHERE warning_level = @wl';

    request = new Request(sql, commonRequestCallback);
    request.addParameter('wl', TYPES.Int, body.warning_level);
    request.addParameter('tfrom', TYPES.Float, body.temp_from);
    request.addParameter('tto', TYPES.Float, body.temp_to);
    request.addParameter('duration', TYPES.Float, body.duration);

    return request;
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
