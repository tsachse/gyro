//var mpu6050 = require('./lib/mpu6050');
var mpu6050 = require('./lib/mpu6050-fake');
var MotionTracker = require('./lib/motion-tracker');

var mpu = new mpu6050();
var motion_tracker = new MotionTracker(mpu);
motion_tracker.run();

motion_tracker.on('data', function(data) {
  console.log(data);
});

