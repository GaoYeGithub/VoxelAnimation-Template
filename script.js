import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

const run = document.getElementById('run')
const startRec = document.getElementById("rec-start")
const stopRec = document.getElementById("rec-stop")
const statusRec = document.getElementById("rec-status")

stopRec.disabled = true
var capturer = new CCapture({ format: 'webm', workersPath: '/lib/', verbose: true, framerate: 60 });

function startRecording() {
  startRec.disabled = true
  stopRec.disabled = false

  capturer.start()
  statusRec.innerText = "Recording in progress"
}

function stopRecording() {
  startRec.disabled = false
  stopRec.disabled = true

  capturer.stop()
  capturer.save()
  statusRec.innerText = "Saving recording... This *may* take a while"
}

run.addEventListener('click', initScene)
startRec.addEventListener('click', startRecording)
stopRec.addEventListener('click', stopRecording)

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.5, 0);
controls.update();
controls.enablePan = false;
controls.enableDamping = true;

const loader = new THREE.TextureLoader();
const modelLoader = new OBJLoader();

scene.background = loader.load('assets/sky.jpg');

const logMaterial = new THREE.MeshBasicMaterial({ map: loader.load('assets/wood.png') })
const grassMaterial = new THREE.MeshBasicMaterial({ map: loader.load('assets/grass.png') })
const leavesMaterial = new THREE.MeshBasicMaterial({ map: loader.load('assets/leaves.png') })

const grass = new THREE.Mesh(new THREE.BoxGeometry(36, 5, 26), grassMaterial);
const log1 = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 1), logMaterial)
const log2 = new THREE.Mesh(new THREE.BoxGeometry(2, 3, 2), logMaterial)
const log3 = new THREE.Mesh(new THREE.BoxGeometry(2, 6, 2), logMaterial)
const leaf1 = new THREE.Mesh(new THREE.BoxGeometry(8.5, 3.5, 5), leavesMaterial)
const leaf2 = new THREE.Mesh(new THREE.BoxGeometry(6.5, 2, 4.5), leavesMaterial)
const smoke1 = new THREE.Mesh(new THREE.BoxGeometry(.5, .5, .5))
const smoke2 = new THREE.Mesh(new THREE.BoxGeometry(.25, .25, .25))
const smoke3 = new THREE.Mesh(new THREE.BoxGeometry(.1, .1, .1))

let apple;

const listener = new THREE.AudioListener();
const soundSettings = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
camera.add(listener);

function initScene() {
  run.disabled = true

  audioLoader.load('assets/bg.mp3', function(buffer) {
    soundSettings.setBuffer(buffer);
    soundSettings.setLoop(true);
    soundSettings.setVolume(0.5);
    soundSettings.play();
  });

  scene.add(grass);
  scene.add(log1)
  scene.add(log2)
  scene.add(log3)
  scene.add(leaf1)
  scene.add(leaf2)
  scene.add(new THREE.AmbientLight(0xFFFFFF, 1));

  modelLoader.load('assets/apple.obj', (obj) => {
    console.log("Model: APPLE, loaded")
    obj.position.x = -3 + Math.random() * 4
    obj.position.y = 6.5
    obj.position.z = 3
    obj.rotation.y = .5
    obj.scale.set(0.15, 0.15, 0.15)

    apple = obj

    scene.add(obj);
  }, undefined, undefined);

  modelLoader.load('assets/campfire.obj', (obj) => {
    console.log("Model: CAMPFIRE, loaded")

    obj.position.x = -5;
    obj.position.y = -.5;

    obj.rotation.x = THREE.MathUtils.degToRad(270)
    obj.rotation.z = .5;

    obj.scale.set(.05, .1, .05)

    scene.add(obj);
    scene.add(smoke1)
    scene.add(smoke2)
    scene.add(smoke3)
  }, undefined, undefined);

  modelLoader.load('assets/log.obj', (obj) => {
    console.log("Model: LOG, loaded")

    obj.position.x = -7;
    obj.position.y = -.5;
    obj.position.z = 1;

    obj.rotation.x = THREE.MathUtils.degToRad(270)

    obj.scale.set(.03, .03, .03)
    scene.add(obj);
  }, undefined, undefined);

  modelLoader.load('assets/log.obj', (obj) => {
    console.log("Model: LOG, loaded")

    obj.position.x = -5;
    obj.position.y = -.5;
    obj.position.z = 3;

    obj.rotation.x = THREE.MathUtils.degToRad(270)

    obj.scale.set(.03, .03, .03)
    scene.add(obj);
  }, undefined, undefined);

  modelLoader.load('assets/log.obj', (obj) => {
    console.log("Model: LOG, loaded")

    obj.position.x = -3.5;
    obj.position.z = -1.65;

    obj.rotation.y = THREE.MathUtils.degToRad(270)

    obj.scale.set(.03, .03, .08)
    scene.add(obj);
  }, undefined, undefined);

  modelLoader.load('assets/tent.obj', (obj) => {
    console.log("Model: TENT, loaded")

    obj.position.x = -2;
    obj.position.y = 0;
    obj.position.z = -4;

    obj.scale.set(1, 1, 1);

    scene.add(obj);
  }, undefined, undefined);

  grass.position.y = -3;

  log3.position.x = .4
  log3.position.y = 4.5
  log2.position.z = .5
  log3.position.z = -.2

  leaf2.position.x = -1.5
  leaf1.position.y = 6.5
  leaf2.position.y = 8.5
  leaf2.position.z = 1.2

  smoke1.position.x = -5
  smoke2.position.x = -5.5
  smoke3.position.x = -4.5
  smoke1.position.y = .5
  smoke2.position.y = .7
  smoke3.position.y = .8

  smoke1.rotation.y = .3
  smoke2.rotation.y = 8
  smoke3.rotation.y = .5

  camera.position.z = 16;
  camera.position.y = 16 / 4;

  animate();
}

const rainGeometry = new THREE.BufferGeometry();
const rainCount = 2000;

const rainPositions = new Float32Array(rainCount * 3);

for (let i = 0; i < rainCount; i++) {
  rainPositions[i * 3] = Math.random() * 50 - 25;
  rainPositions[i * 3 + 1] = Math.random() * 50;
  rainPositions[i * 3 + 2] = Math.random() * 50 - 25;
}

rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));

const rainMaterial = new THREE.PointsMaterial({
  color: 0xaaaaaa,
  size: 0.5,
  transparent: true
});

const rain = new THREE.Points(rainGeometry, rainMaterial);
scene.add(rain);

function animateRain() {
  const positions = rain.geometry.attributes.position.array;

  for (let i = 0; i < rainCount; i++) {
    positions[i * 3 + 1] -= 0.2;

    if (positions[i * 3 + 1] < 0) {
      positions[i * 3 + 1] = Math.random() * 50;
    }
  }

  rain.geometry.attributes.position.needsUpdate = true;
}

let tick = 0;
let falling = false;

function animate() {
  requestAnimationFrame(animate);

  if (smoke1 && smoke2 && smoke3) {
    smoke1.position.y += .027
    smoke2.position.y += .029
    smoke3.position.y += .03

    if (smoke1.position.y > 8) {
      smoke1.position.y = 0
    }

    if (smoke2.position.y > 8) {
      smoke2.position.y = 0
    }

    if (smoke3.position.y > 8) {
      smoke3.position.y = 0
    }
  }

  if (apple) {
    if (tick < 64) {
      apple.rotation.y += .01;
    } else if (tick < 126) {
      apple.rotation.y -= .01;
    } else {
      falling = true;
    }
  }

  if (falling && apple) {
    apple.position.y -= .08;
    if (apple.position.y < 0) {
      apple.position.y = 6.5;
      apple.position.x = -3 + Math.random() * 4;
      tick = 0;
      falling = false;
    }
  }

  animateRain();

  controls.update();
  renderer.render(scene, camera);
  capturer.capture(renderer.domElement);
  tick++;
}
