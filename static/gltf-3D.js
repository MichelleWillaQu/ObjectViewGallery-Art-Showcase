import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';

// Following the tutorial from
// https://threejsfundamentals.org/threejs/lessons/threejs-load-obj.html

const canvas = document.querySelector('#gltf'); //Find canvas
const url = canvas.className;

// Takes all the data provided and renders it to canvas
const renderer = new THREE.WebGLRenderer({canvas});
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
document.body.appendChild(renderer.domElement);

// Scene: root of a form of scene graph; everything needs to be added to
// a scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x7F7F7F);  // gray

// Get a camera
const fov = 45;  // Field of view (in vertical dimension in degrees)
const aspect = 2;   // display aspect (width/height); default (300x150px)
const near = 0.1;  // space in front of camera that will be rendered (start)
// space in front of camera that will be rendered (end), aka draw distance
const far = 100; 
// All 4 settings = frustum (name of a 3D shape that looks like a pyramid
// with the tip sliced off) - anything inside is rendered
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
// default is looking down -Z axis and up +Y axis so move the camera down
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
  // makes a unit vector that points in the same direction as the camera currently
  // in the xz plane from the center of the box (no y axis since ideally the
  // camera should not be under the object)
  const direction = (new THREE.Vector3())
      .subVectors(camera.position, boxCenter)
      .multiply(new THREE.Vector3(1, 0, 1))
      .normalize();

  // Update the camera
  // move the camera away from the box center equal to the calculated distance
  // in the calculated direction
  camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));
  // same ratio as before but recalculated to the box
  camera.near = boxSize / 100;
  camera.far = boxSize * 100;
  camera.updateProjectionMatrix();
  // point the camera the center of the box
  camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
}

// Load an obj into scene
const gltfLoader = new GLTFLoader();
gltfLoader.load(url,
  (gltf) => {
    const root = gltf.scene;
    scene.add(root);
    // makes a box around the loaded obj - the camera frustum can be calculated
    // so that the entire box fits in the view
    const box = new THREE.Box3().setFromObject(root);

    // get the dimesions to reset the camera with
    const boxSize = box.getSize(new THREE.Vector3()).length();
    const boxCenter = box.getCenter(new THREE.Vector3());

    // call the previous function to set the camera frustum
    // sizeToFitOnScreen is larger than boxSize so there is some space around
    // the object
    cameraOnObj(boxSize * 1.1, boxSize, boxCenter, camera);

    // update the orbital controls to handle the new size
    controls.maxDistance = boxSize * 10;
    controls.target.copy(boxCenter);
    controls.update();
  }
);

// Lights for the scene
{
  {
    // does not cast shadows
    const skyColor = 0xFFFFFF;  // white
    const groundColor = 0x000000;  // black
    const intensity = 4;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
  }

  {
    const color = 0xFFFFFF;  // white
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(5, 10, 2);
    scene.add(light);
    scene.add(light.target);
  }
}


// render loop - anything updated will cause the browser to re-render
function render() {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

// request to browser to animate (render function is passed)
requestAnimationFrame(render);