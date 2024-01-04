import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import galaxyVertexShader from "./shaders/galaxy/vertex.glsl?raw"
import galaxyFragmentShader from "./shaders/galaxy/fragment.glsl?raw"
import { EffectComposer, ShaderPass } from 'three/examples/jsm/Addons.js'
import { RenderPass } from 'three/examples/jsm/Addons.js'
import { Parameters } from './types'
import { UnrealBloomPass } from 'three/examples/jsm/Addons.js'
import { GlitchPass } from 'three/examples/jsm/Addons.js'
import { GammaCorrectionShader } from 'three/examples/jsm/Addons.js'

/**
 * Base
 */
// Debug
const gui: GUI = new GUI()

// Canvas
const canvas: HTMLElement = document.getElementById('webgl')


// Scene
const scene: THREE.Scene = new THREE.Scene()

/**
 * Galaxy
 */
const parameters = {} as Parameters;
parameters.count = 50000
parameters.size = 10.0
parameters.radius = 40.0
parameters.branches = 5
parameters.spin = 1
parameters.randomness = 5.0
parameters.randomnessPower = 1.70
parameters.insideColor = '#5e30eb'
parameters.outsideColor = '#00a3d7'

let geometry = null
let material = null
let points = null

const generateGalaxy = () =>
{
    if(points !== null)
    {
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }

    /**
     * Geometry
     */
    geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(parameters.count * 3)
    const randomness = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)
    const scales = new Float32Array(parameters.count * 1)

    const insideColor = new THREE.Color(parameters.insideColor)
    const outsideColor = new THREE.Color(parameters.outsideColor)

    for(let i = 0; i < parameters.count; i++)
    {
        const i3 = i * 3

        // Position
        const radius = Math.random() * parameters.radius

        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius

        positions[i3    ] = Math.cos(branchAngle) * radius
        positions[i3 + 1] = 0
        positions[i3 + 2] = Math.sin(branchAngle) * radius
    
        randomness[i3    ] = randomX
        randomness[i3 + 1] = randomY
        randomness[i3 + 2] = randomZ

        // Color
        const mixedColor = insideColor.clone()
        mixedColor.lerp(outsideColor, radius / parameters.radius)

        colors[i3    ] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b

        // Scale
        scales[i] = Math.random()
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))

    /**
     * Material
     */
    material = new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        uniforms:
        {
            uTime: { value: 0 },
            uSize: { value: 30 * renderer.getPixelRatio() }
        },    
        vertexShader: galaxyVertexShader,
        fragmentShader: galaxyFragmentShader
    })

    /**
     * Points
     */
    points = new THREE.Points(geometry, material)
    scene.add(points)
}

gui.add(parameters, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy)
gui.add(parameters, 'radius').min(0.01).max(40).step(0.01).onFinishChange(generateGalaxy)
gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy)
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)

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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = -20.0
camera.position.y = -0.0
camera.position.z = 10.0
camera.rotateZ(-75)
scene.add(camera)

// Lighting
// const light = new THREE.AmbientLight( 0x404040, 100 ); // soft white light
// scene.add( light );

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0x000000);

/**
 * Generate the first galaxy
 */
generateGalaxy()

/**
 * Animate
 */
const clock = new THREE.Clock()

// const resume_button: HTMLElement = document.getElementById("resume");
// resume_button.style.transform = `translateX(${-x}vw) translateY(${-y}px)`

// const github_button: HTMLElement = document.getElementById("github");
// github_button.style.transform = `translateX(${x}vw) translateY(${-y - 200}px)`

const opengl_button: HTMLElement = document.getElementById("opengl-button");
const vulkan_button: HTMLElement = document.getElementById("vulkan-button");
const api_button: HTMLElement = document.getElementById("api-button");
const opengl_video: HTMLElement = document.getElementById("opengl-video");
const vulkan_video: HTMLElement = document.getElementById("vulkan-video");
const api_image: HTMLElement = document.getElementById("api-image");

window.addEventListener("mousemove", (mouse) => {
    opengl_video.style.transform = `translateX(${mouse.clientX + 50}px) translateY(${mouse.clientY + 300}px)`
    vulkan_video.style.transform = `translateX(${mouse.clientX + 50}px) translateY(${mouse.clientY + 300}px)`
    api_image.style.transform = `translateX(${mouse.clientX + 50}px) translateY(${mouse.clientY + 300}px)`
});

opengl_button.addEventListener("mouseenter", event => {
    console.log("entered")
    opengl_video.classList.remove("item-closed")
    opengl_video.classList.add("item-open")
})

opengl_button.addEventListener("mouseleave", event => {
    opengl_video.classList.remove("item-open")
    opengl_video.classList.add("item-closed")
})

vulkan_button.addEventListener("mouseenter", event => {
    console.log("entered")
    vulkan_video.classList.remove("item-closed")
    vulkan_video.classList.add("item-open")
})

vulkan_button.addEventListener("mouseleave", event => {
    vulkan_video.classList.remove("item-open")
    vulkan_video.classList.add("item-closed")
})

api_button.addEventListener("mouseenter", event => {
    console.log("entered")
    api_image.classList.remove("item-closed")
    api_image.classList.add("item-open")
})

api_button.addEventListener("mouseleave", event => {
    api_image.classList.remove("item-open")
    api_image.classList.add("item-closed")
})

// Post Processing

const effectComposer: EffectComposer = new EffectComposer(renderer);
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
effectComposer.setSize(sizes.width, sizes.height);

const renderPass = new RenderPass(scene, camera);
effectComposer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(new THREE.Vector2(sizes.width, sizes.height), 1.0, 1.0, 0.0);
effectComposer.addPass(bloomPass);

// const glitchPass = new GlitchPass();
// effectComposer.addPass(glitchPass);

// Must be called last
const gammaCorrectionShader = new ShaderPass(GammaCorrectionShader);
effectComposer.addPass(gammaCorrectionShader);





const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update material
    material.uniforms.uTime.value = elapsedTime

    // Update controls
    // controls.update()

    // Render
    // renderer.render(scene, camera)
    effectComposer.render();

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()