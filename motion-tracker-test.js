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

//var mpu6050 = require('./lib/mpu6050');
var mpu6050 = require('./lib/mpu6050-fake');
var MotionTracker = require('./lib/motion-tracker');



var mpu = new mpu6050();
var motion_tracker = new MotionTracker(mpu);
motion_tracker.run();

motion_tracker.on('data', function(data) {
  //console.log(data);
  primus.forEach(function (spark, id, connections) {
    spark.write({'mpu6050': data});
  });
});


var usonic = require('./lib/usonic-fake');
// var usonic = require('r-pi-usonic');
var DistanceChecker = require('./lib/distance-checker');
var sensor = usonic.createSensor(18, 17, 750);
var checker = new DistanceChecker(sensor);
checker.run();

checker.on("data",function(data) {
  //console.log(data);
  primus.forEach(function (spark, id, connections) {
    spark.write({'hcsr04': data});
  });
});

server.listen(port,function() {
  console.log("ready captain at port", port);
});




