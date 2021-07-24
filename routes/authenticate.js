const express = require('express');
const router = express.Router();
const db = require('../cores/azure_db');
const { Request, TYPES } = require('tedious');
const connection = db.connection;
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();
const { loginValidation } = require('../utils/validation');

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
        resData.push(cols);
    });
    request.on('requestCompleted', () => {
        if (resData.length < 1)
            return res.send({
                message: `Email is not existed`,
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
                    role: resData[0].role.value,
                });
            }
        }
    });
    connection.execSql(request);
});
module.exports = router;
