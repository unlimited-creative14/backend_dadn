const express = require('express');
const router = express.Router();
const db = require('../cores/azure_db');
const { Request, TYPES } = require('tedious');
const { v4: uuidv4 } = require('uuid');
const connection = db.connection;
// done event may fall in to 1 of 3 events below
function onSqlDone(sqlreq, cb) {
    sqlreq.on('done', cb);
    sqlreq.on('doneProc', cb);
    sqlreq.on('doneInProc', cb);
}

router.post('/addPatient', (req, res) => {
    const date = new Date();
    let sql = `INSERT INTO patient (dev_id, first_name, last_name, email, phone, created_on, modified_on) VALUES (@dev_id, @first_name, @last_name, @email, @phone, @created_on, @modified_on)`;
    const request = new Request(sql, (err) => {
        if (err) {
            throw 'Err on addPatient request';
        }
    });

    request.addParameter('dev_id', TYPES.Int, req.body.dev_id || 0)
    request.addParameter('first_name', TYPES.NVarChar, req.body.first_name);
    request.addParameter('last_name', TYPES.NVarChar, req.body.last_name);
    request.addParameter('email', TYPES.NVarChar, req.body.email);
    request.addParameter('phone', TYPES.NVarChar, req.body.phone);
    request.addParameter('created_on', TYPES.DateTime, date);
    request.addParameter('modified_on', TYPES.DateTime, date);

    request.on('requestCompleted', () => res.status(200).send({
        message: "success",
        code: "200"
    }));
    connection.execSql(request);
});

router.get('/getAllPatients', (req, res) => {
    const sql = `SELECT * FROM patient ORDER BY first_name`;
    const request = new Request(sql, err => {
        if (err)
            throw `Err on getAllPatients api`;
    })
    const resdata = [];
    
     request.on('row', (cols) => {
        for (const key in cols) {
            if (Object.hasOwnProperty.call(cols, key)) {
                const element = cols[key];
                delete element.metadata;
            }
        }
        resdata.push(cols);
     });
    
    onSqlDone(request, function (a, b, c) {
        if (!res.headersSent) res.json(resdata);
    });
    connection.execSql(request);
});

router.get('getPatientCaredByDocter', (req, res) => {
    res.status(200).send({ message: "OK" });
})
module.exports = router;
