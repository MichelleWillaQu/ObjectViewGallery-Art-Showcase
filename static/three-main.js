import * as THREE from 'three'
import {OBJLoader2} from 'three/examples/jsm/loaders/OBJLoader2';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';

export function threejsEntry(itemList){
  const subjectList = [];

  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas, alpha: true});
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  function defaultScene(){
    // Default scene setup (including light)

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x7F7F7F);  // Gray
    const skyColor = 0xFFFFFF;  // White
    const groundColor = 0x000000;  // Black
    const intensity = 1;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);

    return scene;
  }

  function makeSceneSubject(type, elem, url){
    const scene = defaultScene();
    const camera = new THREE.PerspectiveCamera(45,
                       elem.clientWidth / elem.clientHeight, 0.1, 100);
    camera.position.set(10, 0, 0);
    // resolve (callback to resolve), reject (callback if any errors)
    return new Promise((resolve, reject) => {
      function cameraOnObj(sizeToFitOnScreen, boxSize, boxCenter, camera) {
        const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
        const halfFovY = THREE.Math.degToRad(camera.fov * .5);
        const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
        const direction = (new THREE.Vector3())
          .subVectors(camera.position, boxCenter)
          .multiply(new THREE.Vector3(1, 0, 1))
          .normalize();
        camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));
        camera.near = boxSize / 100;
        camera.far = boxSize * 100;
        camera.updateProjectionMatrix();
        camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
      }
      if (type === 'obj'){
        const objLoader = new OBJLoader2();
        objLoader.load(url,
          (root) => {
            root.updateMatrixWorld();
            scene.add(root);
            const box = new THREE.Box3().setFromObject(root);

            const boxSize = box.getSize(new THREE.Vector3()).length();
            const boxCenter = box.getCenter(new THREE.Vector3());

            cameraOnObj(boxSize * 1.1, boxSize, boxCenter, camera);
            return resolve({scene, camera, root});
          }
        );
      }
      else { // gltf type
        const gltfLoader = new GLTFLoader();
        gltfLoader.load(url, (gltf) => {
            const root = gltf.scene;
            scene.add(root);

            const box = new THREE.Box3().setFromObject(root);
            const boxSize = box.getSize(new THREE.Vector3()).length();
            const boxCenter = box.getCenter(new THREE.Vector3());

            cameraOnObj(boxSize * 1.1, boxSize, boxCenter, camera);
            return resolve({scene, camera, root});
          }
        );
      }
    });
  }

  function addSubject(idString, type, url){
    const elem = document.querySelector(`#${idString}`);
    makeSceneSubject(type, elem, url).then(({scene, camera, root}) => {
      renderer.render(scene, camera);
      subjectList.push({idString, fn: (rect) => {
        camera.aspect = rect.width / rect.height;
        camera.updateProjectionMatrix();
        root.rotation.y += 0.005;
        renderer.render(scene, camera);
      }});
    });
  }


  // Make the subjects and add to subject list
  for (const item of itemList){
    addSubject(item.name, item.type, item.url);
  }


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

  const clearColor = new THREE.Color('#000');
  function render() {
    resizeRendererToDisplaySize(renderer);

    renderer.setScissorTest(false);
    renderer.setClearColor(clearColor, 0);
    renderer.clear(true, true);
    renderer.setScissorTest(true);

    const transform = `translateY(${window.scrollY}px)`;
    renderer.domElement.style.transform = transform;

    for (const {idString, fn} of subjectList) {
      const elem = document.querySelector(`#${idString}`);
      // get the viewport relative position of this element
      const rect = elem.getBoundingClientRect();
      const {left, right, top, bottom, width, height} = rect;

      const isOffscreen =
          bottom < 0 ||
          top > renderer.domElement.clientHeight ||
          right < 0 ||
          left > renderer.domElement.clientWidth;

      if (!isOffscreen) {
        const distanceToBottom = renderer.domElement.clientHeight - bottom;
        renderer.setScissor(left, distanceToBottom, width, height);
        renderer.setViewport(left, distanceToBottom, width, height);

        fn(rect);
      }
    }
    requestAnimationFrame(render);
  }

  // Calls
  requestAnimationFrame(render);
}