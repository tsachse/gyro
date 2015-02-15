const events = require('events'); 
const util = require("util"); 
var Gpio = require('onoff').Gpio;
var NanoTimer = require('nanotimer');
var sleep = require('node-sleep');

function USonicDistanceChecker(trigger_gpio, echo_gpio, timeout) {
  events.EventEmitter.call(this);

  this.trigger_gpio = trigger_gpio;
  this.trigger      = new Gpio(this.trigger_gpio, 'out');

  this.echo_gpio    = echo_gpio;
  this.echo         =  new Gpio(this.echo_gpio, 'in', 'both');
  var that          = this;

  this.timeout      = timeout;

  this.data         = clone(initial_data);
  this.interval_id  = 0;
  this.running      = false; 
};

util.inherits(USonicDistanceChecker, events.EventEmitter);

USonicDistanceChecker.prototype.run = function () {
  var that = this; 
  if(!this.running) { 
    this.running = true;
    this.interval_id = setInterval(function () {
      that.fire_trigger(); 
    }, this.data.freq); 
  }
};

USonicDistanceChecker.prototype.stop = function () { 
  if(this.running) {
    this.running = false; 
    clearInterval(this.intervali_id); 
  }
};

 USonicDistanceChecker.prototype.fire_trigger = function () {
   var timerA = new NanoTimer();
   var that = this;
   console.log('trigger --------------------');
   that.trigger.writeSync(0);
   sleep.usleep(2);
   that.trigger.writeSync(1);
   sleep.usleep(10);
   that.trigger.writeSync(0);
   var value = that.echo.readSync();
   while(value === 0) {
     console.log(value);
     value = that.echo.readSync();
   }
   that.data.elapsed = timerA.time(function() {
     while((value = that.echo.readSync()) === 1) {
     }
   },'', 'u');
   that.calc();
 };

USonicDistanceChecker.prototype.calc = function () {
  this.data.distance = this.data.elapsed /58;
  this.emit("data", this.data); 
  if(this.data.alert_distance > 0 && this.data.alert_distance > this.data.distance) {
    this.emit("alert", this.data); 
  }
};

USonicDistanceChecker.prototype.set_alert_distance = function (alert_distance) {
  this.data.alert_distance = alert_distance;
};

module.exports = USonicDistanceChecker;

initial_data = { 
  freq           : 3000,
  start          : 0,
  stop           : 0,
  elapsed        : 0,
  distance       : 0,
  alert_distance : 0
};

function clone(a) {  
  return JSON.parse(JSON.stringify(a));
};
