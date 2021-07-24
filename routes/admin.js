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

router.post('/user', (req, res, next) => {
    const connection = db.connection;
    const { error } = registerValidation(req.body);
    if (error)
        return res.status(400).send({
            message: error.details[0].message.toString(),
            code: 400,
        });
    let isExisted = false;
    const checkIfExisted = `SELECT * FROM users WHERE email = @email`;
    const checkRequest = new Request(checkIfExisted, (err, rowCount) => {
        if (err) {
            res.status(500).send({
                message: err.message.toString(),
                code: 500,
            });
        } else if (rowCount > 0) {
            isExisted = true;
            return res.send({
                message: 'Email is existed, please using another email',
                code: '400',
            });
        }
    });

    checkRequest.addParameter('email', TYPES.VarChar, req.body.email);

    checkRequest.on('requestCompleted', (err, rowCount) => {
        if (isExisted) return;
        if (err)
            return res.send({
                message: 'Error on checking user process',
                code: '500',
            });

        // TODO Hash the password
        const salt = bcryptjs.genSaltSync(10);
        const hashedPassword = bcryptjs.hashSync(req.body.password, salt);
        const date = new Date();
        const sql = `INSERT INTO users (email, password, role,  created_on, modified_on) VALUES (@email, @password, @role,  @created_on, @modified_on)`;
        // const sql = `SELECT * FROM users`;
        const request = new Request(sql, (err) => {
            if (err) {
                console.log(err.message);
            }
        });

        request.addParameter('email', TYPES.VarChar, req.body.email);
        request.addParameter('password', TYPES.VarChar, hashedPassword);
        request.addParameter('created_on', TYPES.DateTime, date);
        request.addParameter('modified_on', TYPES.DateTime, date);
        request.addParameter('role', TYPES.Int, req.body.role || 0);

        request.on('requestCompleted', () =>
            res.send({
                message: 'Created Success fully',
                status: '201',
            })
        );
        connection.execSql(request);
    });

    connection.execSql(checkRequest);
});

// TODO assign patient to a doctor
router.put('assignPatient/:doctorId', (req, res) => {
    res.send('assign patient to a doctor');
});

module.exports = router;
