const start_distance = 400.0;
var distance = start_distance;

function sensor() {
  distance = distance - 0.1;
  if(distance < 0.0) {
    distance = start_distance;
  }
  return distance;
};

module.exports.createSensor = function() {
  return sensor;
};
