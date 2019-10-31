        import * as THREE from 'three'
        //import {OrbitControls} from 'three/examples/js/controls/OrbitControls';
        import {OBJLoader2} from 'three/examples/jsm/loaders/OBJLoader2';

        const canvas = document.querySelector('#obj'); //Find canvas
        
        //Get a camera
        const fov = 75; //Field of view (in vertical dimension in degrees)
        const aspect = window.innerWidth/window.innerHeight;  // display aspect (width/height); default (300x150px)
        const near = 0.1; //space in front of camera that will be rendered (start)
        //space in front of camera that will be rendered (end), aka draw distance
        const far = 1000; 
        //All 4 settings = frustum (name of a 3D shape that looks like a pyramid
        //with the tip sliced off) - anything inside is rendered
        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        //default is looking down -Z axis and up +Y axis so move the camera down
        //to see
        camera.position.z = 5;

        //Takes all the data provided and renders it to canvas
        const renderer = new THREE.WebGLRenderer({canvas});
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        
        //Scene: root of a form of scene graph; everything needs to be added to
        //a scene
        const scene = new THREE.Scene();

        // Load an obj into scene
        const objLoader = new OBJLoader2();
        objLoader.load('/static/10.9swing.obj',
            (root) => {
                console.log('I loaded!', root)
                scene.add(root);
        });

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

        renderer.render(scene, camera);

        // // To animate, create a render or animate loop instead of directly rendering (draws the scene everytime screen is refreshed - typically 60fps)
        // function animate() {
        //     requestAnimationFrame(animate); //more advantages than setInterval s pauses when user navigates to another browser (lower processing power cost)
        //     cube.rotation.x += 0.01; //runs every frame; what changes per frame
        //     cube.rotation.y += 0.01;
        //     renderer.render(scene, camera);
        // }
        // animate();