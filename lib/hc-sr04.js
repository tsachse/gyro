var gpio = require('r-pi-gpio');

module.exports.createSensor = function(echo_gpio, trigger_gpio, timeout) {
  var trigger = gpio.createOutput(trigger_gpio);
  var echo = gpio.createInput(echo_gpio);

  var sensor = function() {
    var start_loop;
    var start;
    var stop; 
    var level;

    console.log('trigger --------------------'); 

    trigger(false);
    start = microsec();
    stop = microsec();
    while(stop - start <= 2) {
      stop = microsec();
    } 

    trigger(true);
    start = microsec();
    stop = microsec();
    while(stop - start <= 10) {
      stop = microsec();
    }

    trigger(false); 
    
    start_loop = microsec(); 
    start = microsec(); 
    stop   = microsec(); 
    
    while(!(level = echo())) {
      start = microsec();
      if(start - start_loop > 750) {
        console.log('timeout 1', this.data);
        return -1;
      } 
    } 
    
    start_loop = microsec(); 
    while((level = echo())) {
      stop = microsec();
      if(stop - start_loop > 50000) {
       console.log('timeout 2', this.data);
       return -2;
      }
    }

    return (stop - start) / 58;
  };
  
  var microsec = function() {
    var hrTime = process.hrtime();
    return (hrTime[0] * 1000000 + hrTime[1] / 1000);
  };

  return sensor;
};
