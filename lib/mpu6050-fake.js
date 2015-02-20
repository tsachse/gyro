var fs = require('fs');

/**
 * A FAKE MPU6050 minimal device I2C library for Node.js
/**
 * Default constructor, uses default I2C address or default SS Pin if SPI
 * @see MPU6050.DEFAULT_ADDRESS
 */
function MPU6050(device, address) {
  this.device = device || 'FAKE';
  this.address = address || MPU6050.DEFAULT_ADDRESS;
  this.data = [];
  this.fn_data = undefined;
  this.test_data(undefined);
};
MPU6050.prototype.initialize = function() {
};

MPU6050.prototype.testConnection = function() {
  return 1;
};


MPU6050.prototype.getDeviceID = function() {
  return 0x68;
};

MPU6050.prototype.setDeviceID = function(id) {
};


/**
 * Get full-scale gyroscope range.
 * The FS_SEL parameter allows setting the full-scale range of the gyro sensors,
 * as described in the table below.
 *
 * <pre>
 * 0 = +/- 250 degrees/sec
 * 1 = +/- 500 degrees/sec
 * 2 = +/- 1000 degrees/sec
 * 3 = +/- 2000 degrees/sec
 * </pre>
 *
 * @return Current full-scale gyroscope range setting
 */
MPU6050.prototype.getFullScaleGyroRange = function() {
};

/**
 * Set full-scale gyroscope range.
 * @param range New full-scale gyroscope range value
 * @see getFullScaleRange()
 * @see MPU6050_GYRO_FS_250
 * @see MPU6050_RA_GYRO_CONFIG
 * @see MPU6050_GCONFIG_FS_SEL_BIT
 * @see MPU6050_GCONFIG_FS_SEL_LENGTH
 */
MPU6050.prototype.setFullScaleGyroRange = function(range) {
};

MPU6050.prototype.getFullScaleAccelRange = function() {
  return 0;
};

/**
 * Set full-scale accelerometer range.
 * @param range New full-scale accelerometer range setting
 * @see getFullScaleAccelRange()
 */
MPU6050.prototype.setFullScaleAccelRange = function(range) {
};


/**
 * Get 3-axis accelerometer readings.
 * These registers store the most recent accelerometer measurements.
 * Accelerometer measurements are written to these registers at the Sample Rate
 * as defined in Register 25.
 *
 * The accelerometer measurement registers, along with the temperature
 * measurement registers, gyroscope measurement registers, and external sensor
 * data registers, are composed of two sets of registers: an internal register
 * set and a user-facing read register set.
 *
 * The data within the accelerometer sensors' internal register set is always
 * updated at the Sample Rate. Meanwhile, the user-facing read register set
 * duplicates the internal register set's data values whenever the serial
 * interface is idle. This guarantees that a burst read of sensor registers will
 * read measurements from the same sampling instant. Note that if burst reads
 * are not used, the user is responsible for ensuring a set of single byte reads
 * correspond to a single sampling instant by checking the Data Ready interrupt.
 *
 * Each 16-bit accelerometer measurement has a full scale defined in ACCEL_FS
 * (Register 28). For each full scale setting, the accelerometers' sensitivity
 * per LSB in ACCEL_xOUT is shown in the table below:
 *
 * <pre>
 * AFS_SEL | Full Scale Range | LSB Sensitivity
 * --------+------------------+----------------
 * 0       | +/- 2g           | 8192 LSB/mg
 * 1       | +/- 4g           | 4096 LSB/mg
 * 2       | +/- 8g           | 2048 LSB/mg
 * 3       | +/- 16g          | 1024 LSB/mg
 * </pre>
 * 
 * @return An array containing the three accellerations.
 */
MPU6050.prototype.getAcceleration = function() {
  return this.getMotion6().slice(0,3);
};

MPU6050.prototype.getScaledAcceleration = function() {  
  return this.getAcceleration().map(function(num) {
    return num / 16384;
  });
}


/**
 * Get raw 6-axis motion sensor readings (accel/gyro).
 * Retrieves all currently available motion sensor values.
 * @see getAcceleration()
 * @see getRotation()
 */
MPU6050.prototype.getMotion6 = function() {
  if(this.data.length === 0) {
    this.test_data(this.fn_data);
  }
  var sensor = this.data.shift();

  return [
    sensor.accel_x,
    sensor.accel_y,
    sensor.accel_z,
    sensor.gyro_x,
    sensor.gyro_y,
    sensor.gyro_z,
    ];
};


/**
 * Get 3-axis gyroscope readings.
 * These gyroscope measurement registers, along with the accelerometer
 * measurement registers, temperature measurement registers, and external sensor
 * data registers, are composed of two sets of registers: an internal register
 * set and a user-facing read register set.
 * The data within the gyroscope sensors' internal register set is always
 * updated at the Sample Rate. Meanwhile, the user-facing read register set
 * duplicates the internal register set's data values whenever the serial
 * interface is idle. This guarantees that a burst read of sensor registers will
 * read measurements from the same sampling instant. Note that if burst reads
 * are not used, the user is responsible for ensuring a set of single byte reads
 * correspond to a single sampling instant by checking the Data Ready interrupt.
 *
 * Each 16-bit gyroscope measurement has a full scale defined in FS_SEL
 * (Register 27). For each full scale setting, the gyroscopes' sensitivity per
 * LSB in GYRO_xOUT is shown in the table below:
 *
 * <pre>
 * FS_SEL | Full Scale Range   | LSB Sensitivity
 * -------+--------------------+----------------
 * 0      | +/- 250 degrees/s  | 131 LSB/deg/s
 * 1      | +/- 500 degrees/s  | 65.5 LSB/deg/s
 * 2      | +/- 1000 degrees/s | 32.8 LSB/deg/s
 * 3      | +/- 2000 degrees/s | 16.4 LSB/deg/s
 * </pre>
 *
 * @param x 16-bit signed integer container for X-axis rotation
 * @param y 16-bit signed integer container for Y-axis rotation
 * @param z 16-bit signed integer container for Z-axis rotation
 * @see getMotion6()
 */
MPU6050.prototype.getRotation = function() {
   return this.getMotion6().slice(3);
};

MPU6050.prototype.getScaledRotation = function() {  
  return this.getRotation().map(function(num) {
    return num / 131;
  });

}


/** Get sleep mode status.
 * Setting the SLEEP bit in the register puts the device into very low power
 * sleep mode. In this mode, only the serial interface and internal registers
 * remain active, allowing for a very low standby current. Clearing this bit
 * puts the device back into normal mode. To save power, the individual standby
 * selections for each of the gyros should be used if any gyro axis is not used
 * by the application.
 * @return Current sleep mode enabled status
 * @see MPU6050_RA_PWR_MGMT_1
 * @see MPU6050_PWR1_SLEEP_BIT
 */
MPU6050.prototype.getSleepEnabled = function() {
  return 0;
};

/** Set sleep mode status.
 * @param enabled New sleep mode enabled status
 * @see getSleepEnabled()
 * @see MPU6050_RA_PWR_MGMT_1
 * @see MPU6050_PWR1_SLEEP_BIT
 */
MPU6050.prototype.setSleepEnabled = function(enabled) {
};

/**
 * Get clock source setting.
 * @return Current clock source setting
 */
MPU6050.prototype.getClockSource = function() {
  return 0;
};

/**
 * Set clock source setting.
 * An internal 8MHz oscillator, gyroscope based clock, or external sources can
 * be selected as the MPU-60X0 clock source. When the internal 8 MHz oscillator
 * or an external source is chosen as the clock source, the MPU-60X0 can operate
 * in low power modes with the gyroscopes disabled.
 *
 * Upon power up, the MPU-60X0 clock source defaults to the internal oscillator.
 * However, it is highly recommended that the device be configured to use one of
 * the gyroscopes (or an external clock source) as the clock reference for
 * improved stability. The clock source can be selected according to the following table:
 *
 * <pre>
 * CLK_SEL | Clock Source
 * --------+--------------------------------------
 * 0       | Internal oscillator
 * 1       | PLL with X Gyro reference
 * 2       | PLL with Y Gyro reference
 * 3       | PLL with Z Gyro reference
 * 4       | PLL with external 32.768kHz reference
 * 5       | PLL with external 19.2MHz reference
 * 6       | Reserved
 * 7       | Stops the clock and keeps the timing generator in reset
 * </pre>
 *
 * @param source New clock source setting
 * @see getClockSource()
 */
MPU6050.prototype.setClockSource = function(source) {
};

dist = function(a,b) {
  return Math.sqrt((a*a) + (b*b));
};

degrees = function(radians) {
  return radians * 180 / Math.PI;
};

MPU6050.prototype.getYRotation = function() { 
  var a = this.getScaledAcceleration();
  var radians = Math.atan2(a[0],dist(a[1],a[2]));
  return degrees(radians) * -1;
}


MPU6050.prototype.getXRotation = function() { 
  var a = this.getScaledAcceleration();
  var radians = Math.atan2(a[1],dist(a[0],a[2]));
  return degrees(radians);
}

MPU6050.prototype.test_data = function(fn_data) {
  if(typeof(fn_data) !== 'undefined') {
    this.fn_data = fn_data;
    this.data = JSON.parse(fs.readFileSync(this.fn_data, "utf8"));
  } else {
    data = [
      {"accel_x":-432,"accel_y":-10360,"accel_z":12092,"gyro_x":-461,"gyro_y":1131,"gyro_z":1437,"freq":100},
      {"accel_x":84,"accel_y":-10728,"accel_z":11588,"gyro_x":-3492,"gyro_y":-1857,"gyro_z":-2382,"freq":100},
      {"accel_x":2816,"accel_y":-11708,"accel_z":9456,"gyro_x":-8482,"gyro_y":-2022,"gyro_z":6423,"freq":100},
      {"accel_x":-140,"accel_y":-12948,"accel_z":12388,"gyro_x":-2107,"gyro_y":1013,"gyro_z":698,"freq":100},
      {"accel_x":3084,"accel_y":-12680,"accel_z":8784,"gyro_x":-1752,"gyro_y":-3925,"gyro_z":980,"freq":100},
      {"accel_x":-588,"accel_y":-14356,"accel_z":8976,"gyro_x":-3498,"gyro_y":503,"gyro_z":1421,"freq":100},
      {"accel_x":1312,"accel_y":-13936,"accel_z":9632,"gyro_x":-5430,"gyro_y":55,"gyro_z":149,"freq":100},
      {"accel_x":2768,"accel_y":-13796,"accel_z":8256,"gyro_x":-9400,"gyro_y":-3223,"gyro_z":5,"freq":100},
      {"accel_x":1376,"accel_y":-15856,"accel_z":5980,"gyro_x":-6718,"gyro_y":-652,"gyro_z":-921,"freq":100},
      {"accel_x":1072,"accel_y":-15876,"accel_z":3996,"gyro_x":-3494,"gyro_y":1038,"gyro_z":484,"freq":100},
      {"accel_x":408,"accel_y":-16796,"accel_z":2332,"gyro_x":-7520,"gyro_y":-1736,"gyro_z":1773,"freq":100},
      {"accel_x":88,"accel_y":-16544,"accel_z":3520,"gyro_x":-3413,"gyro_y":-266,"gyro_z":1008,"freq":100},
      {"accel_x":304,"accel_y":-16644,"accel_z":1900,"gyro_x":-4744,"gyro_y":-2517,"gyro_z":-410,"freq":100},
      {"accel_x":792,"accel_y":-16840,"accel_z":652,"gyro_x":-3092,"gyro_y":-1569,"gyro_z":36,"freq":100},
      {"accel_x":560,"accel_y":-16812,"accel_z":-428,"gyro_x":-395,"gyro_y":-360,"gyro_z":-62,"freq":100},
      {"accel_x":-168,"accel_y":-16636,"accel_z":520,"gyro_x":547,"gyro_y":487,"gyro_z":50,"freq":100},
      {"accel_x":472,"accel_y":-16420,"accel_z":396,"gyro_x":-195,"gyro_y":295,"gyro_z":-150,"freq":100},
      {"accel_x":524,"accel_y":-16568,"accel_z":-556,"gyro_x":-477,"gyro_y":219,"gyro_z":90,"freq":100},
      {"accel_x":840,"accel_y":-15704,"accel_z":640,"gyro_x":-357,"gyro_y":268,"gyro_z":171,"freq":100},
      {"accel_x":572,"accel_y":-16592,"accel_z":336,"gyro_x":610,"gyro_y":272,"gyro_z":149,"freq":100},
      {"accel_x":748,"accel_y":-16504,"accel_z":-140,"gyro_x":570,"gyro_y":525,"gyro_z":63,"freq":100},
      {"accel_x":-240,"accel_y":-16568,"accel_z":1728,"gyro_x":2271,"gyro_y":886,"gyro_z":251,"freq":100},
      {"accel_x":-32,"accel_y":-15880,"accel_z":824,"gyro_x":14331,"gyro_y":1366,"gyro_z":-304,"freq":100},
      {"accel_x":1244,"accel_y":-16764,"accel_z":6688,"gyro_x":12355,"gyro_y":2547,"gyro_z":115,"freq":100},
      {"accel_x":948,"accel_y":-14372,"accel_z":7720,"gyro_x":8761,"gyro_y":3555,"gyro_z":-216,"freq":100},
      {"accel_x":1248,"accel_y":-12712,"accel_z":9860,"gyro_x":10605,"gyro_y":4735,"gyro_z":3194,"freq":100},
      {"accel_x":2044,"accel_y":-10108,"accel_z":9960,"gyro_x":14120,"gyro_y":5963,"gyro_z":2546,"freq":100},
      {"accel_x":-1072,"accel_y":-10748,"accel_z":15232,"gyro_x":11593,"gyro_y":3959,"gyro_z":2193,"freq":100},
      {"accel_x":1080,"accel_y":-5756,"accel_z":15720,"gyro_x":12298,"gyro_y":3687,"gyro_z":2562,"freq":100},
      {"accel_x":564,"accel_y":-2924,"accel_z":15576,"gyro_x":15129,"gyro_y":2152,"gyro_z":-144,"freq":100},
      {"accel_x":-1148,"accel_y":-1144,"accel_z":18380,"gyro_x":10348,"gyro_y":5082,"gyro_z":2248,"freq":100},
      {"accel_x":-1488,"accel_y":1072,"accel_z":17020,"gyro_x":6016,"gyro_y":2013,"gyro_z":-1454,"freq":100},
      {"accel_x":-1528,"accel_y":2588,"accel_z":17560,"gyro_x":5580,"gyro_y":3031,"gyro_z":587,"freq":100},
      {"accel_x":288,"accel_y":5124,"accel_z":16300,"gyro_x":10894,"gyro_y":-1835,"gyro_z":-104,"freq":100},
      {"accel_x":-1176,"accel_y":6616,"accel_z":15852,"gyro_x":10076,"gyro_y":-1134,"gyro_z":-1297,"freq":100},
      {"accel_x":-2124,"accel_y":9164,"accel_z":16152,"gyro_x":4229,"gyro_y":957,"gyro_z":1468,"freq":100},
      {"accel_x":-2852,"accel_y":10004,"accel_z":13828,"gyro_x":8139,"gyro_y":437,"gyro_z":1402,"freq":100},
      {"accel_x":76,"accel_y":13580,"accel_z":9856,"gyro_x":10724,"gyro_y":-600,"gyro_z":2784,"freq":100},
      {"accel_x":-1372,"accel_y":12780,"accel_z":10288,"gyro_x":11056,"gyro_y":-4917,"gyro_z":3998,"freq":100},
      {"accel_x":76,"accel_y":14672,"accel_z":6800,"gyro_x":8120,"gyro_y":-1776,"gyro_z":1788,"freq":100},
      {"accel_x":196,"accel_y":16288,"accel_z":3848,"gyro_x":5784,"gyro_y":-2970,"gyro_z":-706,"freq":100},
      {"accel_x":40,"accel_y":15436,"accel_z":3892,"gyro_x":4881,"gyro_y":-2125,"gyro_z":-2774,"freq":100},
      {"accel_x":-68,"accel_y":15292,"accel_z":2012,"gyro_x":3524,"gyro_y":-2206,"gyro_z":-3440,"freq":100},
      {"accel_x":308,"accel_y":16496,"accel_z":2464,"gyro_x":6572,"gyro_y":-522,"gyro_z":-47,"freq":100},
      {"accel_x":-1328,"accel_y":16328,"accel_z":-672,"gyro_x":1569,"gyro_y":-706,"gyro_z":10,"freq":100},
      {"accel_x":368,"accel_y":16136,"accel_z":-12,"gyro_x":265,"gyro_y":394,"gyro_z":-32,"freq":100},
      {"accel_x":20,"accel_y":16428,"accel_z":-336,"gyro_x":-178,"gyro_y":251,"gyro_z":55,"freq":100},
      {"accel_x":80,"accel_y":16580,"accel_z":-224,"gyro_x":-1250,"gyro_y":333,"gyro_z":233,"freq":100},
      {"accel_x":60,"accel_y":16428,"accel_z":680,"gyro_x":-2252,"gyro_y":192,"gyro_z":174,"freq":100},
      {"accel_x":436,"accel_y":16628,"accel_z":808,"gyro_x":-6834,"gyro_y":532,"gyro_z":410,"freq":100},
      {"accel_x":-476,"accel_y":16196,"accel_z":3316,"gyro_x":-7442,"gyro_y":1250,"gyro_z":595,"freq":100},
      {"accel_x":-908,"accel_y":15948,"accel_z":4660,"gyro_x":-10604,"gyro_y":3959,"gyro_z":568,"freq":100},
      {"accel_x":820,"accel_y":14968,"accel_z":5744,"gyro_x":-12809,"gyro_y":-329,"gyro_z":-39,"freq":100},
      {"accel_x":792,"accel_y":12384,"accel_z":9764,"gyro_x":-13118,"gyro_y":-2227,"gyro_z":1891,"freq":100},
      {"accel_x":-204,"accel_y":13456,"accel_z":11916,"gyro_x":-17568,"gyro_y":818,"gyro_z":7251,"freq":100},
      {"accel_x":3484,"accel_y":9244,"accel_z":15712,"gyro_x":-10901,"gyro_y":692,"gyro_z":10032,"freq":100},
      {"accel_x":1300,"accel_y":5164,"accel_z":17420,"gyro_x":-5595,"gyro_y":4718,"gyro_z":5820,"freq":100},
      {"accel_x":2000,"accel_y":3820,"accel_z":16208,"gyro_x":-9204,"gyro_y":-3695,"gyro_z":4917,"freq":100},
      {"accel_x":1388,"accel_y":1356,"accel_z":16956,"gyro_x":-4171,"gyro_y":-4976,"gyro_z":-4745,"freq":100},
      {"accel_x":-2328,"accel_y":-1792,"accel_z":18516,"gyro_x":263,"gyro_y":-2937,"gyro_z":-1556,"freq":100},
      {"accel_x":-756,"accel_y":-1100,"accel_z":15644,"gyro_x":-3738,"gyro_y":3231,"gyro_z":2998,"freq":100},
      {"accel_x":2852,"accel_y":1788,"accel_z":16652,"gyro_x":-131,"gyro_y":-1642,"gyro_z":7366,"freq":100},
      {"accel_x":584,"accel_y":-884,"accel_z":16072,"gyro_x":-1220,"gyro_y":-488,"gyro_z":-1798,"freq":100},
      {"accel_x":-128,"accel_y":156,"accel_z":16208,"gyro_x":39,"gyro_y":1882,"gyro_z":-401,"freq":100},
      {"accel_x":1136,"accel_y":160,"accel_z":16452,"gyro_x":-190,"gyro_y":1438,"gyro_z":10,"freq":100},
      {"accel_x":776,"accel_y":8,"accel_z":17424,"gyro_x":-115,"gyro_y":129,"gyro_z":2078,"freq":100},
      {"accel_x":460,"accel_y":72,"accel_z":16988,"gyro_x":-184,"gyro_y":275,"gyro_z":134,"freq":100},
      {"accel_x":400,"accel_y":184,"accel_z":16760,"gyro_x":-177,"gyro_y":355,"gyro_z":115,"freq":100},
      {"accel_x":860,"accel_y":800,"accel_z":16688,"gyro_x":-95,"gyro_y":-37,"gyro_z":3241,"freq":100},
      {"accel_x":124,"accel_y":292,"accel_z":17092,"gyro_x":-122,"gyro_y":148,"gyro_z":2572,"freq":100},
      {"accel_x":636,"accel_y":-684,"accel_z":16464,"gyro_x":44,"gyro_y":192,"gyro_z":8255,"freq":100},
      {"accel_x":1452,"accel_y":684,"accel_z":16940,"gyro_x":204,"gyro_y":-540,"gyro_z":14653,"freq":100},
      {"accel_x":508,"accel_y":736,"accel_z":16904,"gyro_x":-13,"gyro_y":691,"gyro_z":5753,"freq":100},
      {"accel_x":-588,"accel_y":-764,"accel_z":17316,"gyro_x":-80,"gyro_y":256,"gyro_z":8731,"freq":100},
      {"accel_x":28,"accel_y":796,"accel_z":16704,"gyro_x":-114,"gyro_y":490,"gyro_z":2863,"freq":100},
      {"accel_x":500,"accel_y":-24,"accel_z":16672,"gyro_x":-166,"gyro_y":193,"gyro_z":1450,"freq":100},
      {"accel_x":392,"accel_y":-68,"accel_z":16784,"gyro_x":-160,"gyro_y":187,"gyro_z":452,"freq":100},
      {"accel_x":488,"accel_y":-8,"accel_z":16712,"gyro_x":-178,"gyro_y":175,"gyro_z":75,"freq":100},
      {"accel_x":672,"accel_y":-112,"accel_z":16760,"gyro_x":-201,"gyro_y":97,"gyro_z":-868,"freq":100},
      {"accel_x":-216,"accel_y":-600,"accel_z":16712,"gyro_x":-391,"gyro_y":-512,"gyro_z":-8205,"freq":100},
      {"accel_x":432,"accel_y":148,"accel_z":17240,"gyro_x":-301,"gyro_y":1872,"gyro_z":-9156,"freq":100},
      {"accel_x":1364,"accel_y":220,"accel_z":17132,"gyro_x":-377,"gyro_y":108,"gyro_z":-13061,"freq":100},
      {"accel_x":-2812,"accel_y":-412,"accel_z":16660,"gyro_x":-434,"gyro_y":602,"gyro_z":-15494,"freq":100},
      {"accel_x":1368,"accel_y":1084,"accel_z":16596,"gyro_x":-705,"gyro_y":-150,"gyro_z":-18513,"freq":100},
      {"accel_x":1312,"accel_y":984,"accel_z":16724,"gyro_x":-259,"gyro_y":1264,"gyro_z":-16013,"freq":100},
      {"accel_x":1744,"accel_y":916,"accel_z":16436,"gyro_x":-234,"gyro_y":530,"gyro_z":-7832,"freq":100},
      {"accel_x":-56,"accel_y":-912,"accel_z":17060,"gyro_x":-62,"gyro_y":-620,"gyro_z":-8073,"freq":100},
      {"accel_x":756,"accel_y":-232,"accel_z":15928,"gyro_x":21,"gyro_y":-1213,"gyro_z":-8957,"freq":100},
      {"accel_x":2164,"accel_y":-1596,"accel_z":16028,"gyro_x":-221,"gyro_y":-270,"gyro_z":-6407,"freq":100},
      {"accel_x":1240,"accel_y":-620,"accel_z":16636,"gyro_x":-228,"gyro_y":-409,"gyro_z":-5249,"freq":100},
      {"accel_x":-520,"accel_y":-432,"accel_z":17168,"gyro_x":-148,"gyro_y":482,"gyro_z":-2759,"freq":100},
      {"accel_x":1428,"accel_y":1748,"accel_z":17436,"gyro_x":-173,"gyro_y":76,"gyro_z":-3553,"freq":100},
      {"accel_x":620,"accel_y":2792,"accel_z":16664,"gyro_x":-295,"gyro_y":34,"gyro_z":-3608,"freq":100},
      {"accel_x":308,"accel_y":-104,"accel_z":17124,"gyro_x":-147,"gyro_y":278,"gyro_z":98,"freq":100},
      {"accel_x":2160,"accel_y":1612,"accel_z":16708,"gyro_x":-176,"gyro_y":323,"gyro_z":1963,"freq":100},
      {"accel_x":328,"accel_y":728,"accel_z":17260,"gyro_x":-146,"gyro_y":577,"gyro_z":22772,"freq":100},
      {"accel_x":2364,"accel_y":1676,"accel_z":16140,"gyro_x":-208,"gyro_y":576,"gyro_z":9641,"freq":100},
      {"accel_x":-2864,"accel_y":-656,"accel_z":18044,"gyro_x":238,"gyro_y":-2528,"gyro_z":12959,"freq":100},
      {"accel_x":-392,"accel_y":360,"accel_z":17680,"gyro_x":260,"gyro_y":320,"gyro_z":24359,"freq":100},
      {"accel_x":-60,"accel_y":240,"accel_z":16772,"gyro_x":-151,"gyro_y":-1661,"gyro_z":13419,"freq":100},
      {"accel_x":-2156,"accel_y":1156,"accel_z":16808,"gyro_x":343,"gyro_y":460,"gyro_z":18949,"freq":100},
      {"accel_x":-692,"accel_y":-1196,"accel_z":15668,"gyro_x":119,"gyro_y":340,"gyro_z":12858,"freq":100},
      {"accel_x":1244,"accel_y":892,"accel_z":16912,"gyro_x":182,"gyro_y":119,"gyro_z":13988,"freq":100},
      {"accel_x":-320,"accel_y":1712,"accel_z":16836,"gyro_x":86,"gyro_y":80,"gyro_z":13693,"freq":100},
      {"accel_x":-288,"accel_y":556,"accel_z":16688,"gyro_x":-50,"gyro_y":187,"gyro_z":7570,"freq":100},
      {"accel_x":2552,"accel_y":1168,"accel_z":15600,"gyro_x":46,"gyro_y":-5,"gyro_z":9254,"freq":100},
      {"accel_x":212,"accel_y":604,"accel_z":16564,"gyro_x":-57,"gyro_y":412,"gyro_z":6473,"freq":100},
      {"accel_x":152,"accel_y":-624,"accel_z":16656,"gyro_x":-180,"gyro_y":233,"gyro_z":-197,"freq":100},
      {"accel_x":556,"accel_y":-704,"accel_z":16872,"gyro_x":-251,"gyro_y":62,"gyro_z":-3315,"freq":100},
      {"accel_x":376,"accel_y":-204,"accel_z":16524,"gyro_x":-386,"gyro_y":86,"gyro_z":-10387,"freq":100},
      {"accel_x":1100,"accel_y":800,"accel_z":16236,"gyro_x":-638,"gyro_y":279,"gyro_z":-18450,"freq":100},
      {"accel_x":1220,"accel_y":1180,"accel_z":17116,"gyro_x":-720,"gyro_y":18,"gyro_z":-18056,"freq":100},
      {"accel_x":876,"accel_y":212,"accel_z":16444,"gyro_x":-371,"gyro_y":307,"gyro_z":-9016,"freq":100},
      {"accel_x":1168,"accel_y":756,"accel_z":17012,"gyro_x":-323,"gyro_y":288,"gyro_z":-6505,"freq":100},
      {"accel_x":1112,"accel_y":148,"accel_z":16084,"gyro_x":-239,"gyro_y":209,"gyro_z":122,"freq":100},
      {"accel_x":556,"accel_y":44,"accel_z":16692,"gyro_x":-162,"gyro_y":219,"gyro_z":125,"freq":100},
      {"accel_x":1028,"accel_y":196,"accel_z":17088,"gyro_x":-228,"gyro_y":198,"gyro_z":-699,"freq":100},
      {"accel_x":320,"accel_y":-8,"accel_z":17648,"gyro_x":-135,"gyro_y":-1840,"gyro_z":144,"freq":100},
      {"accel_x":852,"accel_y":72,"accel_z":18768,"gyro_x":-76,"gyro_y":-11350,"gyro_z":327,"freq":100},
      {"accel_x":3556,"accel_y":328,"accel_z":16940,"gyro_x":-159,"gyro_y":-9856,"gyro_z":200,"freq":100},
      {"accel_x":7596,"accel_y":-88,"accel_z":13928,"gyro_x":244,"gyro_y":-12663,"gyro_z":1011,"freq":100},
      {"accel_x":9720,"accel_y":152,"accel_z":13440,"gyro_x":-93,"gyro_y":-10547,"gyro_z":296,"freq":100},
      {"accel_x":11048,"accel_y":-100,"accel_z":11816,"gyro_x":-367,"gyro_y":-8386,"gyro_z":-20,"freq":100},
      {"accel_x":12572,"accel_y":196,"accel_z":10572,"gyro_x":-135,"gyro_y":-6901,"gyro_z":229,"freq":100},
      {"accel_x":14244,"accel_y":-68,"accel_z":7344,"gyro_x":-43,"gyro_y":-14158,"gyro_z":377,"freq":100},
      {"accel_x":15220,"accel_y":188,"accel_z":6500,"gyro_x":-69,"gyro_y":-3951,"gyro_z":221,"freq":100},
      {"accel_x":15256,"accel_y":516,"accel_z":5600,"gyro_x":680,"gyro_y":-7623,"gyro_z":505,"freq":100},
      {"accel_x":15952,"accel_y":236,"accel_z":3820,"gyro_x":-104,"gyro_y":-5868,"gyro_z":228,"freq":100},
      {"accel_x":18280,"accel_y":-1692,"accel_z":2260,"gyro_x":2870,"gyro_y":405,"gyro_z":1157,"freq":100},
      {"accel_x":16328,"accel_y":-72,"accel_z":2656,"gyro_x":-107,"gyro_y":-8293,"gyro_z":61,"freq":100},
      {"accel_x":16652,"accel_y":-208,"accel_z":2992,"gyro_x":4109,"gyro_y":-2577,"gyro_z":314,"freq":100},
      {"accel_x":16732,"accel_y":504,"accel_z":-2136,"gyro_x":1616,"gyro_y":-6269,"gyro_z":602,"freq":100},
      {"accel_x":16320,"accel_y":64,"accel_z":-852,"gyro_x":-625,"gyro_y":-992,"gyro_z":238,"freq":100},
      {"accel_x":16380,"accel_y":4,"accel_z":-2688,"gyro_x":-178,"gyro_y":-633,"gyro_z":123,"freq":100},
      {"accel_x":16160,"accel_y":384,"accel_z":-2020,"gyro_x":483,"gyro_y":411,"gyro_z":-33,"freq":100},
      {"accel_x":16188,"accel_y":-88,"accel_z":-2532,"gyro_x":1087,"gyro_y":1365,"gyro_z":-106,"freq":100},
      {"accel_x":16712,"accel_y":364,"accel_z":-1196,"gyro_x":-1978,"gyro_y":7388,"gyro_z":233,"freq":100},
      {"accel_x":16288,"accel_y":176,"accel_z":780,"gyro_x":-287,"gyro_y":10234,"gyro_z":-64,"freq":100},
      {"accel_x":15224,"accel_y":-52,"accel_z":5372,"gyro_x":-294,"gyro_y":16089,"gyro_z":-174,"freq":100},
      {"accel_x":14260,"accel_y":200,"accel_z":7228,"gyro_x":-225,"gyro_y":21964,"gyro_z":523,"freq":100},
      {"accel_x":13304,"accel_y":388,"accel_z":7544,"gyro_x":-57,"gyro_y":16961,"gyro_z":263,"freq":100},
      {"accel_x":9168,"accel_y":-312,"accel_z":11692,"gyro_x":-1516,"gyro_y":13483,"gyro_z":-923,"freq":100},
      {"accel_x":4608,"accel_y":-408,"accel_z":17352,"gyro_x":-339,"gyro_y":8703,"gyro_z":-358,"freq":100},
      {"accel_x":3988,"accel_y":-868,"accel_z":17156,"gyro_x":-1577,"gyro_y":3020,"gyro_z":-4557,"freq":100},
      {"accel_x":3692,"accel_y":0,"accel_z":16540,"gyro_x":-207,"gyro_y":-1355,"gyro_z":68,"freq":100},
      {"accel_x":2200,"accel_y":272,"accel_z":16912,"gyro_x":-107,"gyro_y":2164,"gyro_z":653,"freq":100},
      {"accel_x":2532,"accel_y":-64,"accel_z":16120,"gyro_x":-162,"gyro_y":219,"gyro_z":57,"freq":100},
      {"accel_x":10520,"accel_y":1176,"accel_z":5604,"gyro_x":-1468,"gyro_y":6601,"gyro_z":-25,"freq":100},
      {"accel_x":376,"accel_y":116,"accel_z":16176,"gyro_x":-171,"gyro_y":-83,"gyro_z":172,"freq":100},
      {"accel_x":332,"accel_y":156,"accel_z":16924,"gyro_x":-188,"gyro_y":263,"gyro_z":113,"freq":100},
      {"accel_x":456,"accel_y":28,"accel_z":16840,"gyro_x":-183,"gyro_y":248,"gyro_z":102,"freq":100},
      {"accel_x":572,"accel_y":72,"accel_z":16772,"gyro_x":-210,"gyro_y":490,"gyro_z":110,"freq":100},
      {"accel_x":700,"accel_y":356,"accel_z":16992,"gyro_x":-121,"gyro_y":269,"gyro_z":1131,"freq":100},
      {"accel_x":704,"accel_y":-72,"accel_z":16756,"gyro_x":-201,"gyro_y":84,"gyro_z":-116,"freq":100},
      {"accel_x":2612,"accel_y":-120,"accel_z":17316,"gyro_x":-259,"gyro_y":131,"gyro_z":692,"freq":100},
      {"accel_x":-560,"accel_y":328,"accel_z":19444,"gyro_x":-141,"gyro_y":197,"gyro_z":82,"freq":100},
      {"accel_x":216,"accel_y":232,"accel_z":17080,"gyro_x":-232,"gyro_y":24,"gyro_z":-1536,"freq":100},
      {"accel_x":-156,"accel_y":-140,"accel_z":17612,"gyro_x":205,"gyro_y":2891,"gyro_z":-1305,"freq":100},
      {"accel_x":452,"accel_y":76,"accel_z":17164,"gyro_x":-235,"gyro_y":5839,"gyro_z":2268,"freq":100},
      {"accel_x":-2168,"accel_y":612,"accel_z":16272,"gyro_x":863,"gyro_y":4769,"gyro_z":1720,"freq":100},
      {"accel_x":-1792,"accel_y":560,"accel_z":16720,"gyro_x":513,"gyro_y":8067,"gyro_z":1387,"freq":100},
      {"accel_x":-3752,"accel_y":-188,"accel_z":17120,"gyro_x":-1097,"gyro_y":10182,"gyro_z":-1210,"freq":100},
      {"accel_x":-7136,"accel_y":-648,"accel_z":15204,"gyro_x":1631,"gyro_y":7446,"gyro_z":-3665,"freq":100},
      {"accel_x":-8908,"accel_y":-1112,"accel_z":14824,"gyro_x":-2065,"gyro_y":15176,"gyro_z":-846,"freq":100},
      {"accel_x":-10524,"accel_y":-752,"accel_z":13072,"gyro_x":214,"gyro_y":9233,"gyro_z":-927,"freq":100},
      {"accel_x":-13316,"accel_y":-1076,"accel_z":10024,"gyro_x":-3099,"gyro_y":16906,"gyro_z":3505,"freq":100},
      {"accel_x":-14616,"accel_y":-456,"accel_z":7020,"gyro_x":-124,"gyro_y":10826,"gyro_z":-2141,"freq":100},
      {"accel_x":-15696,"accel_y":-248,"accel_z":4368,"gyro_x":2862,"gyro_y":6493,"gyro_z":517,"freq":100},
      {"accel_x":-14828,"accel_y":-232,"accel_z":4500,"gyro_x":2491,"gyro_y":-5646,"gyro_z":548,"freq":100},
      {"accel_x":-16840,"accel_y":-1184,"accel_z":7400,"gyro_x":2456,"gyro_y":-3366,"gyro_z":1334,"freq":100},
      {"accel_x":-17096,"accel_y":-1052,"accel_z":5232,"gyro_x":-119,"gyro_y":6482,"gyro_z":2244,"freq":100},
      {"accel_x":-14304,"accel_y":504,"accel_z":1088,"gyro_x":-3284,"gyro_y":5253,"gyro_z":3224,"freq":100},
      {"accel_x":-14492,"accel_y":-1472,"accel_z":4160,"gyro_x":3393,"gyro_y":-7226,"gyro_z":-3312,"freq":100},
      {"accel_x":-19808,"accel_y":-6444,"accel_z":2868,"gyro_x":1354,"gyro_y":-7311,"gyro_z":-2302,"freq":100},
      {"accel_x":-15600,"accel_y":-856,"accel_z":3532,"gyro_x":-2957,"gyro_y":-1921,"gyro_z":4195,"freq":100},
      {"accel_x":-15256,"accel_y":888,"accel_z":5532,"gyro_x":-2562,"gyro_y":-2183,"gyro_z":1963,"freq":100},
      {"accel_x":-15836,"accel_y":1216,"accel_z":5524,"gyro_x":-530,"gyro_y":71,"gyro_z":301,"freq":100},
      {"accel_x":-15616,"accel_y":1020,"accel_z":5232,"gyro_x":155,"gyro_y":-1945,"gyro_z":-205,"freq":100},
      {"accel_x":-15536,"accel_y":704,"accel_z":5612,"gyro_x":1023,"gyro_y":-1187,"gyro_z":-288,"freq":100},
      {"accel_x":-15024,"accel_y":1264,"accel_z":5584,"gyro_x":-51,"gyro_y":507,"gyro_z":12,"freq":100},
      {"accel_x":-14984,"accel_y":936,"accel_z":5908,"gyro_x":-1413,"gyro_y":475,"gyro_z":417,"freq":100},
      {"accel_x":-14940,"accel_y":616,"accel_z":7312,"gyro_x":426,"gyro_y":-2494,"gyro_z":-242,"freq":100},
      {"accel_x":-14912,"accel_y":1096,"accel_z":6728,"gyro_x":-372,"gyro_y":1244,"gyro_z":237,"freq":100},
      {"accel_x":-15008,"accel_y":804,"accel_z":5640,"gyro_x":-1034,"gyro_y":1075,"gyro_z":514,"freq":100},
      {"accel_x":-14908,"accel_y":1372,"accel_z":6440,"gyro_x":1540,"gyro_y":421,"gyro_z":-454,"freq":100},
      {"accel_x":-14440,"accel_y":1972,"accel_z":8552,"gyro_x":-2695,"gyro_y":3023,"gyro_z":554,"freq":100},
      {"accel_x":-15560,"accel_y":800,"accel_z":7184,"gyro_x":217,"gyro_y":1654,"gyro_z":78,"freq":100},
      {"accel_x":-14252,"accel_y":-3036,"accel_z":8532,"gyro_x":-11308,"gyro_y":7229,"gyro_z":-17459,"freq":100},
      {"accel_x":-15672,"accel_y":-444,"accel_z":4724,"gyro_x":4266,"gyro_y":7912,"gyro_z":1510,"freq":100},
      {"accel_x":-15492,"accel_y":-104,"accel_z":2596,"gyro_x":113,"gyro_y":10418,"gyro_z":-132,"freq":100},
      {"accel_x":-16320,"accel_y":568,"accel_z":2804,"gyro_x":195,"gyro_y":63,"gyro_z":148,"freq":100},
      {"accel_x":-15988,"accel_y":-784,"accel_z":648,"gyro_x":-1066,"gyro_y":9081,"gyro_z":-24,"freq":100},
      {"accel_x":-16320,"accel_y":136,"accel_z":-1244,"gyro_x":-1132,"gyro_y":3503,"gyro_z":56,"freq":100},
      {"accel_x":-16228,"accel_y":-184,"accel_z":-1332,"gyro_x":-220,"gyro_y":4493,"gyro_z":63,"freq":100},
      {"accel_x":-15924,"accel_y":-348,"accel_z":-2640,"gyro_x":15,"gyro_y":836,"gyro_z":129,"freq":100},
      {"accel_x":-16084,"accel_y":-436,"accel_z":-2548,"gyro_x":692,"gyro_y":695,"gyro_z":269,"freq":100},
      {"accel_x":-16240,"accel_y":-104,"accel_z":-1972,"gyro_x":-730,"gyro_y":-2462,"gyro_z":18,"freq":100},
      {"accel_x":-14732,"accel_y":420,"accel_z":-8180,"gyro_x":-460,"gyro_y":-15361,"gyro_z":727,"freq":100},
      {"accel_x":-15756,"accel_y":168,"accel_z":3840,"gyro_x":-318,"gyro_y":-29781,"gyro_z":298,"freq":100},
      {"accel_x":-15148,"accel_y":-276,"accel_z":8372,"gyro_x":-2222,"gyro_y":-13341,"gyro_z":1229,"freq":100},
      {"accel_x":-14388,"accel_y":-132,"accel_z":8348,"gyro_x":141,"gyro_y":-9802,"gyro_z":-12,"freq":100},
      {"accel_x":-12256,"accel_y":304,"accel_z":9764,"gyro_x":-273,"gyro_y":-8511,"gyro_z":-194,"freq":100},
      {"accel_x":-9116,"accel_y":692,"accel_z":12348,"gyro_x":140,"gyro_y":-14195,"gyro_z":197,"freq":100},
      {"accel_x":-8744,"accel_y":76,"accel_z":13224,"gyro_x":-192,"gyro_y":-7914,"gyro_z":360,"freq":100},
      {"accel_x":-6264,"accel_y":568,"accel_z":15248,"gyro_x":-195,"gyro_y":-11488,"gyro_z":394,"freq":100},
      {"accel_x":-3800,"accel_y":24,"accel_z":15772,"gyro_x":256,"gyro_y":-4329,"gyro_z":1676,"freq":100},
      {"accel_x":-2312,"accel_y":548,"accel_z":16452,"gyro_x":-22,"gyro_y":-5114,"gyro_z":-1547,"freq":100},
      {"accel_x":-916,"accel_y":-252,"accel_z":15388,"gyro_x":-69,"gyro_y":-6182,"gyro_z":715,"freq":100},
      {"accel_x":-452,"accel_y":260,"accel_z":16788,"gyro_x":-186,"gyro_y":-562,"gyro_z":451,"freq":100},
      {"accel_x":-188,"accel_y":168,"accel_z":17184,"gyro_x":-199,"gyro_y":-12,"gyro_z":133,"freq":100},
      {"accel_x":176,"accel_y":24,"accel_z":17156,"gyro_x":-198,"gyro_y":517,"gyro_z":116,"freq":100},
      {"accel_x":372,"accel_y":44,"accel_z":16828,"gyro_x":-180,"gyro_y":164,"gyro_z":100,"freq":100},
      {"accel_x":260,"accel_y":100,"accel_z":16528,"gyro_x":-176,"gyro_y":259,"gyro_z":109,"freq":100},
      {"accel_x":772,"accel_y":100,"accel_z":16668,"gyro_x":-240,"gyro_y":543,"gyro_z":120,"freq":100},
      {"accel_x":-16,"accel_y":504,"accel_z":17092,"gyro_x":-178,"gyro_y":534,"gyro_z":-107,"freq":100},
      {"accel_x":28,"accel_y":-276,"accel_z":17032,"gyro_x":-202,"gyro_y":502,"gyro_z":-854,"freq":100},
      {"accel_x":188,"accel_y":-216,"accel_z":17864,"gyro_x":-3207,"gyro_y":416,"gyro_z":-898,"freq":100},
      {"accel_x":-180,"accel_y":-1544,"accel_z":16748,"gyro_x":-7836,"gyro_y":-234,"gyro_z":-896,"freq":100},
      {"accel_x":460,"accel_y":-3600,"accel_z":16036,"gyro_x":-7858,"gyro_y":553,"gyro_z":1989,"freq":100},
      {"accel_x":516,"accel_y":-4888,"accel_z":15948,"gyro_x":-6958,"gyro_y":-95,"gyro_z":-1020,"freq":100},
      {"accel_x":692,"accel_y":-6364,"accel_z":15184,"gyro_x":-7259,"gyro_y":-693,"gyro_z":-855,"freq":100},
      {"accel_x":536,"accel_y":-7696,"accel_z":14996,"gyro_x":-6129,"gyro_y":318,"gyro_z":-930,"freq":100},
      {"accel_x":388,"accel_y":-8892,"accel_z":14228,"gyro_x":-6037,"gyro_y":-168,"gyro_z":-325,"freq":100},
      {"accel_x":312,"accel_y":-9928,"accel_z":14364,"gyro_x":-5716,"gyro_y":135,"gyro_z":570,"freq":100},
      {"accel_x":260,"accel_y":-11420,"accel_z":13008,"gyro_x":-6364,"gyro_y":-311,"gyro_z":-135,"freq":100},
      {"accel_x":1088,"accel_y":-11768,"accel_z":10736,"gyro_x":-6747,"gyro_y":-291,"gyro_z":356,"freq":100},
      {"accel_x":768,"accel_y":-12736,"accel_z":10180,"gyro_x":-5739,"gyro_y":-10,"gyro_z":484,"freq":100},
      {"accel_x":736,"accel_y":-13624,"accel_z":9480,"gyro_x":-5655,"gyro_y":-645,"gyro_z":623,"freq":100},
      {"accel_x":632,"accel_y":-14344,"accel_z":7292,"gyro_x":-5488,"gyro_y":-587,"gyro_z":89,"freq":100},
      {"accel_x":-104,"accel_y":-15360,"accel_z":7320,"gyro_x":-4037,"gyro_y":829,"gyro_z":26,"freq":100},
      {"accel_x":696,"accel_y":-15440,"accel_z":6372,"gyro_x":-2065,"gyro_y":-30,"gyro_z":373,"freq":100},
      {"accel_x":188,"accel_y":-15820,"accel_z":6344,"gyro_x":-1346,"gyro_y":-1005,"gyro_z":-147,"freq":100},
      {"accel_x":968,"accel_y":-15804,"accel_z":5420,"gyro_x":3599,"gyro_y":1189,"gyro_z":7,"freq":100},
      {"accel_x":8,"accel_y":-14536,"accel_z":7520,"gyro_x":7822,"gyro_y":726,"gyro_z":-135,"freq":100},
      {"accel_x":1160,"accel_y":-13184,"accel_z":7828,"gyro_x":11413,"gyro_y":509,"gyro_z":166,"freq":100},
      {"accel_x":168,"accel_y":-10884,"accel_z":12636,"gyro_x":16543,"gyro_y":4324,"gyro_z":204,"freq":100},
      {"accel_x":204,"accel_y":-7592,"accel_z":16292,"gyro_x":17747,"gyro_y":3879,"gyro_z":1332,"freq":100},
      {"accel_x":-640,"accel_y":-5344,"accel_z":17848,"gyro_x":12498,"gyro_y":-255,"gyro_z":2016,"freq":100},
      {"accel_x":-484,"accel_y":-3740,"accel_z":17816,"gyro_x":9257,"gyro_y":2102,"gyro_z":3723,"freq":100},
      {"accel_x":-476,"accel_y":-1520,"accel_z":16892,"gyro_x":4759,"gyro_y":984,"gyro_z":4725,"freq":100},
      {"accel_x":-412,"accel_y":-668,"accel_z":18620,"gyro_x":4997,"gyro_y":-308,"gyro_z":6347,"freq":100},
      {"accel_x":-444,"accel_y":1884,"accel_z":14812,"gyro_x":1672,"gyro_y":2133,"gyro_z":5068,"freq":100},
      {"accel_x":-380,"accel_y":1940,"accel_z":17864,"gyro_x":1208,"gyro_y":2363,"gyro_z":4736,"freq":100},
      {"accel_x":-1908,"accel_y":2724,"accel_z":15644,"gyro_x":1379,"gyro_y":827,"gyro_z":2983,"freq":100},
      {"accel_x":-588,"accel_y":2060,"accel_z":16984,"gyro_x":-1186,"gyro_y":1720,"gyro_z":-3707,"freq":100},
      {"accel_x":-1416,"accel_y":1148,"accel_z":16608,"gyro_x":-5403,"gyro_y":406,"gyro_z":-7959,"freq":100},
      {"accel_x":-1288,"accel_y":1120,"accel_z":15356,"gyro_x":-3759,"gyro_y":-2732,"gyro_z":-11589,"freq":100},
      {"accel_x":156,"accel_y":344,"accel_z":17212,"gyro_x":-2849,"gyro_y":-1120,"gyro_z":-9317,"freq":100},
      {"accel_x":-1672,"accel_y":-192,"accel_z":16348,"gyro_x":-1782,"gyro_y":-498,"gyro_z":-8822,"freq":100},
      {"accel_x":744,"accel_y":-2904,"accel_z":17040,"gyro_x":-3509,"gyro_y":2449,"gyro_z":-9362,"freq":100},
      {"accel_x":516,"accel_y":-1656,"accel_z":16460,"gyro_x":-2635,"gyro_y":1430,"gyro_z":-6810,"freq":100},
      {"accel_x":-588,"accel_y":-1248,"accel_z":16020,"gyro_x":-1445,"gyro_y":1074,"gyro_z":-4206,"freq":100},
      {"accel_x":748,"accel_y":-1188,"accel_z":16160,"gyro_x":-266,"gyro_y":881,"gyro_z":-3185,"freq":100},
      {"accel_x":360,"accel_y":-644,"accel_z":16992,"gyro_x":1787,"gyro_y":1355,"gyro_z":2127,"freq":100},
      {"accel_x":800,"accel_y":-860,"accel_z":15348,"gyro_x":1000,"gyro_y":1729,"gyro_z":7674,"freq":100},
      {"accel_x":1260,"accel_y":56,"accel_z":16672,"gyro_x":2703,"gyro_y":-373,"gyro_z":9143,"freq":100},
      {"accel_x":-1292,"accel_y":1460,"accel_z":18716,"gyro_x":2953,"gyro_y":-794,"gyro_z":8984,"freq":100},
      {"accel_x":484,"accel_y":728,"accel_z":17588,"gyro_x":1435,"gyro_y":-2274,"gyro_z":8424,"freq":100},
      {"accel_x":420,"accel_y":1144,"accel_z":17480,"gyro_x":-688,"gyro_y":9614,"gyro_z":10565,"freq":100},
      {"accel_x":1376,"accel_y":1036,"accel_z":15284,"gyro_x":2429,"gyro_y":-6519,"gyro_z":9430,"freq":100},
      {"accel_x":480,"accel_y":1680,"accel_z":16916,"gyro_x":34,"gyro_y":1877,"gyro_z":8430,"freq":100},
      {"accel_x":-56,"accel_y":440,"accel_z":17148,"gyro_x":-1086,"gyro_y":-857,"gyro_z":5463,"freq":100},
      {"accel_x":-1044,"accel_y":1004,"accel_z":16836,"gyro_x":584,"gyro_y":-1891,"gyro_z":1712,"freq":100},
      {"accel_x":-112,"accel_y":352,"accel_z":16328,"gyro_x":287,"gyro_y":149,"gyro_z":520,"freq":100},
      {"accel_x":748,"accel_y":396,"accel_z":16992,"gyro_x":-2764,"gyro_y":251,"gyro_z":-5077,"freq":100},
      {"accel_x":1036,"accel_y":560,"accel_z":17576,"gyro_x":-1803,"gyro_y":-1160,"gyro_z":-8517,"freq":100},
      {"accel_x":980,"accel_y":384,"accel_z":17024,"gyro_x":-244,"gyro_y":1554,"gyro_z":-9960,"freq":100},
      {"accel_x":-260,"accel_y":524,"accel_z":15736,"gyro_x":-2548,"gyro_y":207,"gyro_z":-9555,"freq":100},
      {"accel_x":912,"accel_y":-712,"accel_z":16404,"gyro_x":-3236,"gyro_y":-2029,"gyro_z":-7105,"freq":100},
      {"accel_x":700,"accel_y":-1304,"accel_z":17044,"gyro_x":-6512,"gyro_y":735,"gyro_z":-2708,"freq":100},
      {"accel_x":504,"accel_y":-2376,"accel_z":14580,"gyro_x":-3717,"gyro_y":7010,"gyro_z":156,"freq":100},
      {"accel_x":-1216,"accel_y":-5096,"accel_z":15344,"gyro_x":-3608,"gyro_y":7705,"gyro_z":3703,"freq":100},
      {"accel_x":-3592,"accel_y":-4152,"accel_z":15616,"gyro_x":3477,"gyro_y":6368,"gyro_z":4449,"freq":100},
      {"accel_x":-6180,"accel_y":-2804,"accel_z":14632,"gyro_x":2791,"gyro_y":4156,"gyro_z":5940,"freq":100},
      {"accel_x":-7292,"accel_y":-404,"accel_z":16212,"gyro_x":6312,"gyro_y":2170,"gyro_z":7978,"freq":100},
      {"accel_x":-8216,"accel_y":4,"accel_z":15016,"gyro_x":6934,"gyro_y":-4450,"gyro_z":3924,"freq":100},
      {"accel_x":-3888,"accel_y":2224,"accel_z":17752,"gyro_x":5573,"gyro_y":-12507,"gyro_z":2542,"freq":100},
      {"accel_x":760,"accel_y":3124,"accel_z":16640,"gyro_x":2717,"gyro_y":-14022,"gyro_z":859,"freq":100},
      {"accel_x":4116,"accel_y":3812,"accel_z":15408,"gyro_x":-3062,"gyro_y":-5534,"gyro_z":-4090,"freq":100},
    ];
    this.data = JSON.parse(JSON.stringify(data));
  }
};

module.exports = MPU6050;

