import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import { ThreeBodyScene } from './scenes/ThreeBodyScene.js';
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
        this.threeBodyScene = null;
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
        this.setupThreeBodyScene();
        this.setupGUI();
        this.setupStats();
        this.setupEventListeners();
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        // ThreeBodyScene 会设置渐变背景
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
        this.renderer.shadowMap.enabled = false;
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

    setupThreeBodyScene() {
        this.threeBodyScene = new ThreeBodyScene(this.scene, this.camera, this.renderer);
        // ThreeBodyScene 内部管理所有光照，无需额外添加
    }

    setupGUI() {
        this.gui = createGUI(this.threeBodyScene);
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
                    this.threeBodyScene.regenerate();
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

        // Update three body scene
        if (this.threeBodyScene) {
            this.threeBodyScene.update(delta, elapsed);
        }

        // Update stats
        this.updateStats();

        // Render - 使用 Bloom composer 或直接渲染
        if (this.threeBodyScene && this.threeBodyScene.composer) {
            this.threeBodyScene.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
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
        // 同步更新 Bloom composer 尺寸
        if (this.threeBodyScene && this.threeBodyScene.composer) {
            this.threeBodyScene.composer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    exportScreenshot() {
        const link = document.createElement('a');
        link.download = `generative-art-${Date.now()}.png`;
        link.href = this.renderer.domElement.toDataURL('image/png');
        link.click();
    }

    toggleAnimation() {
        if (this.threeBodyScene) {
            this.threeBodyScene.toggleAnimation();
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