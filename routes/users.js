const express = require('express');
const router = express.Router();
const db = require('../cores/azure_db');
const { Request, TYPES } = require('tedious');
const swaggerJSDoc = require('swagger-jsdoc');
const connection = db.connection;
// done event may fall in to 1 of 3 events below
function onSqlDone(sqlreq, cb) {
    sqlreq.on('done', cb);
    sqlreq.on('doneProc', cb);
    sqlreq.on('doneInProc', cb);
}
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
 *         status:
 *           type: int
 *           description: The number indicate the status of the patient
 *       example:
 *         pat_id: 1
 *         first_name: long
 *         last_name: nguyen
 *         email: malongnhan@gmail.com
 *         phone: 0346156078
 *         created_on: 2020-12-12T00:00:00.0000000
 *         modified_on: 2020-12-12T00:00:00.0000000
 *         dev_id: 1
 *         doctor_id: 1
 *         status: 1
 */

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
 *     summary: Returns the list of all the patients
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
    if (!req.query.name) sql = `SELECT * FROM patient ORDER BY pat_id desc`;
    else
        sql = `SELECT * FROM patient WHERE patient.first_name LIKE @query OR patient.last_name LIKE @query order by pat_id desc`;
    const request = new Request(sql, (err) => {
        if (err) throw `Err on getAllPatients api`;
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

/**
 * @swagger
 * /users/patients:
 *   post:
 *     summary: Create a new patient
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Patients'
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
    const request = new Request(sql, (err) => {
        if (err)
            res.send({
                status: 400,
                message: 'This patient was not found',
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

/**
 * @swagger
 * /users/patients:
 *   put:
 *     summary: Modify information of a patient
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Patients'
 *     responses:
 *       200:
 *         description: The patient was successfully modified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patients'
 *       500:
 *         description: Some server error
 */
router.put('/patients/:patientId', (req, res) => {
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

/**
 * @swagger
 * /users/patients/{patientId}/treatments:
 *   post:
 *     summary: Insert a new treatment to a patient
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
 *             $ref: '#/components/schemas/Success'
 *     responses:
 *       200:
 *         description: Insert a new treatment successfully
 *         contents:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       500:
 *         contents:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */

router.post('/patients/:patientId/treatments', (req, res) => {
    const date = new Date();
    const sql = `insert into treatment_patient (treatment_id, patient_id, last_modified) values(@treatment_id, @patient_id, @last_modified)`;
    const request = new Request(sql, (err) => {
        if (err)
            res.send({
                status: 400,
                message: 'This patient was not found',
            });
    });
    request.addParameter('treatment_id', TYPES.Int, req.body.treatmentId);
    request.addParameter('patient_id', TYPES.Int, parseInt(req.params.patientId));
    request.addParameter('last_modified', TYPES.DateTime, date);
    request.on('requestCompleted', () =>
        res.status(200).send({
            message: 'success',
            code: '200',
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
 */

router.get('/patients/:patientId/treatments', (req, res) => {
    const sql = `select * from treatment_patient where treatment_id in (select treatment_id from treatment_patient where patient_id = @patient_id)`;
    const request = new Request(sql, (err) => {
        if (err)
            res.send({
                status: 400,
                message: 'This patient was not found',
            });
    });

    request.addParameter('patient_id', TYPES.Int, parseInt(req.params.patientId))
    let result = [];
    request.on('row', (cols) => {
        for (const key in cols) {
            if (Object.hasOwnProperty.call(cols, key)) {
                cols[key] = cols[key].value;
            }
        }
        result.push(cols);
    });
    onSqlDone(request, () => {
        if (!res.headersSent) return res.send(result);
    });
    connection.execSql(request);
});

// router.get('/profile', (req, res) => {
//     const sql = `select * from users where treatment_id in (select treatment_id from treatment_patient where patient_id = ${req.params.patientId});`;
//     const request = new Request(sql, (err) => {
//         if (err)
//             res.send({
//                 status: 400,
//                 message: 'This patient was not found',
//             });
//     });

//     let result = [];
//     request.on('row', (cols) => {
//         for (const key in cols) {
//             if (Object.hasOwnProperty.call(cols, key)) {
//                 cols[key] = cols[key].value;
//             }
//         }
//         result.push(cols);
//     });
//     onSqlDone(request, (a, b, c) => {
//         if (!res.headersSent) return res.send(result);
//     });
//     connection.execSql(request);
// });
module.exports = router;
