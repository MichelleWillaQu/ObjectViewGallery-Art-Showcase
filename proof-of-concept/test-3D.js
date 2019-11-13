import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {OBJLoader2} from 'three/examples/jsm/loaders/OBJLoader2';

//To load textures from .MTL file (what comes out of blender with .obj)
import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader.js';
import {MtlObjBridge} from 'three/examples/jsm/loaders/obj2/bridge/MtlObjBridge.js';

const canvas = document.querySelector('#obj'); //Find canvas

//Get a camera
const fov = 45; //Field of view (in vertical dimension in degrees)
const aspect = 2;  // display aspect (width/height); default (300x150px)
const near = 0.1; //space in front of camera that will be rendered (start)
//space in front of camera that will be rendered (end), aka draw distance
const far = 100; 
//All 4 settings = frustum (name of a 3D shape that looks like a pyramid
//with the tip sliced off) - anything inside is rendered
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
//default is looking down -Z axis and up +Y axis so move the camera down
//to see
camera.position.set(0, 10, 20);

//Controls for orbit
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 5, 0);
controls.update();

//Takes all the data provided and renders it to canvas
//const renderer = new THREE.WebGLRenderer({canvas, alpha: true});
const renderer = new THREE.WebGLRenderer({canvas});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//Scene: root of a form of scene graph; everything needs to be added to
//a scene
const scene = new THREE.Scene();
scene.background = new THREE.Color('white');



// // Load an obj into scene (loads in as black)
// const objLoader = new OBJLoader2();
// objLoader.load('/static/10.9swing.obj',
//     (root) => {
//         console.log('I loaded!', root)
//         scene.add(root);
// });


//When loading, needs light?
{
    {
    const skyColor = 0xB1E1FF;  // light blue
    const groundColor = 0xB97A20;  // brownish orange
    const intensity = 1;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
  }

  {
    const color = 0xFFFFFF; //white
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(5, 10, 2);
    scene.add(light);
    scene.add(light.target);
  }
}


//Load textures from a .MTL and load object
{
  const mtlLoader = new MTLLoader();
  mtlLoader.load('/static/Manarah.mtl', (mtlParseResult) => {
    const objLoader = new OBJLoader2();
    const objMaterials =  MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult);
    objLoader.addMaterials(objMaterials);
    objLoader.load('/static/Manarah.obj', (root) => {
      scene.add(root);
    });
  });
}


// To have a plane
{
    const planeSize = 40;
    const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
    const material = new THREE.MeshBasicMaterial({color: 0xd7f782});
    const mesh = new THREE.Mesh(planeGeo, material);
    mesh.rotation.x = Math.PI * -.5;
    scene.add(mesh);
}


// //BOX
// const boxWidth = 1;
// const boxHeight = 1;
// const boxDepth = 1;
// //Geometry: data (vertices) for shape
// const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
// //Material: how to draw the obj, shiny or flat, what color, what texture(s),
// //position, orientation, and scale
// const material = new THREE.MeshBasicMaterial({color: 0x44aa88});
// //Mesh: combination of geometry and material
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

//Check if browser supports WebGL before rendering, else display a message
// if (WEBGL.isWebGLAvailable()) {
//     // Initiate function or other initializations here
//     animate();
// }
// else {
//     var warning = WEBGL.getWebGLErrorMessage();
//     document.getElementById('h1').appendChild('WebGL not supported');
// }

//Regular render of object (like cube)
//renderer.render(scene, camera);

// // To animate, create a render or animate loop instead of directly rendering (draws the scene everytime screen is refreshed - typically 60fps)
// function animate() {
//     requestAnimationFrame(animate); //more advantages than setInterval s pauses when user navigates to another browser (lower processing power cost)
//     cube.rotation.x += 0.01; //runs every frame; what changes per frame
//     cube.rotation.y += 0.01;
//     renderer.render(scene, camera);
// }
// animate();

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


function render() {
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    //renderer.setClearColor(0x808080, 0);
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

requestAnimationFrame(render);