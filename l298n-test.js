var MotorL298n = require('./lib/motor-l298n');

var motor1 = new MotorL298n(23,24);

motor1.forward();

setTimeout(function() {
  motor1.stop();
}, 5000);

