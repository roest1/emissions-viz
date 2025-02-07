import * as THREE from 'three';

export class ParticleSystem {
    constructor(emissionPoint) {
        this.emissionPoint = emissionPoint;
        this.particles = [];
        this.particleCount = 1000;
        this.particleGeometry = new THREE.BufferGeometry();
        this.positions = new Float32Array(this.particleCount * 3);
        
        // Create particle material
        this.particleMaterial = new THREE.PointsMaterial({
            color: 0x888888,
            size: 0.2,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        // Initialize particles
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                position: new THREE.Vector3(
                    this.emissionPoint.x + (Math.random() - 0.5) * 2,
                    this.emissionPoint.y,
                    this.emissionPoint.z + (Math.random() - 0.5) * 2
                ),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.2,
                    Math.random() * 0.5 + 0.5, // Upward velocity
                    (Math.random() - 0.5) * 0.2
                ),
                life: Math.random() * 2
            });
            
            // Set initial positions
            this.positions[i * 3] = this.particles[i].position.x;
            this.positions[i * 3 + 1] = this.particles[i].position.y;
            this.positions[i * 3 + 2] = this.particles[i].position.z;
        }

        this.particleGeometry.setAttribute('position', 
            new THREE.BufferAttribute(this.positions, 3)
        );

        // Create the particle system
        this.particleSystem = new THREE.Points(
            this.particleGeometry,
            this.particleMaterial
        );

        // Add to scene
        if (window.scene) {
            window.scene.add(this.particleSystem);
        }
    }

    update() {
        for (let i = 0; i < this.particleCount; i++) {
            const particle = this.particles[i];
            
            // Update position based on velocity
            particle.position.add(particle.velocity);
            
            // Add some random movement
            particle.position.x += (Math.random() - 0.5) * 0.1;
            particle.position.z += (Math.random() - 0.5) * 0.1;
            
            // Decrease life
            particle.life -= 0.016; 
            
            // Reset particle if it's dead or too high
            if (particle.life <= 0 || particle.position.y > this.emissionPoint.y + 20) {
                particle.position.set(
                    this.emissionPoint.x + (Math.random() - 0.5) * 2,
                    this.emissionPoint.y,
                    this.emissionPoint.z + (Math.random() - 0.5) * 2
                );
                particle.velocity.set(
                    (Math.random() - 0.5) * 0.2,
                    Math.random() * 0.5 + 0.5,
                    (Math.random() - 0.5) * 0.2
                );
                particle.life = Math.random() * 2;
            }
            
            // Update the position in the buffer
            this.positions[i * 3] = particle.position.x;
            this.positions[i * 3 + 1] = particle.position.y;
            this.positions[i * 3 + 2] = particle.position.z;
        }
        
        // Update the geometry
        this.particleGeometry.attributes.position.needsUpdate = true;
    }
}