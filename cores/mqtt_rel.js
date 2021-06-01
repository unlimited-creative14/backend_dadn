var mqtt = require('mqtt');
var db = require("./azure_db");

putTempData = db.putTempData

username = 'pipe1404'
iokey = "aio_vSSW67Hkla1acSRfrqbIXTGWHpy1"

console.log("Begin connect to Mqtt");
const connectionOpts = {
  "port" : 8883,
  "username" : username,
  "password" : iokey
}
topicIn = "pipe1404/feeds/led-zz"
topicOut  = "pipe1404/feeds/anotherfeed"

client = mqtt.connect("mqtts://io.adafruit.com", connectionOpts);

client.on('connect', function () {
  client.subscribe(topicIn);
  console.log(`IN Connected to ${topicIn}!`);
})

client.on('connect', function () {
  
  client.subscribe(topicOut);
  console.log(`OUT Connected to ${topicOut}!`);
})

client.on(
    'message', 
    function (topic, message) {
        // message is Buffer
        // Parse and process message here
        if (topic == topicIn)
        {
            // {"id":"7","name":"TEMP-HUMID","data":"x","unit":"*C-%"}
            tempSensor = JSON.parse(message);
            try {
                data = tempSensor["data"];
                temp = data.split('-')[0]
                time = Date.now();

                console.log(`[${time}](${tempSensor["name"] + tempSensor['id']}): ${temp}*C`);

                putTempData(tempSensor['id'], time, temp);
            } catch (error) {
                console.log(error + '\n' + "message:" + message);
            }
            
        }
    }
)