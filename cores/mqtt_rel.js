var mqtt = require('mqtt');
var putTempData = require("./azure_db");

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
  console.log(`IN Connected in ${topicIn}!`);
})

client.on('connect', function () {
  
  client.subscribe(topicOut);
  console.log(`OUT Connected ${topicOut}!`);
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
                console.log(`[${Date()}](${tempSensor["name"] + tempSensor['id']}): ${temp}*C`);

                putTempData(tempSensor['id'], convToSQLTime(Date.now()), temp);
            } catch (error) {
                console.log(error + '\n' + "message:" + message);
            }
            
        }
    }
)

function convToSQLTime(time)
{
  return new Date(time).toISOString().slice(0, 19).replace('T', ' ');
}