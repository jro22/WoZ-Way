/*
server.js - CAR

Author: Niklas Martelaro (nmartelaro@gmail.com)

Purpose: This is the server for the WoZ Way in car system. It can send messages
back to the control interface as well as recieve messages from the control
interface. Theis messageing is handled using and MQTT server in a known
location.

The server subscribes to MQTT messages from the control interface and publishes
MQTT messages that will the control interface will listen to.

The server also listens for http POST messages from an instance of the
porcupine wake word engine, which listens for pre trained verbal commands and
relays them to the control interface by publishing MQTT messages.

Usage: node server.js

Notes: You will need to specify what MQTT server you would like to use.
*/

//****************************** SETUP ***************************************//
// MQTT Setup
var mqtt   = require('mqtt');

// if you are running the default mosquitto install this will work
// otherwise, uncomment the code below and change the host and port
// to match your target mqtt server
var client = mqtt.connect('mqtt://localhost')
//var client = mqtt.connect('localhost',
//                            {port: 1833,
//                             protocolId: 'MQIsdp',
//                             protocolVersion: 3 });

// Text to speech setup
var say = require('say');
//****************************************************************************//

// This is port server.js will listen on to receive messages from the
// Porcupine wake word detection/voice command engine.  Be sure this
// matches the port porcupine tries to connect on.

var server_port = 3000

var app = require('express')();
var http = require('http').Server(app);
var bodyParser = require('body-parser');

app.use(bodyParser.json())
app.post('/', function(req,res) {
  var msg = req.body.msg;
  var cmd = req.body.cmd;
  console.log("message from porcupine: " + msg);
  console.log("  command sent via mqtt: " + cmd);  // wake, autonomous, manual

  //update the console status with the most recent recognized command/wake word
  client.publish('can', '{"name":"' + cmd.toString() + '"}') // wake, autonomous, manual

  // send the caller status saying that their POST was successful
  res.status(204).send()
});

http.listen(server_port, function() {
  console.log('listening on port ' + server_port + '...');
});

//********************** MQTT MESSAGES WITH ACTIONS **************************//
// Setup the socket connection and listen for messages
client.on('connect', function () {
  client.subscribe('say'); // messages from the wizard interface to speak out
  console.log("Waiting for messages...");

  // messages for testing
  client.publish('say', 'Hello, I am a need finding machine');
});

// Print out the messages and say messages that are topic: "say"
// NOTE: These voices only work on macOS
client.on('message', function (topic, message) {
  // message is Buffer
  console.log(topic, message.toString());

  // Say the message using Apple's Text to speech
  if (topic === 'say') {
    // use default voice in System Preferences - You can sent this yourself
    console.log('');
    say.speak(null, message.toString());
  }

  //client.end();
});
//****************************************************************************//

//********************** SIMULATED CAN DATA MESSAGES *************************//
setInterval(function(){
    //update with some random data every 10 seconds (10000 ms)
    client.publish('can', '{"name":"vss", "value":' +
      Math.floor(Math.random() * 90) +
      '}')
    client.publish('can', '{"name":"rpm", "value":' +
      Math.floor(Math.random() * 6000) +
      '}')
}, 10000);
//****************************************************************************//
