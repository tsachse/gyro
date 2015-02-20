const events = require('events');
const util = require("util");

// Constructor
function MotionTracker(mpu6050) { 
    events.EventEmitter.call(this);

    this.mpu6050      = mpu6050;
    this.data         = this.initial_data();
    this.interval_id = 0;
    this.running   = false;
};

util.inherits(MotionTracker, events.EventEmitter);

MotionTracker.prototype.run = function () {
  var that = this;
  this.mpu6050.initialize();
  this.interval_obj = setInterval(function () {
      that.get_sensor_data();
  }, this.data.freq);
   
};

MotionTracker.prototype.stop = function () {
  clearInterval(this.interval_obj);
  this.emit("stop", this.data);
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

  // Gyro
  this.data.gyro.scaled = this.data.gyro.raw.map(function(num) {
    return num / that.data.gyro.sens;
  });
  
  this.data.gyro.delta = this.data.gyro.scaled.map(function(num) {
    //     deg/s    ms
    return num * that.data.freq / 1000;
  });

  this.data.gyro.rotation = this.data.gyro.delta.map(function(num, i) {
    if(Math.abs(num) < 0.5) {
      num = 0.0;
    }
    return num + that.data.gyro.rotation[i];
  });

  this.data.z_rotation.current = this.data.gyro.rotation[2];
  if(this.data.z_rotation.running && 
      ((this.data.z_rotation.current - this.data.z_rotation.start) > this.data.z_rotation.by)) {
    this.emit("z_rotation", this.data);
    this.data.z_rotation.running = false;
  }

  this.data.ldw.current = this.data.z_rotation.current;
  this.data.ldw.diff = this.data.ldw.current - this.data.ldw.start;
  this.data.ldw.direction = 'left';
  if(this.data.z_rotation.current > 0) {
    this.data.ldw.direction = 'right';
  }
  if(this.data.ldw.running  && (Math.abs(this.data.ldw.diff) > this.data.ldw.degrees)) {
    this.emit("lane_depature_warning", this.data);
  }

  // Accel
  this.data.accel.scaled = this.data.accel.raw.map(function(num) {
    return num / that.data.accel.sens;
  });
  var a = this.data.accel.scaled;
  this.data.accel.x_rotation = Math.atan2(a[1],dist(a[0],a[2]));
  this.data.accel.x_rotation_degrees = degrees(this.data.accel.x_rotation);
  this.data.accel.y_rotation = Math.atan2(a[0],dist(a[1],a[2]));
  this.data.accel.y_rotation_degrees = degrees(this.data.accel.y_rotation) * -1;

};

MotionTracker.prototype.z_rotation_by = function(degrees) { 
  this.data.z_rotation.start   = this.data.gyro.rotation[2];
  this.data.z_rotation.current = this.data.z_rotation.start;
  this.data.z_rotation.by      = degrees;
  if(degrees !== 0) {
    this.data.z_rotation.running = true;
  } else {
    this.data.z_rotation.running = false;
  }
};

MotionTracker.prototype.lane_depature_warning = function(degrees) { 
  this.data.ldw.start   = this.data.gyro.rotation[2];
  this.data.ldw.current = this.data.ldw.start;
  this.data.ldw.degrees = degrees;
  if(degrees !== 0) {
    this.data.ldw.running = true;
  } else {
    this.data.ldw.running = false;
  }
};

MotionTracker.prototype.reset_data = function() { 
  this.data = this.initial_data();
};

MotionTracker.prototype.initial_data = function() { 
  initial_data = {
    freq : 100,
    gyro : {
      raw:       [ 0, 0, 0 ],
      scaled:    [ 0, 0, 0 ],
      delta:     [ 0, 0, 0 ],
      rotation:  [ 0, 0, 0 ],
      sens:   131
    },
    accel: {
      raw:    [ 0, 0, 0 ],
      scaled: [ 0, 0, 0 ],
      x_rotation: 0,
      y_rotation: 0,
      x_rotation_degrees: 0,
      y_rotation_degrees: 0,
      sens:   16384
    },
    z_rotation : {
      start:   0,
      current: 0,
      by     : 0,
      running : false
    },
    ldw : {
      start     : 0,
      current   : 0,
      degrees   : 0,
      diff      : 0,
      direction : 0,
      running : false
    }
  };
  return JSON.parse(JSON.stringify(initial_data));
}

module.exports = MotionTracker;

dist = function(a,b) {
  return Math.sqrt((a*a) + (b*b));
};

degrees = function(radians) {
  return radians * 180 / Math.PI;
};

