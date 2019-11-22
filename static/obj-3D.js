import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {OBJLoader2} from 'three/examples/jsm/loaders/OBJLoader2';

// Following the tutorial from
// https://threejsfundamentals.org/threejs/lessons/threejs-load-obj.html

const canvas = document.querySelector('#obj'); //Find canvas
const url = canvas.className;

// Takes all the data provided and renders it to canvas
const renderer = new THREE.WebGLRenderer({canvas});
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
document.body.appendChild(renderer.domElement);

// Scene: root of a form of scene graph; everything needs to be added to
// a scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x7F7F7F);  // Gray

// Get a camera
const fov = 45;  // Field of view (in vertical dimension in degrees)
// Display aspect (width/height); default (300x150px)
const aspect = canvas.clientWidth / canvas.clientHeight;
const near = 0.1;  // Space in front of camera that will be rendered (start)
// Space in front of camera that will be rendered (end), aka draw distance
const far = 100; 
// All 4 settings = frustum (name of a 3D shape that looks like a pyramid
// with the tip sliced off) - anything inside is rendered
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
// Default is looking down -Z axis and up +Y axis so move the camera down
// to see
camera.position.set(10, 0, 0);

//Controls for orbit
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 5, 0);
controls.update();

function cameraOnObj(sizeToFitOnScreen, boxSize, boxCenter, camera) {
  // The goal is to calulate the distance (2D x axis) from the box where the
  // theoretical right triangle is based on the upper half of the camera view

  // Calculations
  // This the far side of the right triangle (2D y axis)
  const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
  // This is the angle of the right triangle (calculated from the half of the
  // camera view angle)
  const halfFovY = THREE.Math.degToRad(camera.fov * .5);
  // This gets the distance from the box (2D x axis)
  const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
  // Makes a unit vector that points in the same direction as the camera currently
  // in the xz plane from the center of the box (no y axis since ideally the
  // camera should not be under the object)
  const direction = (new THREE.Vector3())
      .subVectors(camera.position, boxCenter)
      .multiply(new THREE.Vector3(1, 0, 1))
      .normalize();

  // Update the camera
  // Move the camera away from the box center equal to the calculated distance
  // in the calculated direction
  camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));
  // Same ratio as before but recalculated to the box
  camera.near = boxSize / 100;
  camera.far = boxSize * 100;
  camera.updateProjectionMatrix();
  // Point the camera the center of the box
  camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
}

// Load an obj into scene
const objLoader = new OBJLoader2();
objLoader.load(url,
  (root) => {
    root.updateMatrixWorld();
    scene.add(root);
    // Makes a box around the loaded obj - the camera frustum can be calculated
    // so that the entire box fits in the view
    const box = new THREE.Box3().setFromObject(root);

    // Get the dimesions to reset the camera with
    const boxSize = box.getSize(new THREE.Vector3()).length();
    const boxCenter = box.getCenter(new THREE.Vector3());

    // Call the previous function to set the camera frustum
    // SizeToFitOnScreen is larger than boxSize so there is some space around
    // the object
    cameraOnObj(boxSize * 1.1, boxSize, boxCenter, camera);

    // Update the orbital controls to handle the new size
    controls.maxDistance = boxSize * 10;
    controls.target.copy(boxCenter);
    controls.update();
  }
);

// Lights for the scene
{
  {
    // Does not cast shadows
    const skyColor = 0xFFFFFF;  // White
    const groundColor = 0x000000;  // Black
    const intensity = 1;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
  }

  {
    const color = 0xFFFFFF;  // White
    const intensity = 0.5;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(5, 10, 2);
    scene.add(light);
    scene.add(light.target);
  }
}


// Check if the camera needs to be adjusted
function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
}

// Render loop - anything updated will cause the browser to re-render
function render() {
  // Dynamically resize the camera to the CSS
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

// Request to browser to animate (render function is passed)
requestAnimationFrame(render);