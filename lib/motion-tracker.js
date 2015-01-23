const events = require('events');
const util = require("util");

// Constructor
function MotionTracker(mpu6050) { 
    events.EventEmitter.call(this);

    this.mpu6050      = mpu6050;
    this.data         = clone(initial_data);
    this.interval_id = 0;
    this.running   = false;
};

util.inherits(MotionTracker, events.EventEmitter);

MotionTracker.prototype.run = function () {
  var that = this;
  this.mpu6050.initialize();
  if(!this.running) {
    this.running = true;
    this.interval_id = setInterval(function () {
      that.get_sensor_data();
    }, this.data.freq);
  }
};

MotionTracker.prototype.stop = function () {
  if(this.running) {
    this.running = false;
    clearInterval(this.intervali_id);
  }
}

MotionTracker.prototype.get_sensor_data = function () {
  if (this.mpu6050.testConnection()) {
    var d = this.mpu6050.getMotion6();
    this.data.accel.raw = d.slice(0,3);
    this.data.gyro.raw = d.slice(3);
    this.calc();
    this.emit("data", this.data);
  }
};

MotionTracker.prototype.calc = function () {
  var that = this;
  this.data.gyro.scaled = this.data.gyro.raw.map(function(num) {
    return num / that.data.gyro.sens;
  });
  if(this.data.gyro.first) {
    this.data.gyro.first = false;
    this.data.gyro.base = clone(this.data.gyro.scaled );
  }
  this.data.gyro.delta = this.data.gyro.scaled.map(function(num) {
    return num / that.data.freq;
  });
  this.data.gyro.rotation = this.data.gyro.delta.map(function(num, index) {
    return num + that.data.gyro.rotation[index];
  });
  this.data.accel.scaled = this.data.accel.raw.map(function(num) {
    return num / that.data.accel.sens;
  });
  var a = this.data.accel.scaled;
  var radians = Math.atan2(a[1],dist(a[0],a[2]));
  this.data.accel.x_rotation = degrees(radians);
  radians = Math.atan2(a[0],dist(a[1],a[2]));
  this.data.accel.y_rotation = degrees(radians) * -1;

};

module.exports = MotionTracker;

dist = function(a,b) {
  return Math.sqrt((a*a) + (b*b));
};

degrees = function(radians) {
  return radians * 180 / Math.PI;
};

initial_data = {
  freq : 100,
  gyro : {
    raw:       [ 0, 0, 0 ],
    scaled:    [ 0, 0, 0 ],
    base:      [ 0, 0, 0 ],
    delta:     [ 0, 0, 0 ],
    rotation:  [ 0, 0, 0 ],
    sens:   131,
    first:  true
  },
  accel: {
    raw:    [ 0, 0, 0 ],
    scaled: [ 0, 0, 0 ],
    x_rotation: 0,
    y_rotation: 0,
    sens:   16384
  }
};

function clone(a) {
  return JSON.parse(JSON.stringify(a));
};
