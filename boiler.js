import * as THREE from 'three';

export function createChimney() {
    const group = new THREE.Group();
    
    // Base cylinder (main chimney body)
    const bodyGeometry = new THREE.CylinderGeometry(
        2,      // top radius
        3.5,    // bottom radius (slightly wider for stability)
        20,     // height
        32,     // radial segments (more segments = smoother circle)
        1,      // height segments
        true    // open ended cylinder (important for seeing inside)
    );
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xB5C0C9,
        roughness: 0.9,
        metalness: 0.3,
        side: THREE.DoubleSide
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    
    // Top rim
    const rimGeometry = new THREE.TorusGeometry(
        2.2, // radius
        0.3, // thickness
        16, // tubular segments
        32 // radial segments
    );
    const rimMaterial = new THREE.MeshStandardMaterial({
        color: 0xB5C0C9,
        roughness: 0.6,
        metalness: 0.3,
    });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    
    rim.position.y = 10;  // Place at top of chimney
    rim.rotation.x = Math.PI / 2;  // Rotate to be horizontal

    // Inside cylinder
    const interiorGeometry = new THREE.CylinderGeometry(
        1.9,    // top radius (slightly smaller than body)
        2.4,    // bottom radius
        20,     // height
        32,     // segments
        1,      // height segments
        true    // open ended
    );
    const interiorMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,     // Black
        roughness: 0.9,      // Very rough
        metalness: 0.1,      // Low metalness for dark appearance
        side: THREE.BackSide // Only render inside
    });
    const interior = new THREE.Mesh(interiorGeometry, interiorMaterial);
    
    // Add everything to the group
    group.add(body);
    group.add(rim);
    group.add(interior);
    
    return group;
}