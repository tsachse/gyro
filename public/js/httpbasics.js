angular.module('httpbasics', [])

  .controller('HttpBasicsCtrl', function ($scope, $http) {

    $scope.msg = 'Start ...';
    $scope.primus = new Primus();
    $scope.primus.on('data', function received(data) {
      $scope.msg = data.mpu6050; 
      $scope.$apply();
    });

  });
