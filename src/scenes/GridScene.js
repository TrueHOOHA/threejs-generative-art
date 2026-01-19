import * as THREE from 'three';
import gsap from 'gsap';
import { generateColor, generateHSLColor } from '../utils/colors.js';

export class GridScene {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        
        // Grid parameters
        this.params = {
            columns: 12,
            rows: 12,
            spacing: 1.5,
            height: 0.5,
            width: 0.8,
            depth: 0.8,
            rotationSpeed: 0.5,
            animationSpeed: 1.0,
            colorPalette: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'],
            useInstancing: true,
            showWireframe: false,
            animate: true,
            noiseScale: 0.1,
            waveAmplitude: 2.0,
        };

        this.mesh = null;
        this.instancedMesh = null;
        this.time = 0;
        this.animationFrame = null;
        
        this.init();
    }

    init() {
        this.generateGrid();
    }

    generateGrid() {
        // Clean up existing mesh
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            this.mesh = null;
        }
        if (this.instancedMesh) {
            this.scene.remove(this.instancedMesh);
            this.instancedMesh.geometry.dispose();
            this.instancedMesh.material.dispose();
            this.instancedMesh = null;
        }

        const { columns, rows, spacing, width, depth, height, useInstancing } = this.params;

        if (useInstancing) {
            this.generateInstancedGrid(columns, rows, spacing, width, depth, height);
        } else {
            this.generateIndividualGrid(columns, rows, spacing, width, depth, height);
        }
    }

    generateInstancedGrid(columns, rows, spacing, width, depth, height) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.3,
            roughness: 0.4,
            emissive: 0x000000,
            emissiveIntensity: 0.2,
            wireframe: this.params.showWireframe,
        });

        const instanceCount = columns * rows;
        this.instancedMesh = new THREE.InstancedMesh(geometry, material, instanceCount);
        
        const matrix = new THREE.Matrix4();
        const color = new THREE.Color();
        const position = new THREE.Vector3();
        const rotation = new THREE.Euler();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3(1, 1, 1);

        let index = 0;
        const offsetX = (columns - 1) * spacing / 2;
        const offsetZ = (rows - 1) * spacing / 2;

        for (let i = 0; i < columns; i++) {
            for (let j = 0; j < rows; j++) {
                const x = (i * spacing) - offsetX;
                const z = (j * spacing) - offsetZ;
                
                position.set(x, 0, z);
                rotation.set(0, 0, 0);
                quaternion.setFromEuler(rotation);
                
                matrix.compose(position, quaternion, scale);
                this.instancedMesh.setMatrixAt(index, matrix);

                // Set color based on position
                const colorIndex = (i + j) % this.params.colorPalette.length;
                color.set(this.params.colorPalette[colorIndex]);
                this.instancedMesh.setColorAt(index, color);

                index++;
            }
        }

        this.instancedMesh.instanceMatrix.needsUpdate = true;
        if (this.instancedMesh.instanceColor) {
            this.instancedMesh.instanceColor.needsUpdate = true;
        }

        this.scene.add(this.instancedMesh);
    }

    generateIndividualGrid(columns, rows, spacing, width, depth, height) {
        const group = new THREE.Group();
        const offsetX = (columns - 1) * spacing / 2;
        const offsetZ = (rows - 1) * spacing / 2;

        for (let i = 0; i < columns; i++) {
            for (let j = 0; j < rows; j++) {
                const geometry = new THREE.BoxGeometry(width, height, depth);
                const colorIndex = (i + j) % this.params.colorPalette.length;
                const color = new THREE.Color(this.params.colorPalette[colorIndex]);
                
                const material = new THREE.MeshStandardMaterial({
                    color: color,
                    metalness: 0.3,
                    roughness: 0.4,
                    emissive: 0x000000,
                    emissiveIntensity: 0.2,
                    wireframe: this.params.showWireframe,
                });

                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(
                    (i * spacing) - offsetX,
                    0,
                    (j * spacing) - offsetZ
                );
                mesh.userData = { gridX: i, gridY: j, baseY: 0 };
                group.add(mesh);
            }
        }

        this.mesh = group;
        this.scene.add(group);
    }

    update(delta, elapsed) {
        this.time = elapsed;

        if (!this.params.animate) return;

        const { noiseScale, waveAmplitude, rotationSpeed, animationSpeed } = this.params;
        const time = elapsed * animationSpeed;

        if (this.instancedMesh) {
            // Update instanced mesh with wave animation
            const matrix = new THREE.Matrix4();
            const position = new THREE.Vector3();
            const rotation = new THREE.Euler();
            const quaternion = new THREE.Quaternion();
            const scale = new THREE.Vector3(1, 1, 1);

            const offsetX = (this.params.columns - 1) * this.params.spacing / 2;
            const offsetZ = (this.params.rows - 1) * this.params.spacing / 2;

            let index = 0;
            for (let i = 0; i < this.params.columns; i++) {
                for (let j = 0; j < this.params.rows; j++) {
                    const x = (i * this.params.spacing) - offsetX;
                    const z = (j * this.params.spacing) - offsetZ;

                    // Create wave pattern using sine functions
                    const waveY = Math.sin(x * noiseScale + time) * 
                                 Math.cos(z * noiseScale + time * 0.7) * 
                                 waveAmplitude;
                    
                    const rotationAngle = Math.sin(time + i * 0.1) * rotationSpeed * 0.1;
                    
                    position.set(x, waveY, z);
                    rotation.set(rotationAngle, rotationAngle * 0.5, 0);
                    quaternion.setFromEuler(rotation);
                    
                    matrix.compose(position, quaternion, scale);
                    this.instancedMesh.setMatrixAt(index, matrix);
                    index++;
                }
            }
            this.instancedMesh.instanceMatrix.needsUpdate = true;
        }

        if (this.mesh) {
            // Update individual meshes
            this.mesh.children.forEach((child, index) => {
                const { gridX, gridY, baseY } = child.userData;
                
                const waveY = Math.sin(gridX * noiseScale + time) * 
                             Math.cos(gridY * noiseScale + time * 0.7) * 
                             waveAmplitude;
                
                child.position.y = baseY + waveY;
                child.rotation.y = Math.sin(time + gridX * 0.1) * rotationSpeed * 0.1;
                child.rotation.x = Math.cos(time + gridY * 0.1) * rotationSpeed * 0.05;
            });
        }
    }

    regenerate() {
        this.generateGrid();
    }

    toggleAnimation() {
        this.params.animate = !this.params.animate;
    }

    updateParams(newParams) {
        Object.assign(this.params, newParams);
        
        // Regenerate if structural parameters changed
        if (newParams.columns !== undefined || 
            newParams.rows !== undefined || 
            newParams.spacing !== undefined ||
            newParams.useInstancing !== undefined ||
            newParams.showWireframe !== undefined) {
            this.generateGrid();
        }

        // Update material properties
        if (this.mesh) {
            this.mesh.children.forEach(child => {
                if (child.material) {
                    child.material.wireframe = this.params.showWireframe;
                }
            });
        }
        if (this.instancedMesh) {
            this.instancedMesh.material.wireframe = this.params.showWireframe;
        }
    }

    dispose() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.traverse(obj => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) obj.material.dispose();
            });
        }
        if (this.instancedMesh) {
            this.scene.remove(this.instancedMesh);
            this.instancedMesh.geometry.dispose();
            this.instancedMesh.material.dispose();
        }
    }
}