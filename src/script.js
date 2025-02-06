import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { createChimney } from './js/chimney/boiler';
import { ParticleSystem } from './js/particles/ParticleSystem';


// Debug
// import * as dat from 'dat.gui'
// const gui = new dat.GUI()

const COLORS = {
    black: 0x000000,
    white: 0xFFFFFF,
    grey: 0x808080,
    lightgrey: 0xF0F0F0,
    blue: 0x0000FF,
};

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

scene.fog = new THREE.Fog(0xf0f0f0, 20, 100)

// Objects
const gridHelper = new THREE.GridHelper(50, 20, COLORS.white, COLORS.white);
gridHelper.position.y = -10;
scene.add(gridHelper);

const chimney = createChimney();
scene.add(chimney);


const particleSystem = new ParticleSystem(new THREE.Vector3(0, 10, 0));

// Materials

// Mesh


// Lights
// Ambient light for general illumination
const ambientLight = new THREE.AmbientLight(COLORS.white, 0.5)
scene.add(ambientLight)

// Directional light for sun-like lighting
const directionalLight = new THREE.DirectionalLight(COLORS.white, 0.8)
directionalLight.position.set(5, 15, 10)
directionalLight.castShadow = true
scene.add(directionalLight)


// Make objects cast and receive shadows
chimney.traverse((child) => {
    if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
    }
})



/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
camera.position.x = -25
camera.position.y = 15
camera.position.z = 30
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true, // for smoother edges
})
// Enable shadow mapping
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(COLORS.black, 1);

/**
 * Animate
 */

//const clock = new THREE.Clock()

const tick = () =>
{

    //const elapsedTime = clock.getElapsedTime()

    // Update objects
    particleSystem.update();

    // Update Orbital Controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
