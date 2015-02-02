var usonic = require('./lib/usonic-fake'); 
var DistanceChecker = require('./lib/distance-checker');

var sensor = usonic.createSensor(18, 17, 1000);
var checker = new DistanceChecker(sensor);
checker.run();

setTimeout(function() {
  console.log('Distance: ' + sensor().toFixed(2) + ' cm');
}, 60);

checker.on("data",function(data) {
  console.log(data);
});
