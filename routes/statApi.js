var express = require('express');
const { Request, TYPES } = require('tedious');
var router = express.Router();
var db = require('../cores/azure_db')

const connection = db.connection
// done event may fall in to 1 of 3 events below
function onSqlDone(sqlreq, cb)
{
    sqlreq.on(
        'done',
        cb
    )
    sqlreq.on(
        'doneProc',
        cb
    )
    sqlreq.on(
        'doneInProc',
        cb
    )
}

// get temp data in n lastest day
router.get(
    '/tempdata/:hours', 
    function(req, res, next) {
        resdata = []
        hours = req.params['hours']
        sqlStr = "SELECT * FROM temp_history WHERE recv_time > DATEADD(Hour, -@hours, @now) ORDER BY recv_time DESC;";
        sqlreq = new Request(sqlStr, db.commonRequestCallback);
        sqlreq.addParameter("hours", TYPES.Int, hours);
        sqlreq.addParameter("now", TYPES.DateTime, new Date(Date.now()));
        sqlreq.on(
            'row', 
            (cols) => {
                for (const key in cols) {
                    if (Object.hasOwnProperty.call(cols, key)) {
                        const element = cols[key];
                        delete element.metadata;
                    }
                }
                resdata.push(cols);
            }
        )
        
        onSqlDone(sqlreq, 
            function (a,b,c) {
                if(!res.headersSent)
                    res.json(resdata);
            })
        
        connection.execSql(sqlreq);

    }
);
module.exports = router;
