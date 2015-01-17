var mpu6050 = require('./lib/mpu6050');

// Instantiate and initialize.
var mpu = new mpu6050();
mpu.initialize();

setInterval(function(){ 
  // Test the connection before using.
  if (mpu.testConnection()) {
    console.log(mpu.getMotion6());
  }
} , 1000);

// Put the MPU6050 back to sleep.
//mpu.setSleepEnabled(1);
