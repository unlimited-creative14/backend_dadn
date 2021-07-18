var mqtt = require('mqtt');
var db = require('./azure_db');
putTempData = db.putTempData;
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

    // client.on('reconnect', () => console.log("reconnect!"));
    // client.on('reconnect'
    return client;
}

exports.CreateMQTTClient = CreateMQTTClient;
