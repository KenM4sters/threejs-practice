import { OrbitControls } from "three/examples/jsm/Addons.js";
import Experience from "./Experience";
import Sizes from "./Utils/Sizes";
import * as THREE from "three"

export default class Camera {

    experience: Experience;
    sizes: Sizes;
    scene: THREE.Scene;
    canvas: HTMLElement;
    instance: THREE.PerspectiveCamera;
    controls: OrbitControls;

    constructor() {
        console.log("My camera");
        
        this.experience = new Experience();
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.canvas = this.experience.canvas;

        console.log(this);

        this.setInstance();
        this.setOrbitControls();
        
    }

    setInstance() {
        this.instance = new THREE.PerspectiveCamera(
            35, 
            this.sizes.width / this.sizes.height, 
            0.1, 
            100
        );

        this.instance.position.set(6, 4, 8 );
        this.scene.add(this.instance);
    }

    setOrbitControls() {
        this.controls = new OrbitControls(this.instance, this.canvas);
    }
}