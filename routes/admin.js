const express = require('express');
const router = express.Router();
const db = require('../cores/azure_db');
const { Request, TYPES } = require('tedious');
const bcryptjs = require('bcryptjs');
const { registerValidation } = require('../utils/validation');
const swaggerJSDoc = require('swagger-jsdoc');
const connection = db.connection;

// TODO CreatePatientDto Schema
/**
 * @swagger
 * components:
 *   schemas:
 *     CreatePatientDto:
 *       type: object
 *       properties:
 *         dev_id:
 *           type: int
 *           description: The id of the device of patient
 *         email:
 *           type: string
 *           description: The email of the patient
 *         first_name:
 *           type: string
 *           description: The first name of the patient
 *         last_name:
 *           type: string
 *           description: The last name of the patient
 *         phone:
 *           type: string
 *           description: The phone number of the patient
 *         status:
 *           type: int
 *           description: The status of the patient
 *       example:
 *         dev_id: 1
 *         email: malongnhan@gmail.com
 *         first_name: long
 *         last_name: nguyen
 *         phone: "0346156078"
 *         status: 1
 */
// TODO UserResponseDto Schema
/**
 * @swagger
 * components:
 *   schemas:
 *     UserResponseDto:
 *       type: object
 *       properties:
 *         id:
 *           type: int
 *           description: The auto-generated id of the user
 *         email:
 *           type: string
 *           description: The email of the user
 *         created_on:
 *           type: date time
 *           description: the date and time that user enter the hospital
 *         modified_on:
 *           type: date time
 *           description: the last time that user modified
 *         role:
 *           type: int
 *           description: The number indicate the role of the user
 *       example:
 *         id: 1
 *         email: malongnhan@gmail.com
 *         created_on: 2020-12-12T00:00:00.0000000
 *         modified_on: 2020-12-12T00:00:00.0000000
 *         role: 1
 */

// TODO Success Schema
/**
 * @swagger
 * components:
 *   schemas:
 *     Success:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Created successfully
 *         code:
 *           type: int
 *           description: 201
 *       example:
 *         message: Created successfully
 *         code: 201
 */
// TODO Update Success Schema
/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateSuccess:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Assigned successfully
 *         code:
 *           type: int
 *           description: 200
 *       example:
 *         message: Assigned successfully
 *         code: 201
 */

// TODO Failure Schema
/**
 * @swagger
 * components:
 *   schemas:
 *     Failure:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Email already existed
 *         code:
 *           type: int
 *           description: 400
 *       example:
 *         message: Email already existed
 *         code: 400
 */

// TODO Create User DTO
/**
 * @swagger
 * components:
 *   schemas:
 *     CreateUserDto:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: nguyenphilong@gmail.com
 *         password:
 *           type: string
 *           description: nguyenphilong
 *         role:
 *           type: int
 *           description: 1
 *       example:
 *         email: nguyenphilong@gmail.com
 *         password: nguyenphilong
 *         role: 1
 */

//TODO Create patient DTO
/**
 * @swagger
 * components:
 *   schemas:
 *     CreateUserDto:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: nguyenphilong@gmail.com
 *         password:
 *           type: string
 *           description: nguyenphilong
 *         role:
 *           type: int
 *           description: 1
 *       example:
 *         email: nguyenphilong@gmail.com
 *         password: nguyenphilong
 *         role: 1
 */

// TODO Insert a new user
/**
 * @swagger
 * /api/admin/user:
 *   post:
 *     summary: Insert a new user
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserDto'
 *     responses:
 *       201:
 *         description: Created successfully
 *         contents:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Email already existed
 *         contents:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Failure'
 */

router.post('/user', (req, res) => {
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
            return res.status(500).send({
                message: err.message.toString(),
                code: 500,
            });
        } else if (rowCount > 0) {
            isExisted = true;
            return res.send({
                message: 'Email is existed, please using another email',
                code: 400,
            });
        }
    });

    checkRequest.addParameter('email', TYPES.VarChar, req.body.email);

    checkRequest.on('requestCompleted', (err, rowCount) => {
        if (isExisted) return;
        if (err)
            return res.send({
                message: 'Error on checking user process',
                code: 500,
            });

        // TODO Hash the password
        const salt = bcryptjs.genSaltSync(10);
        const hashedPassword = bcryptjs.hashSync(req.body.password, salt);
        const date = new Date();
        const sql = `INSERT INTO users (email, password, role,  created_on, modified_on) VALUES (@email, @password, @role,  @created_on, @modified_on)`;
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
                status: 201,
            })
        );
        connection.execSql(request);
    });

    connection.execSql(checkRequest);
});

// TODO Insert a new patient
/**
 * @swagger
 * /api/admin/patients:
 *   post:
 *     summary: Insert a new patient
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePatientDto'
 *     responses:
 *       201:
 *         description: Created successfully
 *         contents:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Email already existed
 *         contents:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Failure'
 */

router.post('/patients', (req, res) => {
    const date = new Date();
    let sql = `INSERT INTO patient (dev_id, first_name, last_name, email, phone, created_on, modified_on, status) VALUES (@dev_id, @first_name, @last_name, @email, @phone, @created_on, @modified_on, @status)`;
    const request = new Request(sql, (err) => {
        if(err)
            return res.status(400).send({
                    message: 'Error when create new patient',
                    code: 400,
                });
    });

    request.addParameter('dev_id', TYPES.Int, req.body.dev_id || 0);
    request.addParameter('first_name', TYPES.VarChar, req.body.first_name);
    request.addParameter('last_name', TYPES.VarChar, req.body.last_name);
    request.addParameter('email', TYPES.VarChar, req.body.email);
    request.addParameter('phone', TYPES.VarChar, req.body.phone);
    request.addParameter('created_on', TYPES.DateTime, date);
    request.addParameter('modified_on', TYPES.DateTime, date);
    request.addParameter('status', TYPES.Int, req.body.status || 0);

    request.on('requestCompleted', () =>
        res.status(200).send({
            message: 'success',
            code: 200,
        })
    );
    connection.execSql(request);
});

/**
 * @swagger
 * /api/admin/patients/{patientId}:
 *   put:
 *     summary: Assign a patient with a doctor
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/UpdateSuccess'
 *       400:
 *         description: Failure
 *         content:
 *           application/json:
 *             schema:
 *                 #ref: '#/components/schemas/Failure'  
 */

// TODO assign patient to a doctor
router.put('/patients/:patientId', (req, res) => {
    const date = new Date();
    const sql = `update patient set doctor_id = @doctor_id where patient.pat_id = @pat_id`;

    const request = new Request(sql, (err) => {
        if (err) {
            return res.status(400).send({
                message: 'Patient not existed',
                code: 400,
            });
        }
    });
    request.addParameter('modified_on', TYPES.DateTime, date);
    request.addParameter('doctor_id', TYPES.Int, req.body.doctor_id);
    request.addParameter('pat_id', TYPES.Int, req.params.patientId);

    request.on('requestCompleted', () =>
        res.status(200).send({
            message: 'success',
            code: 200,
        })
    );
    connection.execSql(request);
});

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Returns the list of all users
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: The list of the users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserResponseDto'
 */
router.get('/users', (req, res) => {
    let sql = `SELECT * FROM users order by users.id`;
    const request = new Request(sql, (err) => {
        if (err) throw `Err on getAllPatients api`;
    });
    const resdata = [];

    request.on('row', (cols) => {
        for (const key in cols) {
            if (Object.hasOwnProperty.call(cols, key)) {
                cols[key] = cols[key].value;
            }
        }
        resdata.push(cols);
    });

    request.on('requestCompleted', () => {
        return res.send(resdata);
    });

    connection.execSql(request);
});
module.exports = router;
