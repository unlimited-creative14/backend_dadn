var express = require('express');
var router = express.Router();
var db = require('../cores/azure_db');

connection = db.newConnection();
// list all qtyt
router.get('/getQtyt', function (req, res, next) {
    rq = db.queryQtyt();
    data = [];
    rq.on('row', (cols) => {
        db.removeMetadata(cols);
        data.push(cols);
    });
    rq.on('requestCompleted', () => {
        console.log('done');
        res.json(data);
    });

    db.connection.execSql(rq);
});

// list qtyt with id
router.get('/getQtyt/:level', function (req, res, next) {
    if (req.params['level'] > '3' || req.params['level'] < '0') {
        res.status(404).send('Not found!');
        return;
    }

    rq = db.queryQtyt(req.params['level']);
    data = [];
    rq.on('row', (cols) => {
        db.removeMetadata(cols);
        data.push(cols);
    });
    rq.on('requestCompleted', () => {
        res.json(data);
    });

    db.connection.execSql(rq);
});

// update qtyt
router.post('/updateQtyt', (req, res) => {
    if (req.body.warning_level > '3' || req.body.warning_level < 0) {
        res.status(404).send('Not found!');
        return;
    }

    rb = db.updateQtyt(req.body);
    rb.on('requestCompleted', () => res.status(200).send('Ok'));

    db.connection.execSql(rb);
});

// get device
router.get('/getDevice/:inuse?', (req, res) => {
    if (req.params.inuse != undefined) {
        if (req.params.inuse != 'inuse') {
            res.status(404).send('Not Found!');
            return;
        }
    }
    var inuse =
        req.params.inuse == undefined ? undefined : req.params.inuse == 'inuse';
    var rq = db.queryDevice(req.params.inuse);
    data = [];
    rq.on('row', (col) => {
        db.removeMetadata(col);
        data.push(col);
    });

    rq.on('requestCompleted', () => res.json(data));

    db.connection.execSql(rq);
});

module.exports = router;
