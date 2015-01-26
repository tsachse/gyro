angular.module('monitor', [])

  .controller('MonitorCtrl', function ($scope, $http) {

    $scope.mpu = {};
    
    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
    //camera.position.x = 500;
    camera.position.set( 300, 300, 300 );
    camera.up = new THREE.Vector3( 0, 0, 1 );
    camera.lookAt(new THREE.Vector3( 0, 0, 0 ));

    var geometry = new THREE.BoxGeometry( 200, 100, 50 );
    var material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

    var mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );
    scene.add(new THREE.AxisHelper(400));
    
    var canvas = document.getElementById("gyroCanvas");
        
    var renderer = new THREE.WebGLRenderer({canvas:canvas});
    renderer.setSize(canvas.width, canvas.height);
    renderer.render(scene, camera);
    $scope.renderer = renderer;
    $scope.mesh = mesh;
    
    $scope.primus = new Primus();
    $scope.primus.on('data', function received(data) {
      $scope.mpu = data.mpu6050; 
      $scope.$apply();
      $scope.mesh.rotation.x = $scope.mpu.gyro.delta[0];
      $scope.mesh.rotation.y = $scope.mpu.gyro.delta[1];
      $scope.mesh.rotation.z = $scope.mpu.gyro.delta[2];
      $scope.renderer.render(scene, camera);
    });

  });

// http://jsfiddle.net/rohitghatol/tn9sm/
// http://jsfiddle.net/NycWc/1/
