const db = require('./azure_db');
const mqtt = require('./mqtt_rel');
var events = require('events');
var eventEmitter = new events.EventEmitter();

activeDevices = [];
qtyt = [];
activeMonitors = {};

class monitor {
    constructor(patid, device) {
        this.mqttconnection = mqtt.CreateMQTTClient(
            username,
            iokey,
            device.feed_in.value,
            device.feed_out.value
        );

        this.dbconnection = db.newConnection();
        this.dbconnection.on('connect', () => {
            this.mqttconnection.on('message', function (topic, message) {
                // message is Buffer
                // Parse and process message here
                if (topic == device.feed_in.value) {
                    // {"id":"7","name":"TEMP-HUMID","data":"x-y","unit":"*C-%"}
                    var tempSensor = JSON.parse(message);
                    try {
                        var devid = tempSensor['id'];
                        var data = tempSensor['data'];
                        var temp = data.split('-')[0];
                        var time = Date.now();
                        var pat_id = 0;
                        // get patient from devid
                        var rqx = db.getPatientWithDevid(devid);
                        rqx.on('row', (col) => (pat_id = col.pat_id.value));
                        rqx.on('requestCompleted', () => {
                            var rq = db.putTempData(pat_id, time, temp);
                            rq.on('row', (col) =>
                                activeMonitors[pat_id].putData(col)
                            );
                            this.dbconnection.execSql(rq);
                        });
                        this.dbconnection.execSql(rqx);
                    } catch (error) {
                        console.log(error + '\n' + 'message:' + message);
                    }
                }
            });
            this.init_data();
        });
        this.pat_id = patid;
        this.qtytMonitor = {
            0: [],
            1: [],
            2: [],
            3: [],
        };
        this.qtytAvg = [0, 0, 0, 0];
        this.dbconnection.connect();
    }

    init_data() {
        // load data needed by qtyt
        var rq = [];
        rq.push(db.queryTempData(this.pat_id, qtyt[0].duration.value));
        rq.push(db.queryTempData(this.pat_id, qtyt[1].duration.value));
        rq.push(db.queryTempData(this.pat_id, qtyt[2].duration.value));
        rq.push(db.queryTempData(this.pat_id, qtyt[3].duration.value));
        for (let i = 0; i < 4; i++) {
            rq[i].on('row', (cols) => this.qtytMonitor[i].push(cols));
        }

        rq[0].on('requestCompleted', () => {
            rq[1].on('requestCompleted', () => {
                rq[2].on('requestCompleted', () => {
                    rq[3].on('requestCompleted', () => {
                        this.nextThing();
                    });
                    this.dbconnection.execSql(rq[3]);
                });
                this.dbconnection.execSql(rq[2]);
            });
            this.dbconnection.execSql(rq[1]);
        });
        this.dbconnection.execSql(rq[0]);
    }

    nextThing() {
        console.log('Load qtyt done');
        // calc avg
        for (let i = 0; i < 4; i++) {
            if (this.qtytMonitor[i].length != 0) {
                var x = this.qtytMonitor[i].reduce(
                    (a, b) => a + b.temp_value.value,
                    0
                );
                var y = this.qtytMonitor[i].length;

                this.qtytAvg[i] = x / y;
            } else {
                this.qtytAvg[i] = 0;
            }
        }
        console.log(`Monitor pat_id=${this.pat_id} started`);
    }

    // put next value to monitor
    putData(newValue) {
        var now = new Date(Date.now());
        for (let i = 0; i < 4; i++) {
            // push new value to 4 sample qtyt data array
            // while pop out value which is "outdated"
            var currLength = this.qtytMonitor[i].length;
            this.qtytMonitor[i].push(newValue);
            var popped = 0;

            // only process data if there are atleast 10 data points
            if (this.qtytMonitor[i].length < 10) continue;

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
                    qtyt[i],
                    this.pat_id,
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

// handle qtyt event
eventEmitter.on('inrange', (qt, pat_id, avgtemp) => {
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

    console.log(warning_str[outStr]);
    client.publish(
        this.activeDevices[pat_id].feed_out,
        `{ "id":"6", "name":"TRAFFIC", "data":"${outStr}","unit":""}`
    );
});

exports.activeDevices = activeDevices;
exports.qtyt = qtyt;
exports.activeMonitors = activeMonitors;
exports.monitor = monitor;
