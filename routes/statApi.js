var express = require('express');
const { Request, TYPES } = require('tedious');
var router = express.Router();
var db = require('../cores/azure_db')

const connection = db.connection
// get temp data in n lastest day
router.get(
    '/tempdata/:patid-:hours', 
    function(req, res, next) {
        resdata = []
        pat_id = req.params['patid'];
        hours = req.params['hours'];
        sqlStr = "SELECT * FROM temp_history WHERE (recv_time > DATEADD(Hour, -@hours, @now) and (pat_id = @pat_id) ORDER BY recv_time DESC;";
        sqlreq = new Request(sqlStr, db.commonRequestCallback);
        sqlreq.addParameter("hours", TYPES.Int, hours);
        sqlreq.addParameter('pat_id', TYPES.Int, pat_id);
        sqlreq.addParameter("now", TYPES.DateTime, new Date(Date.now()));
        sqlreq.on(
            'row', 
            (cols) => {
                db.removeMetadata(cols);
                resdata.push(cols);
            }
        )
        sqlreq.on(
            'requestCompleted',
            () => res.json(resdata)
        )        
        connection.execSql(sqlreq);

    }
);
module.exports = router;
