var mpu6050 = require('../lib/mpu6050-fake');
var MotionTracker = require('../lib/motion-tracker');


process.on('uncaughtException', function(err) {
  console.error(err.stack);
});

exports["Motion Tracker"] = {
  setUp: function(done) {
    done();
  },

  basicTest: function(test) {
    test.expect(1);

    var mpu = new mpu6050();
    var motion_tracker = new MotionTracker(mpu);

    motion_tracker.run();

    motion_tracker.on('data', function(data) {
      test.ok(typeof(data) != "undefined");
      motion_tracker.stop();
    });

    motion_tracker.on('stop', function(data) {
      test.done();
    });

  },

  jsonDataTest: function(test) {
    test.expect(2);

    var mpu = new mpu6050();
    mpu.test_data(__dirname + '/gyro-data/drehung-links.json');
    var motion_tracker = new MotionTracker(mpu);

    motion_tracker.run();

    motion_tracker.on('data', function(data) {
      test.deepEqual(data.gyro.raw[0] , -192, 'Richtiger Messwert');
      test.ok(typeof(data) != "undefined");
      motion_tracker.stop();
    });

    motion_tracker.on('stop', function(data) {
      test.done();
    });

  },
};
