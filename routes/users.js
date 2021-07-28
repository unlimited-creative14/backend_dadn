const express = require('express');
const router = express.Router();
const db = require('../cores/azure_db');
const { Request, TYPES } = require('tedious');
const connection = db.connection;
// done event may fall in to 1 of 3 events below
function onSqlDone(sqlreq, cb) {
    sqlreq.on('done', cb);
    sqlreq.on('doneProc', cb);
    sqlreq.on('doneInProc', cb);
}

router.post('/addPatient', (req, res) => {
    const date = new Date();
    let sql = `INSERT INTO patient (dev_id, first_name, last_name, email, phone, created_on, modified_on, doctor_id, status) VALUES (@dev_id, @first_name, @last_name, @email, @phone, @created_on, @modified_on, @doctor_id, @status)`;
    const request = new Request(sql, (err) => {
        if (err) {
            throw 'Err on addPatient request';
        }
    });

    request.addParameter('dev_id', TYPES.Int, req.body.dev_id || 0);
    request.addParameter('first_name', TYPES.VarChar, req.body.first_name);
    request.addParameter('last_name', TYPES.VarChar, req.body.last_name);
    request.addParameter('email', TYPES.VarChar, req.body.email);
    request.addParameter('phone', TYPES.VarChar, req.body.phone);
    request.addParameter('created_on', TYPES.DateTime, date);
    request.addParameter('modified_on', TYPES.DateTime, date);
    request.addParameter('doctor_id', TYPES.Int, req.body.doctor_id || 0);
    request.addParameter('status', TYPES.Int, req.body.status || 0);

    request.on('requestCompleted', () =>
        res.status(200).send({
            message: 'success',
            code: '200',
        })
    );
    connection.execSql(request);
});

router.get('/getAllPatients', (req, res) => {
    let sql;
    if (!req.query.name) sql = `SELECT * FROM patient ORDER BY pat_id desc`;
    else
        sql = `SELECT * FROM patient WHERE patient.first_name LIKE @query OR patient.last_name LIKE @query order by pat_id desc`;
    const request = new Request(sql, (err) => {
                return res.status(400).send({
            message: 'Patient not existed',
            code: 400,
        });
    });
    const resdata = [];
    if (req.query.name)
        request.addParameter('query', TYPES.VarChar, req.query.name);
    request.on('row', (cols) => {
        for (const key in cols) {
            if (Object.hasOwnProperty.call(cols, key)) {
                cols[key] = cols[key].value;
            }
        }
        resdata.push(cols);
    });

    onSqlDone(request, function (a, b, c) {
        if (!res.headersSent) res.send(resdata);
    });
    connection.execSql(request);
});

router.get('/patient/:patientId', (req, res) => {
    const sql = `select * from patient where patient.pat_id = @patientId`;
    const request = new Request(sql, (err) => {
        if (err)
            res.send({
                status: 400,
                message: 'This patient is not exist',
            });
    });
    request.addParameter('patientId', TYPES.Int, req.params.patientId);
    let result;
    request.on('row', (cols) => {
        for (const key in cols) {
            if (Object.hasOwnProperty.call(cols, key)) {
                cols[key] = cols[key].value;
            }
        }
        result = cols;
    });
    onSqlDone(request, (a, b, c) => {
        if (!res.headersSent) return res.send(result);
    });
    connection.execSql(request);
});

// Update patient with patient id
// Method: Put
// Body: {
//     "first_name":"Nguyen",
//     "last_name":"Nhung",
//     "email":"nhung.nguyen@gmail.com",
//     "phone":"0905251032",
//     "dev_id":1,
//     "doctor_id": 8,
//     "status":2
// }
router.put('/patient/:patientId', (req, res) => {
    const date = new Date();
    const sql = `update patient set first_name = @first_name, last_name = @last_name, email = @email, phone = @phone, modified_on = @modified_on, dev_id = @dev_id, doctor_id = @doctor_id, "status" = @status where patient.pat_id = @pat_id`;
    const request = new Request(sql, (err) => {
        if (err) console.log(err);
    });
    request.addParameter('first_name', TYPES.VarChar, req.body.first_name);
    request.addParameter('last_name', TYPES.VarChar, req.body.last_name);
    request.addParameter('email', TYPES.VarChar, req.body.email);
    request.addParameter('phone', TYPES.VarChar, req.body.phone);
    request.addParameter('modified_on', TYPES.DateTime, date);
    request.addParameter('dev_id', TYPES.Int, req.body.dev_id || 0);
    request.addParameter('doctor_id', TYPES.Int, req.body.doctor_id);
    request.addParameter('status', TYPES.Int, req.body.status);
    request.addParameter('pat_id', TYPES.Int, req.params.patientId);

    request.on('requestCompleted', () =>
        res.status(200).send({
            message: 'success',
            code: '200',
        })
    );
    connection.execSql(request);
});
module.exports = router;
