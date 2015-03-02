angular.module('rc3', ['ngResource'])
  .factory('RC3', function ($resource) {
    var RC3 = $resource('/api/rc3/:direction/:left/:right', 
      {
	 direction : '@direction',
	 left : '@left',
	 right : '@right'
      });

    return RC3;
  })
  .controller('RC3Ctrl', function($scope, $location){
    //$scope.cmd = function(direction) {
      // console.log(direction);
    //  RC3.get({'id': direction});
    //}
    $scope.start_stop = 'START';
    $scope.started = false;
    $scope.direction = 'FWD';
    $scope.speed_left = 0;
    $scope.speed_right = 0;
    $scope.yaw = 0;
    $scope.pitch = 0;
    $scope.roll = 0;
    $scope.toggle_start_stop = function() {
      if($scope.started) {
	$scope.started = false;
	$scope.start_stop = 'START';
	$scope.direction = 'FWD';
	$scope.speed_left = 0;
	$scope.speed_right = 0;
      } else {
	$scope.started = true;
	$scope.start_stop = 'STOP';
	$scope.direction = 'FWD';
	$scope.speed_left = 0;
	$scope.speed_right = 0;
      }
    }

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', function(eventData) {
	$scope.yaw = Math.round(eventData.alpha);
	$scope.pitch = Math.round(eventData.beta);
	$scope.roll = Math.round(eventData.gamma);
	$scope.$apply();

      });
    }

  });
