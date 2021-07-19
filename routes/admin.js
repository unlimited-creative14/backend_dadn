const express = require('express');
const router = express.Router();
const db = require('../cores/azure_db');
const { Request, TYPES } = require('tedious');
const bcryptjs = require('bcryptjs');
const { registerValidation } = require('../utils/validation');
// done event may fall in to 1 of 3 events below
function onSqlDone(sqlreq, cb) {
    sqlreq.on('done', cb);
    sqlreq.on('doneProc', cb);
    sqlreq.on('doneInProc', cb);
}

// router.post('/addUser/success', (req, res) => {
//     const connection2 = db.newConnection();
//     // TODO Hash the password
//     const salt = bcryptjs.genSaltSync(10);
//     const hashedPassword = bcryptjs.hashSync(req.body.password, salt);
//     const date = new Date();
//     const sql = `INSERT INTO users (email, password, created_on, modified_on) VALUES (@email, @password, @created_on, @modified_on);`;
//     const request = new Request(sql, (err) => {
//         if (err) {
//             throw 'Err on signup request';
//         }
//     });

//     request.addParameter('email', TYPES.VarChar, req.body.email);
//     request.addParameter('password', TYPES.VarChar, hashedPassword);
//     request.addParameter('created_on', TYPES.DateTime, date);
//     request.addParameter('modified_on', TYPES.DateTime, date);

//     request.on('requestCompleted', () =>
//         res.send({
//             message: 'Created Success fully',
//             status: '201',
//         })
//     );
//     connection2.execSql(request);
// });

// router.post('/addUser', (req, res, next) => {
//     const connection1 = db.connection;
//     const { error } = registerValidation(req.body);
//     if (error)
//         return res.status(400).send({
//             message: error.details[0].message,
//             code: '400',
//         });

//     const checkIfExisted = `SELECT * FROM users WHERE email = ${req.body.email}`;
//     const checkRequest = new Request(checkIfExisted, (err, rowCount) => {
//         if (err) throw 'Error on Check request';
//         else if (rowCount.length > 0)
//             return res.send({
//                 message: 'Email is existed, please using another email',
//                 code: '400',
//             });
//     });

//     connection1.execSql(checkRequest);
//     next('/addUser/success');
// });

// TODO assign patient to a doctor
router.put('assignPatient/:doctorId', (req, res) => {
    res.send('assign patient to a doctor');
});

module.exports = router;
