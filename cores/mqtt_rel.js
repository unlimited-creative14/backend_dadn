var mqtt = require('mqtt');
var db = require('./azure_db');
var fs = require('fs');

const mq = require('./monitor_qtyt');

putTempData = db.putTempData;

username = 'pipe1404';
iokey = 'aio_vSSW67Hkla1acSRfrqbIXTGWHpy1';

console.log('Begin connect to Mqtt');

function CreateMQTTClient(username, iokey, topicIn, topicOut) {
    const connectionOpts = {
        port: 8883,
        username: username,
        password: iokey,
    };
    client = mqtt.connect('mqtts://io.adafruit.com', connectionOpts);
    client.on('connect', function () {
        client.subscribe(topicIn);
        console.log(`IN Connected to ${topicIn}!`);
    });

    client.on('connect', function () {
        client.subscribe(topicOut);
        console.log(`OUT Connected to ${topicOut}!`);
    });

    return client;
}

exports.CreateMQTTClient = CreateMQTTClient;
