angular.module('monitor', [])

  .controller('MonitorCtrl', function ($scope, $http) {

    $scope.mpu = {};
    $scope.primus = new Primus();
    $scope.primus.on('data', function received(data) {
      $scope.mpu = data.mpu6050; 
      $scope.$apply();
    });

  });
