angular.module('monitor', [])

  .controller('MonitorCtrl', function ($scope, $http) {

    $scope.mpu = {};
    
    //$scope.scene = new THREE.Scene();

    //$scope.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    //$scope.camera.position.z = 500;

    //$scope.geometry = new THREE.BoxGeometry( 200, 100, 50 );
    //$scope.material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

    //$scope.mesh = new THREE.Mesh( geometry, material );
    //$scope.scene.add( mesh );
    
    //$scope.canvas = document.getElementById("accelCanvas");
        
    //$scope.renderer = new THREE.WebGLRenderer({canvas:canvas});
    //$scope.renderer.setSize(canvas.width, canvas.height);
    //$scope.renderer.render(scene, camera);
    
    $scope.primus = new Primus();
    $scope.primus.on('data', function received(data) {
      $scope.mpu = data.mpu6050; 
      $scope.$apply();
    });

  });
