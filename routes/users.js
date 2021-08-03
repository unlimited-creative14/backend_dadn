const express = require('express');
const router = express.Router();
const db = require('../cores/azure_db');
const { Request, TYPES } = require('tedious');
const swaggerJSDoc = require('swagger-jsdoc');
const connection = db.connection;
const dotenv = require('dotenv');
dotenv.config();

//TODO CreatePatientDto Schema
/**
 * @swagger
 * components:
 *   schemas:
 *     CreatePatientDto:
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
 *         dev_id: 15
 *         doctor_id: 1
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

//TODO UpdatePatientDto Schema
/**
 * @swagger
 * components:
 *   schemas:
 *     UpdatePatientDto:
 *       type: object
 *       properties:
 *         dev_id:
 *           type: int
 *           description: The id of the device that measure the patient's temperature
 *       example:
 *         dev_id: 1
 */
// TODO Patients schema
/**
 * @swagger
 * components:
 *   schemas:
 *     Patients:
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
 *           description: the date and time that user enter the hospital
 *         modified_on:
 *           type: date time
 *           description: the last time that user modified
 *         dev_id:
 *           type: int
 *           description: The id of the device that measure the patient's temperature
 *         doctor_id:
 *           type: int
 *           description: The id of the doctor who cares for this patient
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
 */

// TODO Failure schema
/**
 * @swagger
 * components:
 *   schemas:
 *     Failure:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Failure
 *         code:
 *           type: int
 *           description: 400
 *       example:
 *         message: Failure
 *         code: 400
 */

//TODO Profile schema
/**
 * @swagger
 * components:
 *   schemas:
 *     Profile:
 *       type: object
 *       properties:
 *         id:
 *           type: int
 *           description: 14
 *         email:
 *           type: string
 *           description: malongnhan@gmail.com
 *         created_on:
 *           type: string
 *           description: 2021-07-24T00:00:00.000Z
 *         modified_on:
 *           type: string
 *           description: 2021-07-24T00:00:00.000Z
 *         role:
 *           type: int
 *           description: 0
 *       example:
 *         id: 14
 *         email: long.nguyenmalongnhan@hcmut.edu.vn
 *         created_on: 2020-12-12T00:00:00.0000000
 *         modified_on: 2020-12-12T00:00:00.0000000
 *         role: 0
 */

// TODO TreatmentDetail Schema
/**
 * @swagger
 * components:
 *   schemas:
 *     TreatmentDetail:
 *       type: object
 *       properties:
 *         treatment_id:
 *           type: int
 *           description: The auto-generated id of the treatment
 *         treatment_name:
 *           type: string
 *           description: The name of the treatment
 *         treatment_time:
 *           type: date time
 *           description: The time the user applied this treatment
 *         treatment_desc:
 *           type: string
 *           description: The desc of the treatment
 *       example:
 *         treatment_id: 1
 *         treatment_name: do hematocrit1
 *         treatment_time: null
 *         treatment_desc: fhewohoih
 *
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Treatments:
 *       type: object
 *       properties:
 *         treatment_id:
 *           type: int
 *           description: The auto-generated id of the patient
 *       example:
 *         treatment_id: 1
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Success:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: created success fully
 *         code:
 *           type: int
 *           description: 200
 *       example:
 *         treatment_id: 1
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Unexpected error occurred
 *         code:
 *           type: int
 *           description: 500
 *       example:
 *         treatment_id: 1
 */

/**
 * @swagger
 * /users/patients:
 *   get:
 *     summary: Returns the list of all the patients of this us
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: The list of the books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Patients'
 */
router.get('/patients', (req, res) => {
    let sql;
    if (!req.query.name)
        sql = `SELECT * FROM patient where patient.doctor_id = @doctor_id`;
    else
        sql = `SELECT * FROM patient WHERE patient.first_name LIKE @query OR patient.last_name LIKE @query and patient.doctor_id = @doctor_id order by pat_id desc `;
    const request = new Request(sql, (err) => {
        if (err)
            res.send({
                message: 'Error on get all patient in users',
                code: 400,
            });
    });
    const resdata = [];
    request.addParameter('doctor_id', TYPES.Int, req.user.id.value);
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

    request.on('requestCompleted', () => {
        res.status(200).send(resdata);
        // resdata.map(data => {
        //     const newRequest = new Request('select top 1 * from temp_history where pat_id = @pat_id', (err) => {
        //         if (err) return res.send({
        //             message: 'Error when return temperature for all patient',
        //             code: 400
        //         });
        //     });
        //     newRequest.addParameter('pat_id', TYPES.Int, data.pat_id);
        //     newRequest.on('row', cols => {
        //         for (const key in cols) {
        //             if (Object.hasOwnProperty.call(cols, key)) {
        //                 cols[key] = cols[key].value;
        //             }
        //         }
        //         data.tempHistory = cols;
        //     });
        //     newRequest.on('requestCompleted', () => {
        //         console.log('request completed');
        //      });
        //     connection.execSql(newRequest);
        //  });
    });

    connection.execSql(request);
});

/**
 * @swagger
 * /users/patients:
 *   post:
 *     summary: Doctor create a new patient
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePatientDto'
 *     responses:
 *       201:
 *         description: The patient was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patients'
 *       500:
 *         description: Some server error
 */
router.post('/patients', (req, res) => {
    const date = new Date();
    let sql = `INSERT INTO patient (dev_id, first_name, last_name, email, phone, created_on, modified_on, doctor_id) VALUES (@dev_id, @first_name, @last_name, @email, @phone, @created_on, @modified_on, @doctor_id)`;
    const request = new Request(sql, (err) => {
        if (err)
            return res.status(400).send({
                message: 'Patient not existed',
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
 * /users/patients/{patientId}:
 *   get:
 *     summary: Get the patient by id
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         schema:
 *           type: string
 *         required: true
 *         description: The patient id
 *     responses:
 *       200:
 *         description: Get information of a user by id
 *         contents:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patients'
 *       404:
 *         description: The patient was not found
 */
router.get('/patients/:patientId', (req, res) => {
    const sql = `select * from patient where patient.pat_id = @patientId`;
    let result = new Object();
    const request = new Request(sql, (err) => {
        if (err)
            return res.send({
                message: 'This patient was not found',
                code: 400,
            });
    });
    request.addParameter('patientId', TYPES.Int, req.params.patientId);
    request.on('row', (cols) => {
        if (cols.length == 0) return res.send({
            message: `There's no patient with ${req.params.patientId} ID`,
            code: 400,
        });
        for (const key in cols) {
            if (Object.hasOwnProperty.call(cols, key)) {
                cols[key] = cols[key].value;
            }
        }
        result = cols;
    });
    request.on('requestCompleted', () => {
        if (!result.pat_id) return res.send({
            message: `There's no patient with id = ${req.params.patientId}`,
            code: 400,
        });
        result.tempHistory = [];
        const newSql = `select top 10 * from temp_history where pat_id = @patientId order by recv_time desc`;
        const newRequest = new Request(newSql, err => {
            if (err)
                return res.send({
                    message: 'Error when get temperature of the patient',
                    code: 400,
                });
        });
        newRequest.addParameter('patientId', TYPES.Int, req.params.patientId);
        newRequest.on('row', (cols) => {
            for (const key in cols) {
                if (Object.hasOwnProperty.call(cols, key)) {
                    cols[key] = cols[key].value;
                }
            }
            result.tempHistory.push(cols);
        });
        console.log(result);
        newRequest.on('requestCompleted', () => {
            res.send(result)
        })
        connection.execSql(newRequest);

    });
    connection.execSql(request);
});

/**
 * @swagger
 * /users/patients/{patientId}:
 *   put:
 *     summary: Modify information of a patient
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         schema:
 *           type: string
 *         required: true
 *         description: The patient id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePatientDto'
 *     responses:
 *       200:
 *         description: The patient was successfully modified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateSuccess'
 *       400:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Failure'
 */
router.put('/patients/:patientId', (req, res) => {
    const date = new Date();
    const sql = `update patient set modified_on = @modified_on, dev_id = @dev_id where patient.pat_id = @pat_id`;

    const request = new Request(sql, (err) => {
        if (err) {
            return res.status(400).send({
                message: 'Patient not existed',
                code: 400,
            });
        }
    });
    request.addParameter('modified_on', TYPES.DateTime, date);
    request.addParameter('dev_id', TYPES.Int, req.body.dev_id || 0);
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
 * /users/patients/{patientId}/treatments:
 *   get:
 *     summary: Returns the list treatments that users have been used
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: patientId
 *         schema:
 *           type: string
 *         required: true
 *         description: The patient id
 *     responses:
 *       200:
 *         description: The list of the treatments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TreatmentDetail'
 *       400:
 *         contents:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Failure'
 */

router.get('/patients/:patientId/treatments', (req, res) => {
    const sql = `select * from treatment_patient where treatment_id in (select treatment_id from treatment_patient where patient_id = @patient_id)`;
    const request = new Request(sql, (err) => {
        if (err)
            res.send({
                message: 'This patient was not found',
                code: 400,
            });
    });

    request.addParameter(
        'patient_id',
        TYPES.Int,
        parseInt(req.params.patientId)
    );
    let result = [];
    request.on('row', (cols) => {
        for (const key in cols) {
            if (Object.hasOwnProperty.call(cols, key)) {
                cols[key] = cols[key].value;
            }
        }
        result.push(cols);
    });
    request.on('requestCompleted', () =>
            res.send(result)
        );
    connection.execSql(request);
});

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Return the profile of user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/Profile'
 */

router.get('/profile', (req, res) => {
    res.send({
        id: req.user.id.value,
        email: req.user.email.value,
        created_on: req.user.created_on.value,
        modified_on: req.user.modified_on.value,
        role: req.user.role.value,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        cmnd: req.user.cmnd,
    });
});

module.exports = router;
