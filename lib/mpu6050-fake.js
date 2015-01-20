/**
 * A FAKE MPU6050 minimal device I2C library for Node.js
/**
 * Default constructor, uses default I2C address or default SS Pin if SPI
 * @see MPU6050.DEFAULT_ADDRESS
 */
function MPU6050(device, address) {
  this.device = device || 'FAKE';
  this.address = address || MPU6050.DEFAULT_ADDRESS;
  this.data = clone(data);
}

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
    this.data = clone(data);
  }
  var sensor = this.data.pop();

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

module.exports = MPU6050;

data = [
 {"accel_x":141,"accel_y":142,"accel_z":143,"gyro_x":144,"gyro_y":145,"gyro_z":146,"freq":100},
 {"accel_x":241,"accel_y":142,"accel_z":143,"gyro_x":244,"gyro_y":245,"gyro_z":246,"freq":100},
 {"accel_x":241,"accel_y":142,"accel_z":143,"gyro_x":244,"gyro_y":245,"gyro_z":246,"freq":100},
 {"accel_x":241,"accel_y":142,"accel_z":143,"gyro_x":244,"gyro_y":245,"gyro_z":246,"freq":100},
 {"accel_x":341,"accel_y":342,"accel_z":343,"gyro_x":344,"gyro_y":345,"gyro_z":346,"freq":100}
];

function clone(a) {
  return JSON.parse(JSON.stringify(a));
};
