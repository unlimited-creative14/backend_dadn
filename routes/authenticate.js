const express = require('express');
const router = express.Router();
const db = require('../cores/azure_db');
const { Request, TYPES } = require('tedious');
const connection = db.connection;
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
// Validation
const dotenv = require('dotenv');
dotenv.config();
//const { registerValidation, loginValidation } = require('../utils/validation');

// done event may fall in to 1 of 3 events below
function onSqlDone(sqlreq, cb) {
    sqlreq.on('done', cb);
    sqlreq.on('doneProc', cb);
    sqlreq.on('doneInProc', cb);
}

router.post('/signup', (req, res) => {
    const { error } = registerValidation(req.body);
    if (error)
        return res.status(400).send({
            message: error.details[0].message,
            code: '400',
        });

    // const checkIfExisted = `SELECT * FROM users WHERE email = ${req.body.email}`;
    // const checkRequest = new Request(checkIfExisted, (err) => {
    //     if (err) throw 'Err on Check request';
    // });

    // checkRequest.on('row', (cols) => {
    //     if (cols.length > 0)
    //         return res.send({
    //             message: 'Email is existed, please using another email',
    //             code: '400',
    //         });
    // });

    // checkRequest.on('requestCompleted', () => {
    // TODO Hash the password
    const salt = bcryptjs.genSaltSync(10);
    const hashedPassword = bcryptjs.hashSync(req.body.password, salt);
    const date = new Date();
    const sql = `INSERT INTO users (email, password, created_on, modified_on) VALUES (@email, @password, @created_on, @modified_on);`;
    const request = new Request(sql, (err) => {
        if (err) {
            throw 'Err on signup request';
        }
    });

    request.addParameter('email', TYPES.NVarChar, req.body.email);
    request.addParameter('password', TYPES.NVarChar, hashedPassword);
    request.addParameter('created_on', TYPES.DateTime, date);
    request.addParameter('modified_on', TYPES.DateTime, date);

    request.on('requestCompleted', () =>
        res.send({
            message: 'Created Success fully',
            status: '201',
        })
    );
    connection.execSql(request);
    // });

    // connection.execSql(checkRequest);
});

router.post('/signin', (req, res) => {
    const { error } = loginValidation(req.body);
    if (error)
        return res.status(400).send({
            message: error.details[0].message,
            code: '400',
        });

    const sql = `SELECT * FROM users WHERE email = @email`;
    const request = new Request(sql, (err) => {
        if (err) {
            throw 'Err on signup api';
        }
    });
    request.addParameter('email', TYPES.NVarChar, req.body.email);
    const resData = [];
    request.on('row', (cols) => {
        for (const key in cols) {
            if (Object.hasOwnProperty.call(cols, key)) {
                const element = cols[key];
                delete element.metadata;
            }
        }
        resData.push(cols);
    });
    request.on('requestCompleted', () => {
        if (resData.length < 1)
            return res.send({
                message: 'Please enter a valid email',
                code: '400',
            });
        else if (resData.length > 0) {
            const validPass = bcryptjs.compareSync(
                req.body.password,
                resData[0].password.value
            );
            if (!validPass)
                return res.status(400).send({
                    message: 'Invalid password',
                    code: '400',
                });
            else {
                const token = jwt.sign(resData[0], process.env.TOKEN_SECRET);
                return res.status(200).send({
                    authToken: token,
                    message: 'Login successfully',
                    code: '200',
                });
            }
        }
    });
    connection.execSql(request);
});

module.exports = router;
