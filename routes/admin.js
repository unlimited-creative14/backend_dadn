const express = require('express');
const router = express.Router();
const db = require('../cores/azure_db');
const { Request, TYPES } = require('tedious');
const bcryptjs = require('bcryptjs');
const { registerValidation } = require('../utils/validation');
const swaggerJSDoc = require('swagger-jsdoc');
const connection = db.connection;
const dotenv = require('dotenv');
dotenv.config();

// TODO PatientResponseDto Schema
/**
 * @swagger
 * components:
 *   schemas:
 *     PatientResponseDto:
 *       type: object
 *       properties:
 *         pat_id:
 *           type: int
 *           description: The auto-generated id of the patient
 *         first_name:
 *           type: string
 *           description: The first name of the patient
 *         last_name:
 *           type: string
 *           description: The last name of the patient
 *         email:
 *           type: string
 *           description: The email of the patient
 *         phone:
 *           type: string
 *           description: The phone number of the patient
 *         created_on:
 *           type: date time
 *           description: the date and time that patient enter the hospital
 *         modified_on:
 *           type: date time
 *           description: the last time that patient modified
 *         dev_id:
 *           type: int
 *           description: The id of the device of the patient
 *         doctor_id:
 *           type: int
 *           description: The id of the doctor who cares for this patient
 *         status_id:
 *           type: int
 *           description: The status of the patient;
 *       example:
 *         pat_id: 1
 *         first_name: long
 *         last_name: nguyen
 *         email: malongnhan@gmail.com
 *         phone: "0346156078"
 *         created_on: 2020-12-12T00:00:00.0000000
 *         modified_on: 2020-12-12T00:00:00.0000000
 *         dev_id: 1
 *         doctor_id: 1
 *         status: 1
 */
// TODO Create Device Dto
/**
 * @swagger
 * components:
 *   schemas:
 *     CreateDeviceDto:
 *       type: object
 *       properties:
 *         feed_in:
 *           type: string
 *           description: mqtt feed_in
 *         feed_out:
 *           type: string
 *           description: mqtt feed_out
 *         iokey:
 *           type: string
 *           description: The iokey of the device
 *         username:
 *           type: string
 *           description: The username of a device
 *       example:
 *         feed_in: "malongnhan/feeds/server"
 *         feed_out: "malongnhan/feeds/anotherfeed"
 *         iokey: anIOkey
 *         username: malongnhan
 */

// TODO Update Qtyt Dto
/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateQtytDto:
 *       type: object
 *       properties:
 *         warning_level:
 *           type: int
 *           description: a number 0 - 3
 *         temp_from:
 *           type: float
 *           description: a float number
 *         temp_to:
 *           type: float
 *           description: a float number
 *         duration:
 *           type: float
 *           description: a float number
 *       example:
 *         doctor_id: 1
 *         temp_from: 26
 *         temp_to: 27
 *         duration: 15
 *
 */

// TODO Assign Patient Dto
/**
 * @swagger
 * components:
 *   schemas:
 *     AssignPatientDto:
 *       type: object
 *       properties:
 *         doctor_id:
 *           type: int
 *           description: 1
 *       example:
 *         doctor_id: 1
 */
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
 *         doctor_id:
 *           type: int
 *           description: The id of the doctor if needed
 *       example:
 *         dev_id: 1
 *         email: malongnhan@gmail.com
 *         first_name: long
 *         last_name: nguyen
 *         phone: "0346156078"
 *         doctor_id: 1
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

//TODO Create user DTO
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
 *         first_name:
 *           type: string
 *           description: long
 *         last_name:
 *           type: string
 *           description: nguyen
 *         cmnd:
 *           type: string
 *           description: "241222345"
 *       example:
 *         email: nguyenphilong@gmail.com
 *         password: nguyenphilong
 *         role: 1
 *         first_name: long
 *         last_name: nguyen
 *         cmnd: 241809999
 */

// TODO Insert a new user
/**
 * @swagger
 * /admin/user:
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
        let sql = `INSERT INTO users (email, password, role, created_on, modified_on,
        first_name, last_name, cmnd) VALUES (@email, @password, @role,  @created_on, @modified_on, @first_name, @last_name, @cmnd)`;

        const request = new Request(sql, (err) => {
            if (err) {
                return res.status(400).send({
                    message: 'Error on create new user',
                    code: 400,
                });
            }
        });
        request.addParameter('email', TYPES.VarChar, req.body.email);
        request.addParameter('password', TYPES.VarChar, hashedPassword);
        request.addParameter('created_on', TYPES.DateTime, date);
        request.addParameter('modified_on', TYPES.DateTime, date);
        request.addParameter('role', TYPES.Int, req.body.role || 0);
        request.addParameter('first_name', TYPES.VarChar, req.body.first_name);
        request.addParameter('last_name', TYPES.VarChar, req.body.last_name);
        request.addParameter('cmnd', TYPES.VarChar, req.body.cmnd);

        request.on('requestCompleted', () =>
            res.status(201).send({
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
 * /admin/patients:
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
    let sql = `INSERT INTO patient (dev_id, first_name, last_name, email, phone, created_on, modified_on, doctor_id) VALUES (@dev_id, @first_name, @last_name, @email, @phone, @created_on, @modified_on, @doctor_id)`;
    const request = new Request(sql, (err) => {
        if (err)
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
    request.addParameter('doctor_id', TYPES.Int, req.body.doctor_id || 0);

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
 * /admin/patients/{patientId}:
 *   put:
 *     summary: Assign a patient with a doctor
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignPatientDto'
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
 * /admin/users:
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

/**
 * @swagger
 * /admin/qtyt:
 *   put:
 *     summary: Update QTYT
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateQtytDto'
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

// update qtyt
router.put('/qtyt', (req, res) => {
    if (req.body.warning_level > '3' || req.body.warning_level < 0) {
        return res.status(404).send('Not found!');
    }

    const request = db.updateQtyt(req.body);
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
 * /admin/device:
 *   post:
 *     summary: Create new device
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDeviceDto'
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
// TODO Add new device
router.post('/device', (req, res) => {
    const sql =
        'insert into device (feed_in, feed_out, iokey, username) values(@feed_in, @feed_out, @iokey, @username)';
    const request = new Request(sql, (err) => {
        if (err)
            return res.status(400).send({
                message: 'Error when create request',
                code: 400,
            });
    });
    try {
        request.addParameter('feed_in', TYPES.VarChar, req.body.feed_in);
        request.addParameter('feed_out', TYPES.VarChar, req.body.feed_out);
        request.addParameter('iokey', TYPES.VarChar, req.body.iokey);
        request.addParameter('username', TYPES.VarChar, req.body.username);
    } catch (err) {
        return res.status(400).send({
            message: 'Invalid format',
            code: 400,
        });
    }

    request.on('requestCompleted', () => {
        return res.status(200).send({
            message: 'success',
            code: 200,
        });
    });
    connection.execSql(request);
});

/**
 * @swagger
 * /admin/patients:
 *   get:
 *     summary: Returns the list of all patients
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: The list of the patients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PatientResponseDto'
 */
// TODO Get all patients
router.get('/patients', (req, res) => {
    let sql = `SELECT * FROM patient order by patient.pat_id`;
    const request = new Request(sql, (err) => {
        if (err)
            return res.status(400).send({
                message: 'Err on admin get all patients request',
                code: 400,
            });
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

/**
 * @swagger
 * /admin/doctor/{doctor_id}/patients:
 *   get:
 *     summary: Returns the list of all patients
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: doctor_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The id of the doctor
 *     responses:
 *       200:
 *         description: The list of the patients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PatientResponseDto'
 */
// TODO Admin get all patients of a doctor by doctor_id
router.get('/doctor/:doctor_id/patients', (req, res) => {
    let sql = `SELECT * FROM patient where patient.doctor_id = @doctor_id`;
    const request = new Request(sql, (err) => {
        if (err)
            return res.status(400).send({
                message:
                    'Err on admin get all patients of a doctor by doctor_id request',
                code: 400,
            });
    });
    const resdata = [];
    request.addParameter('doctor_id', TYPES.Int, req.params.doctor_id);
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

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdatePatientDto:
 *       type: object
 *       properties:
 *         first_name:
 *           type: string
 *           description: The first name of the patient
 *         last_name:
 *           type: string
 *           description: The last name of the patient
 *         email:
 *           type: string
 *           description: The email of the patient
 *         phone:
 *           type: string
 *           description: The phone number of the patient
 *         dev_id:
 *           type: int
 *           description: The id of the device that measure the patient's temperature
 *         doctor_id:
 *           type: int
 *           description: The id of the doctor who cares for this patient
 *       example:
 *         first_name: long
 *         last_name: nguyen
 *         email: malongnhan@gmail.com
 *         phone: "0346156078"
 *         dev_id: 1
 *         doctor_id: 1
 */

/**
 * @swagger
 * /admin/patients/{patientId}/update:
 *   put:
 *     summary: Update patient information
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         schema:
 *           type: string
 *         required: true
 *         description: The id of the doctor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePatientDto'
 *     responses:
 *       200:
 *         description: Created Successfully
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/UpdateSuccess'
 */
router.put('/patients/:patientId/update', (req, res) => {
    const date = new Date();
    const sql = `update patient set first_name = @first_name, last_name = @last_name, doctor_id = @doctor_id, modified_on = @modified_on, dev_id = @dev_id, phone = @phone, email= @email where patient.pat_id = @pat_id`;

    const request = new Request(sql, (err) => {
        if (err) {
            return res.status(400).send({
                message: 'Patient not existed',
                code: 400,
            });
        }
    });
    request.addParameter('first_name', TYPES.VarChar, req.body.first_name || 0);
    request.addParameter('last_name', TYPES.VarChar, req.body.last_name || 0);
    request.addParameter('doctor_id', TYPES.Int, req.body.doctor_id || 0);
    request.addParameter('modified_on', TYPES.DateTime, date);
    request.addParameter('dev_id', TYPES.Int, req.body.dev_id || 0);
    request.addParameter('phone', TYPES.VarChar, req.body.phone);
    request.addParameter('email', TYPES.VarChar, req.body.email);
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
 * components:
 *   schemas:
 *     UpdateUserDto:
 *       type: object
 *       properties:
 *         first_name:
 *           type: string
 *           description: The first name of the user
 *         last_name:
 *           type: string
 *           description: The last name of the user
 *         email:
 *           type: string
 *           description: The email of the user
 *         cmnd:
 *           type: string
 *           description: The SSID number of the user
 *         role:
 *           type: int
 *           description: The role of the user
 *       example:
 *         first_name: long
 *         last_name: nguyen
 *         email: malongnhan@gmail.com
 *         cmnd: "0346156078"
 *         role: 0
 *
 */

/**
 * @swagger
 * /admin/user/{userId}/update:
 *   put:
 *     summary: Update user information
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The id of the doctor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserDto'
 *     responses:
 *       200:
 *         description: Created Successfully
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/UpdateSuccess'
 */
router.put('/user/:userId/update', (req, res) => {
    const date = new Date();
    const sql = `update users set first_name = @first_name, last_name = @last_name, modified_on = @modified_on, email= @email, role = @role, cmnd = @cmnd where users.id = @userId`;

    const request = new Request(sql, (err) => {
        if (err) {
            console.log(err);
            return res.status(400).send({
                message: 'Patient not existed',
                code: 400,
            });
        }
    });
    request.addParameter('first_name', TYPES.VarChar, req.body.first_name || 0);
    request.addParameter('last_name', TYPES.VarChar, req.body.last_name || 0);
    request.addParameter('modified_on', TYPES.DateTime, date);
    request.addParameter('cmnd', TYPES.VarChar, req.body.cmnd);
    request.addParameter('email', TYPES.VarChar, req.body.email);
    request.addParameter('userId', TYPES.Int, req.params.userId);
    request.addParameter('role', TYPES.Int, req.body.role || 0);

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
 * /admin/patients/{patientId}:
 *   delete:
 *     summary: Hard delete patient
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         schema:
 *           type: string
 *         required: true
 *         description: The id of the patient
 *     responses:
 *       200:
 *         description: Deleted Successfully
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/UpdateSuccess'
 */
router.delete('/patients/:patientId', (req, res) => {
    const sql = `delete from patient where pat_id = @patientId`;

    const request = new Request(sql, (err) => {
        if (err) {
            return res.status(400).send({
                message: 'Patient not existed',
                code: 400,
            });
        }
    });

    request.addParameter('patientId', TYPES.Int, req.params.patientId);
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
 * /admin/user/{userId}:
 *   delete:
 *     summary: Hard delete user
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The id of the doctor
 *     responses:
 *       200:
 *         description: Deleted Successfully
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/UpdateSuccess'
 */
router.delete('/user/:userId', (req, res) => {
    const sql = `delete from users where users.id = @id`;

    const request = new Request(sql, (err) => {
        if (err) {
            return res.status(400).send({
                message: 'Patient not existed',
                code: 400,
            });
        }
    });

    request.addParameter('id', TYPES.Int, req.params.userId);

    request.on('requestCompleted', () =>
        res.status(200).send({
            message: 'success',
            code: 200,
        })
    );
    connection.execSql(request);
});
module.exports = router;
