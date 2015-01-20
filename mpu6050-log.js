var mpu6050 = require('./lib/mpu6050');
var async = require('async');

var freq = 100;
var duration = 30000;

var work =  async.queue(function(data, next) {
  console.log(JSON.stringify(data));
  next();
},1);


// Instantiate and initialize.
var mpu = new mpu6050();
mpu.initialize();

var i_id = setInterval(function(){ 
  var data_arr = [0,0,0,0,0,0];

  // Test the connection before using.
  if (mpu.testConnection()) {
    data_arr = mpu.getMotion6();
  }
  // var data_arr = [141,142,143,144,145,146];

  var data = {
    accl_x : data_arr[0],
    accl_y : data_arr[1],
    accl_z : data_arr[2],
    gyro_x : data_arr[3],
    gyro_y : data_arr[4],
    gyro_z : data_arr[5],
    freq   : freq
  };
  work.push(data);
} , freq);

setTimeout(function() {
  clearInterval(i_id);
},duration);

