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

router.post('/signup', (req, res) => {
    const date = new Date();
    const sql = `INSERT INTO users (id, email, password, created_on, modified_on) VALUES (@id, @email, @phone, @password, @created_on, @modified_on);`;
    const request = new Request(sql, (err) => {
        if (err) {
            throw 'Err on signup request';
        }
    });
    request.addParameter(
        'id',
        TYPES.UniqueIdentifier,
        uuidv4(date.getTime().toString())
    );
    request.addParameter('email', TYPES.NVarChar, req.body.email);
    request.addParameter('password', TYPES.NVarChar, req.body.password);
    request.addParameter('created_on', TYPES.DateTime, date);
    request.addParameter('modified_on', TYPES.DateTime, date);

    request.on('requestCompleted', () => res.status(200));
    connection.execSql(request);
});

router.post('/signin', (req, res) => {
    // const email = req.body.email;
    // const password = req.body.password;


    // connection.query(
    //     'SELECT * FROM users WHERE email = ?',
    //     [email],
    //     (err, result) => {
    //         if (err) {
    //             res.send({
    //                 success: false,
    //                 message: 'Error with select from database',
    //             });
    //         } else {
    //             if (result.length > 0) {
    //                 if ((password = result[0].password)) {
    //                     res.send({
    //                         sucess: true,
    //                         message: 'Login Successful. Welcome ' + email,
    //                     });
    //                 } else {
    //                     res.send({
    //                         success: false,
    //                         message: 'Password does not match',
    //                     });
    //                 }
    //             } else {
    //                 res.send({
    //                     status: false,
    //                     message: 'Email does not exist',
    //                 });
    //             }
    //         }
    //     }
    // );
    const sql = `SELECT * FROM users WHERE email = ${req.body.email}`;
    const request = new Request(sql, err => {
        if (err) {
            throw 'Err on signup api';
        }
    });
    request.on('requestCompleted', () => res.status(200).send({ message: "Success" }));
});

module.exports = router;
