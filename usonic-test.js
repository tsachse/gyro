//var usonic = require('./lib/usonic-fake');
//var usonic = require('r-pi-usonic');
var USonicDistanceChecker = require('./lib/usonic-distance-checker');

//var sensor = usonic.createSensor(18, 17, 500);
//var checker = new DistanceChecker(sensor);

var checker = new USonicDistanceChecker(18,17,500);
checker.run();

// setTimeout(function() {
//  console.log('Distance: ' + sensor().toFixed(2) + ' cm');
// }, 60);

checker.on("data",function(data) {
  console.log(data);
});
