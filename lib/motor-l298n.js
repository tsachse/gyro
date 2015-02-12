const events = require('events'); 
const util = require("util"); 
var Gpio = require('onoff').Gpio;

function MotorL298n(motor1_gpio, motor2_gpio, timeout) {
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

util.inherits(MotorL298n, events.EventEmitter);

MotorL298n.prototype.forward = function (speed) { 
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

MotorL298n.prototype.reverse = function (speed) { 
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

MotorL298n.prototype.stop = function () { 
  this.switch_motor(motor1, 0);
  this.switch_motor(motor2, 0);
};

MotorL298n.prototype.switch_motor = function (gpio,value) { 
  gpio.write(value, function(err) { 
    if (err) throw err;
  });
};


module.exports = MotorL298n;

