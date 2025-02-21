//Copyright 2020 Radost Waszkiewicz
//Permission is hereby granted, free of charge, to any person obtaining a copy 
//of this software and associated documentation files (the "Software"), to deal 
//in the Software without restriction, including without limitation the rights 
//to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
//copies of the Software, and to permit persons to whom the Software is 
//furnished to do so, subject to the following conditions:
//The above copyright notice and this permission notice shall be included in all
//copies or substantial portions of the Software.
//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
//IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
//FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
//AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
//LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
//SOFTWARE.

import * as THREE from './external/three.module.js';
import { OrbitControls } from './external/OrbitControls.js';
import * as VIRIDIS from './external/viridis.js'


let camera, controls, scene, renderer;

init();
//render(); // remove when using next line for animation loop (requestAnimationFrame)
animate();

function init() {

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xcccccc );
	
	//renderer = new THREE.WebGLRenderer( { antialias: true } );
    let beadCanvas = document.getElementById("beadCanvas");
    renderer = new THREE.WebGLRenderer( { canvas: beadCanvas } );

	//renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( 0.7*window.innerWidth, 0.7*window.innerHeight );
	//document.body.appendChild( renderer.domElement );

	//camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 5000 );
    camera = new THREE.PerspectiveCamera( 60, beadCanvas.width / beadCanvas.height, 1, 5000 );
    camera.position.set( 0, 7, 20 );

	// controls
	controls = new OrbitControls( camera, renderer.domElement );
	//controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

	controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
	controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
	controls.minDistance = 1;
	controls.maxDistance = 5000;
	controls.maxPolarAngle = Math.PI; // Set to PI/2 to block at floor level

    //beads

    var initialBeadspec = [
    [[4.32,-3.78,1.34],2],

    [[2.82,-1.27,0.67],1],
    [[0.97,-1.67,1.33],1],
    [[0.22,-0.08,0.37],1],
    [[-0.93,0.25,-1.21],1],
    [[-1.87,1.82,0.93],1],

    [[-5.55,4.73,-2.11],4],
    ];

	displayBeads(initialBeadspec);

	// lights

	const dirLight1 = new THREE.DirectionalLight( 0xffffff );
	dirLight1.position.set( 1, 1, 1 );
	scene.add( dirLight1 );

	const dirLight2 = new THREE.DirectionalLight( 0x002288 );
	dirLight2.position.set( - 1, - 1, - 1 );
	scene.add( dirLight2 );

	const ambientLight = new THREE.AmbientLight( 0x222222 );
	scene.add( ambientLight );

	//
	window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {

	//camera.aspect = window.innerWidth / window.innerHeight;
    renderer.setSize( 0.7*window.innerWidth, 0.6*window.innerHeight );
    camera.aspect = beadCanvas.width / beadCanvas.height;
	camera.updateProjectionMatrix();
	//renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {

	requestAnimationFrame( animate );
	controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
	render();
}

function render() {
	renderer.render( scene, camera );
}

function displayBeads(beadspec)
{
    var bead = scene.getObjectByName("bead");
    while(bead)
    {
        bead.geometry.dispose();
        bead.material.dispose();
        scene.remove(bead);
        bead = scene.getObjectByName("bead");        
    }
    renderer.renderLists.dispose();

    //const geometry = new THREE.SphereGeometry( 1, 10, 10 );
    const geometry = new THREE.IcosahedronGeometry( 1, 1);

	for (var i = 0; i < beadspec.length; i++) 
    {
        var col = VIRIDIS.viridis_hex( i / beadspec.length );
        var material = new THREE.MeshPhongMaterial( { color: col, flatShading: true } );
		var mesh = new THREE.Mesh( geometry, material );
		mesh.position.x = beadspec[i][0][0];
		mesh.position.y = beadspec[i][0][1];
		mesh.position.z = beadspec[i][0][2];
        var s = beadspec[i][1];
        mesh.scale.set(s,s,s);
		mesh.updateMatrix();
		mesh.matrixAutoUpdate = false;
        mesh.name = "bead";
		scene.add( mesh );
	}


    animate();
}
window.displayBeads = displayBeads;

