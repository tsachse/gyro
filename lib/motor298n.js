const events = require('events'); 
const util = require("util"); 
var Gpio = require('onoff').Gpio;

function Motor298n(motor1_gpio, motor2_gpio, timeout) {
  events.EventEmitter.call(this);

  this.motor1_gpio = motor1_gpio;
  this.motor1      = new Gpio(this.motor1_gpio, 'out');

  this.motor2_gpio = motor2_gpio;
  this.motor2      =  new Gpio(this.motor2_gpio, 'out');
  var that         = this;

  this.motor1.watch(function(err, value) {
    console.log("motor1 ", that.motor1_gpio, '->', value);
  });

  this.trigger.watch(function(err, value) {
    console.log("motor2 ", that.motor2_gpio, '->', value);
  });
};

util.inherits(Motor298n, events.EventEmitter);

Motor298n.prototype.forward = function (speed) { 
  // beim Umschalten, soll der Motor erstmal stoppen
  this.stop();

  // da PWN (noch) nicht unterstützt, wird gemogelt.
  var speed_fake = 1;
  if (typeof(speed) !== "undefined" && speed < 255) {
    speed_fake = 0;
  }
  this.switch_motor(motor1, speed_fake);
  this.switch_motor(motor2, 0);
};

Motor298n.prototype.reverse = function (speed) { 
  // beim Umschalten, soll der Motor erstmal stoppen
  this.stop();

  // da PWN (noch) nicht unterstützt, wird gemogelt.
  var speed_fake = 1;
  if (typeof(speed) !== "undefined" && speed < 255) {
    speed_fake = 0;
  }
  this.switch_motor(motor1, 0);
  this.switch_motor(motor2, speed_fake);
};

Motor298n.prototype.stop = function () { 
  this.switch_motor(motor1, 0);
  this.switch_motor(motor2, 0);
};

Motor298n.prototype.switch_motor = function (gpio,value) { 
  gpio.write(value, function(err) { 
    if (err) throw err;
  }
};


module.exports = Motor298n;

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
