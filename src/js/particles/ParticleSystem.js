import * as THREE from 'three';
import { GL } from '../gl/GLTools';
import { GLTexture } from '../gl/GLTexture';
import { Framebuffer } from '../gl/Framebuffer';
import { ViewCalculate } from './ViewCalculate';
import { ViewMap } from './ViewMap';
import { ViewSave } from './ViewSave';

const dotTexturePath = new URL('../../assets/textures/dot.png', import.meta.url).href;


// Global params for particles
export const params = {
    numParticles: 128,  // This will create 128*128 particles
    velOffset: 0.01,
    accOffset: 0.001,
    posOffset: 4.5,
    decreaseRate: 0.9963
};

export class ParticleSystem {
    constructor(emissionPoint) {
        this.emissionPoint = emissionPoint;
        this._init();
    }

    async _init() {
        // Initialize WebGL context using the Three.js renderer
        const canvas = document.querySelector('canvas.webgl');
        GL.init(canvas);

        
        // // Load dot texture
        // const textureLoader = new THREE.TextureLoader();
        // const dotTexture = await textureLoader.loadAsync('../assets/textures/dot.png');
        // this.texDot = new GLTexture(dotTexture.image);
        try {
            // Load dot texture
            const textureLoader = new THREE.TextureLoader();
            const dotTexture = await textureLoader.loadAsync(dotTexturePath);
            this.texDot = new GLTexture(dotTexture.image);
        } catch (error) {
            console.warn('Failed to load dot texture, creating fallback');
            // Create a fallback texture - a white dot
            const canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 32;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(16, 16, 8, 0, Math.PI * 2);
            ctx.fill();
            this.texDot = new GLTexture(canvas);
        }

        // Initialize particles
        const numParticles = params.numParticles * params.numParticles;
        this.particles = [];
        
        for(let i = 0; i < numParticles; i++) {
            this.particles.push({
                x: Math.random(),
                y: 0.4 + Math.random() * 0.2,
                z: 0.4 + Math.random() * 0.2
            });
        }

        // Initialize framebuffers
        this.fboCurrent = new Framebuffer(
            params.numParticles * 2.0, 
            params.numParticles, 
            GL.gl.NEAREST, 
            GL.gl.NEAREST
        );
        
        this.fboTarget = new Framebuffer(
            params.numParticles * 2.0, 
            params.numParticles, 
            GL.gl.NEAREST, 
            GL.gl.NEAREST
        );

        // Initialize views
        this._vSave = new ViewSave(this.particles);
        this._vMap = new ViewMap(this.particles);
        this._vCal = new ViewCalculate();

        // Initial save of particle positions
        this.fboCurrent.bind();
        GL.gl.viewport(0, 0, this.fboCurrent.width, this.fboCurrent.height);
        GL.gl.clearColor(0.35, 0.5, 0.5, 1);
        GL.gl.clear(GL.gl.COLOR_BUFFER_BIT | GL.gl.DEPTH_BUFFER_BIT);
        this._vSave.render();
        this.fboCurrent.unbind();

        this.fboTarget.bind();
        GL.gl.clear(GL.gl.COLOR_BUFFER_BIT | GL.gl.DEPTH_BUFFER_BIT);
        this.fboTarget.unbind();
    }

    update() {
        if (!this.fboCurrent || !this.fboTarget) return;

        // Calculate new positions
        this.fboTarget.bind();
        this._vCal.render(this.fboCurrent.getTexture());
        this.fboTarget.unbind();

        // Render particles
        this._vMap.render(this.fboTarget.getTexture(), this.texDot);

        // Swap buffers
        const tmp = this.fboTarget;
        this.fboTarget = this.fboCurrent;
        this.fboCurrent = tmp;
    }
}