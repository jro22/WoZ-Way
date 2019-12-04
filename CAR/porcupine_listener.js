// This simple service listens for http POST messages from
// a running porcupine recognizer python process and echos
// any commands it receives to the console.
//
// by default it will listens at
// http://localhost:3000
//

var app = require("express")();
var http = require('http').Server(app);
var bodyParser = require('body-parser');

app.use(bodyParser.json())
app.post('/', function(req,res) {
  var msg=req.body.msg;
  console.log("got message from python: " + msg);
  // send the caller status saying that their POST was successful
  res.status(204).send()
});

http.listen(3000, function() {
  console.log('listening on port 3000...');
});
