//var usonic = require('./lib/usonic-fake');
var usonic = require('r-pi-usonic');
var DistanceChecker = require('./lib/distance-checker');

var sensor = usonic.createSensor(18, 17, 500);
var checker = new DistanceChecker(sensor);


setTimeout(function() {
 console.log('Distance: ' + sensor().toFixed(2) + ' cm');
}, 60);

