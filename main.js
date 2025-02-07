import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createChimney } from './boiler.js';
import { ParticleSystem } from './ParticleSystem.js';
import './style.css';

const COLORS = {
    black: 0x000000,
    white: 0xFFFFFF,
    grey: 0x808080,
    lightgrey: 0xF0F0F0,
    blue: 0x0000FF,
};

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();
window.scene = scene; // Make scene globally available for particle system

// Add fog
scene.fog = new THREE.Fog(0xf0f0f0, 20, 100);

// Grid Helper
const gridHelper = new THREE.GridHelper(50, 20, COLORS.white, COLORS.white);
gridHelper.position.y = -10;
scene.add(gridHelper);

// Create and add chimney
const chimney = createChimney();
scene.add(chimney);

// Create particle system
const particleSystem = new ParticleSystem(new THREE.Vector3(0, 10, 0));

// Lights
const ambientLight = new THREE.AmbientLight(COLORS.white, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(COLORS.white, 0.8);
directionalLight.position.set(5, 15, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Make objects cast and receive shadows
chimney.traverse((child) => {
    if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
    }
});

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.x = -25;
camera.position.y = 15;
camera.position.z = 30;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
});

// Enable shadow mapping
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(COLORS.black, 1);

// Animation loop
const tick = () => {
    // Update particle system
    particleSystem.update();

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Request next frame
    window.requestAnimationFrame(tick);
};

tick();