var mqtt = require('mqtt');
var db = require('./azure_db');
putTempData = db.putTempData;
console.log('Begin connect to Mqtt');

function CreateMQTTClient(username, iokey, topicIn) {
    const connectionOpts = {
        port: 8883,
        username: username,
        password: iokey,
    };
    const client = mqtt.connect(process.env.BROKER_URL, connectionOpts);
    client.on('connect', function () {
        client.subscribe(topicIn);
        console.log(`IN Connected to ${topicIn}!`);
    });
    
    client.on('reconnect', () => console.log("reconnect!" + topicIn));
    return client;
}

exports.CreateMQTTClient = CreateMQTTClient;
