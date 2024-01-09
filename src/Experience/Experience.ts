import Sizes from "./Utils/Sizes";
import Time from "./Utils/Time";
import * as THREE from "three";
import Camera from "./Camera";

let instance = null;

export default class Experience {

    canvas: HTMLElement;
    sizes: Sizes;
    time: Time; 
    scene: THREE.Scene;
    camera: Camera;

    constructor(canvas?: HTMLElement) {

        if(instance) {
            return instance;
        }

        instance = this;

        // Options
        this.canvas = canvas;
        
        // Setup
        this.sizes = new Sizes();
        this.time = new Time();
        this.scene = new THREE.Scene();
        this.camera = new Camera();

        // Sizes - resize event
        this.sizes.on('resize', () => {

            this.resize();

        })

        // Time - updating time
        this.time.on("tick", () => {
            this.update();
        })

    }
    
    resize() {
        console.log(this);
        
    }

    update() {
        console.log("updating experience");
        
    }
}