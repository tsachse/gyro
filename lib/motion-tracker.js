const events = require('events');
const util = require("util");

// Constructor
function MotionTracker(mpu6050) { 
    events.EventEmitter.call(this);

    this.mpu6050 = mpu6050;

};

util.inherits(MotionTracker, events.EventEmitter);

MotionTracker.prototype.run = function () {
};

MotionTracker.prototype.get_sensor_data = function () {
  if (mpu.testConnection()) {
    var data = mpu.getMotion6();
  }
};

module.exports = MotionTracker;
