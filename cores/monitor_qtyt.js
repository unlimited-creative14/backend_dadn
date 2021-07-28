const db = require('./azure_db');
const mqtt = require('./mqtt_rel');
var events = require('events');
var eventEmitter = new events.EventEmitter();

activeDevices = [];
qtyt = [];
activeMonitors = {};
username = "pipe1404"
iokey = "aio_cLfx276mOhM4xaSiAn0WcCuqBI88"
//iokey = "aio_FiVJ792ViObIg0uz8lVnYLH9tMfH"
class monitor {
    constructor(pat_id, device) {
        this.mqttconnection = mqtt.CreateMQTTClient(
            username,
            iokey,
            device.feed_in.value
        );
        this.pat_id = pat_id;
        this.dbconnection = db.newConnection();
        this.device = device
        let thiz = this;
        this.dbconnection.on('connect', () => {
            console.log("init dev: " + device.feed_in.value);
            thiz.mqttconnection.on('message', function (topic, message) {
                // message is Buffer
                // Parse and process message here
                if (topic == thiz.device.feed_in.value) {
                    // {"id":"7","name":"TEMP-HUMID","data":"x-y","unit":"*C-%"}
                    var tempSensor = JSON.parse(message);
                    try {
                        var data = tempSensor['data'];
                        var temp = data.split('-')[0];
                        var time = Date.now();
                    
                        var rq = db.putTempData(thiz.pat_id, time, temp);
                        rq.on('row', (col) =>
                            activeMonitors[thiz.pat_id].putData(col)
                        );
                        thiz.dbconnection.execSql(rq);

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
    '11': 'Sot nang',
    '10': 'Nguy hiem',
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

    console.log(warning_str[outStr]);

    client.publish(
        device.feed_out.value,
        `{"id":"6", "name":"TRAFFIC", "data":"${outStr}","unit":""}`
    );
});

exports.activeDevices = activeDevices;
exports.qtyt = qtyt;
exports.activeMonitors = activeMonitors;
exports.monitor = monitor;
