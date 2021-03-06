const express = require('express');
const morgan  = require('morgan');
const Primus = require('primus');

const app = express();
const port = 2000;
app.use(morgan('dev'));
app.use("/",express.static(__dirname + '/public'));


var server = require('http').createServer(app);
var  primus = new Primus(server, {transformer: 'engine.io'});

primus.library();
primus.save(__dirname +'/public/js/primus.js');

var mpu6050 = require('./lib/mpu6050');
// var mpu6050 = require('./lib/mpu6050-fake');
var MotionTracker = require('./lib/motion-tracker');

//var usonic = require('./lib/usonic-fake');
var usonic = require('r-pi-usonic');
//var usonic = require('./lib/hc-sr04');
var DistanceChecker = require('./lib/distance-checker');

var mpu = new mpu6050();
var motion_tracker = new MotionTracker(mpu);
motion_tracker.run();

motion_tracker.on('data', function(data) {
  //console.log(data);
  primus.forEach(function (spark, id, connections) {
    spark.write({'mpu6050': data});
  });
});

 motion_tracker.on('tracker', function(data) { 
  //console.log(data);
 });

var sensor = usonic.createSensor(18, 17, 750);
var checker = new DistanceChecker(sensor);
checker.run();

checker.on("data",function(data) {
  //console.log(data);
  primus.forEach(function (spark, id, connections) {
    spark.write({'hcsr04': data});
  });
});

app.use('/api/rc3/:cmd/:pitch/:roll/:yaw', function(req, res) {
  console.log(req.params);
  motion_tracker.track(req.params.yaw);
  res.status(200).json('OK');
});

server.listen(port,function() {
  console.log("ready captain at port", port);
});




