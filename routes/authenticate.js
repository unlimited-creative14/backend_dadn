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
// TODO LoginDto
/**
 * @swagger
 * components:
 *   schemas:
 *     LoginDto:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: The email of the user
 *         password:
 *           type: string
 *           description: The password of the user
 *       example:
 *         email: malongnhan@gmail.com
 *         password: "malongnhan"
 */

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: User login
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginDto'
 *     responses:
 *       200:
 *         description: Login successfully
 *         contents:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         contents:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Failure'
 */
router.get('/', (req, res) => {
    return res.send('aloha');
});

router.post('/user/login', (req, res) => {
    const { error } = loginValidation(req.body);
    if (error)
        return res.status(400).send({
            message: error.details[0].message,
            code: '400',
        });

    const sql = `SELECT * FROM users WHERE email = @email and role = @role`;
    const request = new Request(sql, (err) => {
        if (err) {
            throw 'Err on signup api';
        }
    });
    request.addParameter('email', TYPES.NVarChar, req.body.email);
    request.addParameter('role', TYPES.Int, 0);
    const resData = [];
    request.on('row', (cols) => {
        resData.push(cols);
    });
    request.on('requestCompleted', () => {
        if (resData.length < 1)
            return res.send({
                message: `Email is not existed`,
                code: 400,
            });
        else if (resData.length > 0) {
            const validPass = bcryptjs.compareSync(
                req.body.password,
                resData[0].password.value
            );
            if (!validPass)
                return res.status(400).send({
                    message: 'Invalid password',
                    code: 400,
                });
            else {
                const token = jwt.sign(resData[0], process.env.TOKEN_SECRET);
                return res.header('auth-token', token).status(200).send({
                    message: 'Login successfully',
                    code: 200,
                });
            }
        }
    });
    connection.execSql(request);
});

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginDto'
 *     responses:
 *       200:
 *         description: Login successfully
 *         contents:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         contents:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Failure'
 */


router.post('/admin/login', (req, res) => {
    const { error } = loginValidation(req.body);
    if (error)
        return res.status(400).send({
            message: error.details[0].message,
            code: '400',
        });

    const sql = `SELECT * FROM users WHERE email = @email and role = @role`;
    const request = new Request(sql, (err) => {
        if (err) {
            return res.send({
                message: 'Error when login',
                code: 400,
            });
        }
    });
    request.addParameter('email', TYPES.NVarChar, req.body.email);
    request.addParameter('role', TYPES.Int, 1);
    const resData = [];
    request.on('row', (cols) => {
        resData.push(cols);
    });
    request.on('requestCompleted', () => {
        if (resData.length < 1)
            return res.send({
                message: `Account is not existed`,
                code: 400,
            });
        else if (resData.length > 0) {
            const validPass = bcryptjs.compareSync(
                req.body.password,
                resData[0].password.value
            );
            if (!validPass)
                return res.status(400).send({
                    message: 'Invalid password',
                    code: 400,
                });
            else {
                const token = jwt.sign(resData[0], process.env.TOKEN_SECRET);
                return res.header('auth-token', token).status(200).send({
                    message: 'Login successfully',
                    code: 200,
                });
            }
        }
    });
    connection.execSql(request);
});
module.exports = router;
    