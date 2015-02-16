const events = require('events'); 
const util = require("util"); 

function DistanceChecker(sensor) {
  events.EventEmitter.call(this);


  this.sensor       = sensor;
  this.data         = clone(initial_data);
  this.running      = false; 
};

util.inherits(DistanceChecker, events.EventEmitter);

DistanceChecker.prototype.run = function () {
  if(!this.running) { 
    this.running = true;
    this.get_sensor_data(); 
  }
};

DistanceChecker.prototype.stop = function () { 
  if(this.running) {
    this.running = false; 
  }
};

DistanceChecker.prototype.get_sensor_data = function () {
  var that = this; 
  this.data.distance = this.sensor();
  this.emit("data", this.data); 
  if(this.data.alert_distance > 0 && this.data.alert_distance > this.data.distance) {
    this.emit("alert", this.data); 
  }
  if(this.running) {
    setTimeout(function() {
	that.get_sensor_data(); 
    }, this.data.freq);
  }
};

DistanceChecker.prototype.set_alert_distance = function (alert_distance) {
  this.data.alert_distance = alert_distance;
};

module.exports = DistanceChecker;

initial_data = { 
  freq           : 100,
  distance       : 0,
  alert_distance : 0
};

function clone(a) {  
  return JSON.parse(JSON.stringify(a));
};
