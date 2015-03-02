angular.module('rc3', ['ngResource'])
  .factory('RC3', function ($resource) {
    var RC3 = $resource('/api/rc3/:start_stop/:pitch/:roll/:yaw', 
      {
	 start_stop : '@start_stop',
	 pitch : '@pitch',
	 roll : '@roll',
	 yaw : '@yaw'
      });

    return RC3;
  })
  .controller('RC3Ctrl', function($scope, $location,RC3){
    $scope.cmd = function() {
      var start_stop = 'STOP';
      if($scope.started) {
	start_stop = 'START';
      }
      RC3.get({
	 'start_stop' : start_stop,
	 'pitch' : $scope.pitch,
	 'roll' : $scope.roll,
	 'yaw' : $scope.yaw
      });
    }

    $scope.start_stop = 'START';
    $scope.started = false;
    $scope.yaw = 0;
    $scope.pitch = 0;
    $scope.roll = 0;
    $scope.toggle_start_stop = function() {
      if($scope.started) {
	$scope.started = false;
	$scope.start_stop = 'START';
	$scope.cmd();
      } else {
	$scope.started = true;
	$scope.start_stop = 'STOP';
	$scope.cmd();
      }
    }

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', function(eventData) {
	var changed = false;
	if(($scope.yaw !== Math.round(eventData.alpha)) ||
	   ($scope.pitch !== Math.round(eventData.beta)) ||
	   ($scope.roll !== Math.round(eventData.gamma))) {
	  changed =true;
	}
	$scope.yaw = Math.round(eventData.alpha);
	$scope.pitch = Math.round(eventData.beta);
	$scope.roll = Math.round(eventData.gamma);
	if(changed) {
	  $scope.$apply();
	  if($scope.started) {
	    $scope.cmd();
	  }
	}
      });
    }

  });
