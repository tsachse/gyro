const events = require('events'); 
const util = require("util"); 
var gpio = require('r-pi-gpio');
var sleep = require('node-sleep');

function USonicDistanceChecker(trigger_gpio, echo_gpio, timeout) {
  events.EventEmitter.call(this);

  this.trigger_gpio = trigger_gpio;
  this.trigger      = gpio.createOutput(this.trigger_gpio);

  this.echo_gpio    = echo_gpio;
  this.echo         = gpio.createInput(this.echo_gpio);
  var that          = this;

  this.timeout      = timeout;

  this.data         = this.initial_data();
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
   console.log('trigger --------------------');
   that.trigger(false);
   sleep.usleep(2);
   that.trigger(true);
   sleep.usleep(10);
   that.trigger(false);
   var level;
   this.data.start_loop = microsec();
   this.data.start = microsec();
   this.data.stop   = microsec();
   while(!(level = this.echo())) {
     //console.log(level);
     this.data.start = microsec();
     if(this.data.start - this.data.start_loop > 750) {
       console.log('timeout 1', this.data);
       return;
     }
   }

   this.data.start_loop = microsec();
   while((level = this.echo())) {
     //console.log(level);
     this.data.stop = microsec();
     if(this.data.stop - this.data.start_loop > 50000) {
       console.log('timeout 2', this.data);
       return;
     }
   }
   that.data.elapsed =  this.data.stop - this.data.start;
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

USonicDistanceChecker.prototype.initial_data = function () {
  initial_data = { 
    freq           : 2000,
    start_loop     : 0,
    start          : 0,
    stop           : 0,
    elapsed        : 0,
    distance       : 0,
    alert_distance : 0
  };
  return JSON.parse(JSON.stringify(initial_data));

};
module.exports = USonicDistanceChecker;

initial_data = { 
  freq           : 3000,
  start_loop     : 0,
  start          : 0,
  stop           : 0,
  elapsed        : 0,
  distance       : 0,
  alert_distance : 0
};

function clone(a) {  
  return JSON.parse(JSON.stringify(a));
};

function microsec() {
  var hrTime = process.hrtime();
  return (hrTime[0] * 1000000 + hrTime[1] / 1000);
}
