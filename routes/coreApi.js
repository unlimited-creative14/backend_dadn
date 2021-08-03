var express = require('express');
var router = express.Router();
const { Request, TYPES } = require('tedious');
const swaggerJSDoc = require('swagger-jsdoc');

var db = require('../cores/azure_db');

connection = db.connection;

// TODO qtyt schema
/**
 * @swagger
 * components:
 *   schemas:
 *     qtytResponseDto:
 *       type: object
 *       properties:
 *         warning_level:
 *           type: int
 *           description: The int number from 0 - 3
 *         temp_from:
 *           type: float
 *           description: The lowest temperature of this warning level
 *         temp_to:
 *           type: float
 *           description: The highest temperature of this warning level
 *         duration:
 *           type: float
 *           description: The time in this warning level
 *       example:
 *         warning_level: 1
 *         temp_from: 27
 *         temp_to: 28
 *         duration: 15
 */
// TODO UserResponseDto Schema
/**
 * @swagger
 * components:
 *   schemas:
 *     DeviceResponseDto:
 *       type: object
 *       properties:
 *         dev_id:
 *           type: int
 *           description: The id of a device
 *         feed_in:
 *           type: string
 *           description: The feed_in of a device
 *         feed_out:
 *           type: string
 *           description: The feed_out of a device
 *         iokey:
 *           type: string
 *           description: The iokey of the device
 *         username:
 *           type: string
 *           description: The username of a device
 *       example:
 *         dev_id: 1
 *         feed_in: username/feeds/name
 *         feed_out: username/feeds/name
 *         iokey: anIOkey
 *         username: malongnhan
 */

/**
 * @swagger
 * /both/qtyt:
 *   get:
 *     summary: Returns the list qtyt
 *     tags: [Both]
 *     responses:
 *       200:
 *         description: The list of the qtyt
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/qtytResponseDto'
 */
router.get('/qtyt', function (req, res, next) {
    const request = db.queryQtyt();
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
        res.status(200).send(resdata);
    });

    connection.execSql(request);
});

/**
 * @swagger
 * /both/qtyt/{level}:
 *   get:
 *     summary: Returns the list qtyt
 *     tags: [Both]
 *     parameters:
 *       - in: path
 *         name: level
 *         schema:
 *           type: string
 *         required: true
 *         description: The warning level of the qtyt
 *     responses:
 *       200:
 *         description: The information of the qtyt
 *         contents:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/qtytResponseDto'
 *       404:
 *         description: The qtyt was not found
 */
router.get('/qtyt/:level', function (req, res, next) {
    if (req.params['level'] > '3' || req.params['level'] < '0') {
        return res.status(404).send({
            message: 'qtyt not found',
            code: 400,
        });
    }

    const request = db.queryQtyt(req.params['level']);
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
        res.status(200).send(resdata);
    });

    connection.execSql(request);
});

/**
 * @swagger
 * /both/device/{inuse}:
 *   get:
 *     summary: Returns the list of all the patients of this use
 *     tags: [Both]
 *     parameters:
 *       - in: path
 *         name: inuse
 *         schema:
 *           type: string
 *         required: false
 *         description: inuse = true | false | undefined
 *     responses:
 *       200:
 *         description: The list of the device if(inuse is true/false/undefine)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DeviceResponseDto'
 */

// get device
router.get('/device/:inuse?', (req, res) => {
    const request = db.queryDevice(req.params.inuse);
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
        res.status(200).send(resdata);
    });

    connection.execSql(request);
});

/**
 * @swagger
 * /both/devices/{deviceId}:
 *   get:
 *     summary: Returns information of all the patients of this use
 *     tags: [Both]
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         schema:
 *           type: string
 *         required: false
 *         description: 1
 *     responses:
 *       200:
 *         description: The information of a device by id
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/DeviceResponseDto'
 */
router.get('/devices/:deviceId', (req, res) => {
    const sql = `SELECT * FROM device where dev_id = @deviceId`;

    const request = new Request(sql, (err) => {
        if (err) {
            return res.status(400).send({
                message: 'error when get device by id',
                code: 400,
            });
        }
    });
    request.addParameter('deviceId', TYPES.Int, req.params.deviceId);
    let result;
    request.on('row', (cols) => {
        for (const key in cols) {
            if (Object.hasOwnProperty.call(cols, key)) {
                cols[key] = cols[key].value;
            }
        }
        result = cols;
    });
    request.on('requestCompleted', (err) => {
        res.status(200).send(result);
    });

    connection.execSql(request);
});

module.exports = router;
