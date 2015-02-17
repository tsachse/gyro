angular.module('monitor', [])

  .controller('MonitorCtrl', function ($scope, $http) {

    $scope.mpu = {};
    $scope.hcsr04 = {};
    
    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
    //camera.position.x = 500;
    camera.position.set( 500, 500, 500 );
    // z-Achse nach oben
    camera.up = new THREE.Vector3( 0, 0, 1 );
    camera.lookAt(new THREE.Vector3( 0, 0, 0 ));

    var geometry = new THREE.BoxGeometry( 200, 100, 50 );
    var material = new THREE.MeshBasicMaterial( { color: 0xffff00, wireframe: true } );

    var mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );
    scene.add(new THREE.AxisHelper(500));

    var gridXY = new THREE.GridHelper(500, 30);
    gridXY.rotation.x = Math.PI/2;
    scene.add(gridXY);

    var gridYZ = new THREE.GridHelper(500, 30);
    gridYZ.position.set( -1500,-500,0 );
    gridYZ.rotation.z = Math.PI/2;
    gridYZ.setColors( new THREE.Color(0xffffff), new THREE.Color(0x00ff00) );
    scene.add(gridYZ);
    
    var canvas = document.getElementById("gyroCanvas");
        
    var renderer = new THREE.WebGLRenderer({canvas:canvas});
    renderer.setSize(canvas.width, canvas.height);
    renderer.render(scene, camera);
    $scope.renderer = renderer;
    $scope.mesh = mesh;
    $scope.rad_factor = Math.PI / 180;
    
    $scope.primus = new Primus();
    $scope.primus.on('data', function received(data) {
      if("mpu6050" in data) {
	$scope.mpu = data.mpu6050; 
	$scope.$apply();
	$scope.mesh.rotation.x = $scope.mpu.gyro.rotation[0] * $scope.rad_factor;
	$scope.mesh.rotation.y = $scope.mpu.gyro.rotation[1] * $scope.rad_factor;
	$scope.mesh.rotation.z = $scope.mpu.gyro.rotation[2] * $scope.rad_factor;
	$scope.renderer.render(scene, camera);
      }
      if("hcsr04" in data) {
	$scope.hcsr04 = data.hcsr04;
      }
    });

  });

// http://jsfiddle.net/rohitghatol/tn9sm/
// http://jsfiddle.net/NycWc/1/
// http://danni-three.blogspot.de/2013/09/threejs-helpers.html
