const events = require('events'); 
const util = require("util"); 
var Gpio = require('onoff').Gpio;

function USonicDistanceChecker(tigger_gpio, echo_gpio, timeout) {
  events.EventEmitter.call(this);


  this.trigger_gpio = trigger_gpio;
  this.trigger      = new Gpio(this.trigger_gpio, 'out');

  this.echo_gpio    = echo_gpio;
  this.echo         =  new Gpio(this.echo_gpio, 'in', 'rising');
  var that          = this;
  this.echo.watch(function(err, value) {
    that.calc();
  });

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
   var that = this;
   this.trigger.write(1, function(err) {
     if (err) throw err;
     that.data.start = Date.now();
     setTimeout(function() {
       that.trigger.write(0, function(err) {
	 if (err) throw err; 
       });
     },10);
   });
 };

USonicDistanceChecker.prototype.calc = function () {
  this.data.stop = Date.now();
  this.data.elapsed = this.data.stop - this.data.start;
  this.data.distance = (this.data.elapsed * 34300) / 2;
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
  freq           : 100,
  start          : 0,
  stop           : 0,
  elapsed        : 0,
  distance       : 0,
  alert_distance : 0
};

function clone(a) {  
  return JSON.parse(JSON.stringify(a));
};
