import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import { GridScene } from './scenes/GridScene.js';
import { createGUI } from './utils/gui.js';
import { createStats } from './utils/stats.js';

// Main application class
class GenerativeArtApp {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.gridScene = null;
        this.stats = null;
        this.clock = new THREE.Clock();
        this.frameCount = 0;
        this.lastTime = performance.now();
        
        this.init();
    }

    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupControls();
        this.setupGridScene();
        this.setupGUI();
        this.setupStats();
        this.setupEventListeners();
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
        this.scene.fog = new THREE.Fog(0x0a0a0a, 10, 50);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(15, 10, 15);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: false,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.container.appendChild(this.renderer.domElement);
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 50;
        this.controls.maxPolarAngle = Math.PI * 0.45;
        this.controls.minPolarAngle = Math.PI * 0.1;
        this.controls.target.set(0, 0, 0);
    }

    setupGridScene() {
        this.gridScene = new GridScene(this.scene, this.camera, this.renderer);
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);

        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        this.scene.add(directionalLight);

        // Add point lights for artistic effect
        const pointLight1 = new THREE.PointLight(0x667eea, 2, 30);
        pointLight1.position.set(-10, 5, -10);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x764ba2, 2, 30);
        pointLight2.position.set(10, 5, 10);
        this.scene.add(pointLight2);
    }

    setupGUI() {
        this.gui = createGUI(this.gridScene);
    }

    setupStats() {
        this.stats = createStats();
        document.getElementById('ui-overlay').appendChild(this.stats.dom);
    }

    setupEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // Keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'r':
                case 'R':
                    this.gridScene.regenerate();
                    break;
                case 's':
                case 'S':
                    this.exportScreenshot();
                    break;
                case ' ':
                    e.preventDefault();
                    this.toggleAnimation();
                    break;
            }
        });

        // Mouse interaction for hover effects
        this.setupMouseInteraction();
    }

    setupMouseInteraction() {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        this.renderer.domElement.addEventListener('mousemove', (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObjects(this.scene.children, true);

            // Reset all materials
            this.scene.traverse((obj) => {
                if (obj.isMesh && obj.material.emissive) {
                    obj.material.emissive.setHex(0x000000);
                }
            });

            // Highlight intersected objects
            if (intersects.length > 0) {
                const obj = intersects[0].object;
                if (obj.isMesh && obj.material.emissive) {
                    obj.material.emissive.setHex(0x222222);
                }
            }
        });
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        const delta = this.clock.getDelta();
        const elapsed = this.clock.getElapsedTime();

        // Update controls
        this.controls.update();

        // Update grid scene
        if (this.gridScene) {
            this.gridScene.update(delta, elapsed);
        }

        // Update stats
        this.updateStats();

        // Render
        this.renderer.render(this.scene, this.camera);
    }

    updateStats() {
        this.frameCount++;
        const currentTime = performance.now();
        
        if (currentTime >= this.lastTime + 1000) {
            const fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            document.getElementById('fps').textContent = fps;
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    exportScreenshot() {
        const link = document.createElement('a');
        link.download = `generative-art-${Date.now()}.png`;
        link.href = this.renderer.domElement.toDataURL('image/png');
        link.click();
    }

    toggleAnimation() {
        if (this.gridScene) {
            this.gridScene.toggleAnimation();
        }
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Add loading overlay
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.innerHTML = '<div class="loading-text">Loading Generative Art...</div>';
    document.body.appendChild(loading);

    // Wait a bit for smooth transition
    setTimeout(() => {
        new GenerativeArtApp();
        setTimeout(() => {
            loading.classList.add('hidden');
            setTimeout(() => loading.remove(), 500);
        }, 500);
    }, 300);
});