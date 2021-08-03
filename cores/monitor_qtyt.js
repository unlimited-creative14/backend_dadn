const db = require('./azure_db');
const mqtt = require('./mqtt_rel');
let events = require('events');
const { Request, TYPES } = require('tedious');
let eventEmitter = new events.EventEmitter();

let qtyt = [];
let activeMonitors = {};
class monitor {
    constructor(pat_id, device) {
        this.mqttconnection = mqtt.CreateMQTTClient(
            device.username.value,
            device.iokey.value,
            device.feed_in.value
        );
        console.log('monitor');
        this.pat_id = pat_id;
        this.dbConnection = db.newConnection();
        this.device = device;
        let thiz = this;
        this.dbConnection.on('connect', () => {
            console.log('init dev: ' + device.feed_in.value);
            thiz.mqttconnection.on('message', function (topic, message) {
                // message is Buffer
                // Parse and process message here
                if (topic == thiz.device.feed_in.value) {
                    // {"id":"7","name":"TEMP-HUMID","data":"x-y","unit":"*C-%"}
                    let tempSensor = JSON.parse(message);
                    try {
                        let data = tempSensor['data'];
                        let temp = data.split('-')[0];
                        let time = Date.now();

                        let request = db.putTempData(thiz.pat_id, time, temp);
                        request.on('row', (col) =>
                            activeMonitors[thiz.pat_id].putData(col)
                        );
                        thiz.dbConnection.execSql(request);
                    } catch (error) {
                        console.log(error + '\n' + 'message:' + message);
                    }
                }
            });
            this.init_data();
        });
        this.qtytMonitor = {
            0: [],
            1: [],
            2: [],
            3: [],
        };
        this.qtytAvg = [0, 0, 0, 0];
        this.dbConnection.connect();
    }

    init_data() {
        // load data needed by qtyt
        let request = [];
        request.push(db.queryTempData(this.pat_id, qtyt[0].duration.value));
        request.push(db.queryTempData(this.pat_id, qtyt[1].duration.value));
        request.push(db.queryTempData(this.pat_id, qtyt[2].duration.value));
        request.push(db.queryTempData(this.pat_id, qtyt[3].duration.value));
        for (let i = 0; i < 4; i++) {
            request[i].on('row', (cols) => this.qtytMonitor[i].push(cols));
        }

        request[0].on('requestCompleted', () => {
            request[1].on('requestCompleted', () => {
                request[2].on('requestCompleted', () => {
                    request[3].on('requestCompleted', () => {
                        this.nextThing();
                    });
                    this.dbConnection.execSql(request[3]);
                });
                this.dbConnection.execSql(request[2]);
            });
            this.dbConnection.execSql(request[1]);
        });
        this.dbConnection.execSql(request[0]);
    }

    nextThing() {
        console.log('Load qtyt done');
        // calc avg
        for (let i = 0; i < 4; i++) {
            if (this.qtytMonitor[i].length != 0) {
                let x = this.qtytMonitor[i].reduce(
                    (a, b) => a + b.temp_value.value,
                    0
                );
                let y = this.qtytMonitor[i].length;

                this.qtytAvg[i] = x / y;
            } else {
                this.qtytAvg[i] = 0;
            }
        }
        console.log(`Monitor pat_id=${this.pat_id} started`);
    }

    // put next value to monitor
    putData(newValue) {
        let now = new Date(Date.now());
        for (let i = 0; i < 4; i++) {
            // push new value to 4 sample qtyt data array
            // while pop out value which is "outdated"
            let currLength = this.qtytMonitor[i].length;
            this.qtytMonitor[i].push(newValue);
            let popped = 0;

            // only process data if there are atleast 10 data points
            if (this.qtytMonitor[i].length < 0) continue;

            while (
                (now - new Date(this.qtytMonitor[0].recv_time)) / 60000 >
                qtyt[i].duration.value
            ) {
                popped += qtytMonitor[i].shift();
            }
            // recalc
            this.qtytAvg[i] =
                (this.qtytAvg[i] * currLength -
                    popped +
                    newValue.temp_value.value) /
                this.qtytMonitor[i].length;
            // fire event if avg temp is in range
            if (
                this.qtytAvg[i] >= qtyt[i].temp_from.value &&
                this.qtytAvg[i] < qtyt[i].temp_to.value
            ) {
                eventEmitter.emit(
                    'inrange',
                    this.mqttconnection,
                    qtyt[i],
                    this.pat_id,
                    this.device,
                    this.qtytAvg[i]
                );
            }
        }
    }
}

warning_str = {
    '00': 'Binh thuong',
    '01': 'Sot nhe',
    11: 'Sot nang',
    10: 'Nguy hiem',
};

const insertTreatment = (patId, warningLevel) => {
    switch (warningLevel) {
    }
    const date = new Date();
    const sql = `insert into treatment_patient (treatment_id, patient_id, last_modified) values(@treatment_id, @patient_id, @last_modified)`;
    const request = new Request(sql, (err) => {
        if (err)
            res.send({
                message: 'This patient was not found',
                code: 400,
            });
    });
    request.addParameter('treatment_id', TYPES.Int, req.body.treatment_id);
    request.addParameter(
        'patient_id',
        TYPES.Int,
        parseInt(req.params.patientId)
    );
    request.addParameter('last_modified', TYPES.DateTime, date);
    request.on('requestCompleted', () =>
        res.status(200).send({
            message: 'Insert treatment successfully',
            code: 200,
        })
    );
    connection.execSql(request);
};
// handle qtyt event
eventEmitter.on('inrange', (client, qt, pat_id, device, avgtemp) => {
    // when a qt is activated
    // do post notification here
    //{ id":"6", "name":"TRAFFIC", "data":"x","unit":""}
    console.log(`${qt} ${pat_id}`);
    console.log(`${avgtemp}`);

    outStr = '';
    switch (qt.warning_level.value) {
        case 0:
            outStr = '00';
            break;
        case 1:
            outStr = '01';
            break;
        case 2:
            outStr = '11';
            break;
        case 3:
            outStr = '10';
            break;
        default:
            break;
    }
    const sql = `Insert into treatment_patient (treatment_id, patient_id, last_modified) values (@treatment_id, @patient_id, @last_modified)`;
    const now = new Date();
    const request = new Request(sql, (err) => console.log(err));

    request.addParameter('treatment_id', TYPES.Int, qt.warning_level.value);
    request.addParameter('patient_id', TYPES.Int, pat_id);
    request.addParameter('last_modified', TYPES.DateTime, now);

    db.connection.execSql(request);
    console.log(warning_str[outStr]);
    console.log('feedout ======');
    console.log(device.feed_out.value);
    client.publish(
        device.feed_out.value,
        `{"id":"6", "name":"TRAFFIC", "data":"${outStr}","unit":""}`
    );
});

exports.qtyt = qtyt;
exports.activeMonitors = activeMonitors;
exports.monitor = monitor;
