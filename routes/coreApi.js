var express = require('express');
var router = express.Router();
var db = require('../cores/azure_db');

connection = db.connection;
// list all qtyt

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

// list qtyt with id
router.get('/qtyt/:level', function (req, res, next) {
    if (req.params['level'] > '3' || req.params['level'] < '0') {
        return res.status(404).send('Not found!');
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

module.exports = router;
