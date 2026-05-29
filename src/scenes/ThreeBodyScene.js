import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export class ThreeBodyScene {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;

        // 物理参数（保持不变）
        this.params = {
            G: 0.5,
            mass1: 20,
            mass2: 10,
            mass3: 5,
            trailLength: 300,
            speed: 1.0,
            showTrails: true,
            showGrid: true,
            animate: true,
        };

        this.bodies = [];
        this.trails = [];
        this.velocities = [];
        this.masses = [];
        this.time = 0;

        // 高级色彩方案：金色 + 青色 + 品红
        this.colorHexes = [0xFFD700, 0x00E5FF, 0xFF00FF];
        this.colorObjects = [
            new THREE.Color(0xFFD700),
            new THREE.Color(0x00E5FF),
            new THREE.Color(0xFF00FF),
        ];

        // 新增视觉元素
        this.nebulaSprites = [];
        this.shootingStars = [];
        this.composer = null;
        this.bloomPass = null;
        this.starShaderMaterial = null;
        this.backgroundTexture = null;
        this.nebulaTexture = null;

        this.init();
    }

    init() {
        this.setupBackground();
        this.setupBodies();
        this.setupLights();
        this.setupStarfield();
        this.setupShootingStars();
        this.setupBloom();
        if (this.params.showGrid) {
            this.setupGrid();
        }
    }

    // ===== 背景：深色渐变（低饱和度，保护眼睛）=====
    setupBackground() {
        // 创建渐变纹理 - 深灰色到近黑色，减少蓝色
        const canvas = document.createElement('canvas');
        canvas.width = 2;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, '#0d0d0d');     // 深灰顶部
        gradient.addColorStop(0.25, '#0a0a0a');   // 稍浅灰
        gradient.addColorStop(0.5, '#070707');    // 深灰中部
        gradient.addColorStop(0.75, '#040404');   // 极深灰
        gradient.addColorStop(1, '#000000');      // 纯黑底部
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 2, 512);

        this.backgroundTexture = new THREE.CanvasTexture(canvas);
        this.scene.background = this.backgroundTexture;

        // 星云效果 - 减少蓝色，使用更暗的色调
        this.setupNebula();
    }

    setupNebula() {
        // 创建柔和星云纹理
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // 多层径向渐变模拟星云 - 降低饱和度，减少蓝色
        const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        gradient.addColorStop(0, 'rgba(100, 90, 110, 0.25)');
        gradient.addColorStop(0.3, 'rgba(60, 55, 65, 0.12)');
        gradient.addColorStop(0.6, 'rgba(35, 32, 38, 0.05)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);

        this.nebulaTexture = new THREE.CanvasTexture(canvas);

        // 星云颜色方案 - 降低饱和度，减少蓝色
        const nebulaColors = [
            new THREE.Color(0x201020),   // 暗紫灰
            new THREE.Color(0x151515),   // 近黑
            new THREE.Color(0x201515),   // 暗红灰
            new THREE.Color(0x151820),   // 暗蓝灰
            new THREE.Color(0x181818),   // 深灰
        ];

        // 创建多个星云精灵
        for (let i = 0; i < 12; i++) {
            const spriteMaterial = new THREE.SpriteMaterial({
                map: this.nebulaTexture,
                color: nebulaColors[i % nebulaColors.length],
                transparent: true,
                opacity: 0.08 + Math.random() * 0.06,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
            });

            const sprite = new THREE.Sprite(spriteMaterial);
            const scale = 40 + Math.random() * 30;
            sprite.scale.set(scale, scale, 1);
            sprite.position.set(
                (Math.random() - 0.5) * 160,
                (Math.random() - 0.5) * 80,
                (Math.random() - 0.5) * 160
            );
            this.scene.add(sprite);
            this.nebulaSprites.push(sprite);
        }
    }

    // ===== 天体：高级金属质感 + 发光 =====
    setupBodies() {
        const initialPositions = [
            new THREE.Vector3(-5, 0, 0),
            new THREE.Vector3(5, 0, 0),
            new THREE.Vector3(0, 8, 0),
        ];

        const initialVelocities = [
            new THREE.Vector3(0, 0.3, 0.1),
            new THREE.Vector3(0, -0.3, -0.1),
            new THREE.Vector3(0.4, 0, 0),
        ];

        const masses = [this.params.mass1, this.params.mass2, this.params.mass3];
        const baseRadius = 0.5;
        const radii = masses.map(mass => baseRadius * Math.pow(mass / 10, 1/3));

        for (let i = 0; i < 3; i++) {
            const bodyGroup = new THREE.Group();
            bodyGroup.position.copy(initialPositions[i]);
            this.scene.add(bodyGroup);

            // 天体本体 - 高级金属质感材质
            const geometry = new THREE.SphereGeometry(radii[i], 64, 64);
            const material = new THREE.MeshPhysicalMaterial({
                color: this.colorHexes[i],
                emissive: this.colorHexes[i],
                emissiveIntensity: 1.2,
                metalness: 0.95,
                roughness: 0.05,
                clearcoat: 1.0,
                clearcoatRoughness: 0.05,
                envMapIntensity: 1.5,
                iridescence: 0.3,
                iridescenceIOR: 1.5,
            });
            const mesh = new THREE.Mesh(geometry, material);
            bodyGroup.add(mesh);

            // 内部发光层
            const innerGlowGeometry = new THREE.SphereGeometry(radii[i] * 1.4, 32, 32);
            const innerGlowMaterial = new THREE.MeshBasicMaterial({
                color: this.colorHexes[i],
                transparent: true,
                opacity: 0.35,
                side: THREE.BackSide,
                blending: THREE.AdditiveBlending,
            });
            const innerGlow = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial);
            bodyGroup.add(innerGlow);

            // 外部光晕层 1
            const outerGlowGeometry1 = new THREE.SphereGeometry(radii[i] * 2.2, 32, 32);
            const outerGlowMaterial1 = new THREE.MeshBasicMaterial({
                color: this.colorHexes[i],
                transparent: true,
                opacity: 0.18,
                side: THREE.BackSide,
                blending: THREE.AdditiveBlending,
            });
            const outerGlow1 = new THREE.Mesh(outerGlowGeometry1, outerGlowMaterial1);
            bodyGroup.add(outerGlow1);

            // 外部光晕层 2
            const outerGlowGeometry2 = new THREE.SphereGeometry(radii[i] * 4.0, 32, 32);
            const outerGlowMaterial2 = new THREE.MeshBasicMaterial({
                color: this.colorHexes[i],
                transparent: true,
                opacity: 0.06,
                side: THREE.BackSide,
                blending: THREE.AdditiveBlending,
            });
            const outerGlow2 = new THREE.Mesh(outerGlowGeometry2, outerGlowMaterial2);
            bodyGroup.add(outerGlow2);

            // 粒子效果 - 围绕天体的能量粒子
            const particleCount = 200;
            const particleGeometry = new THREE.BufferGeometry();
            const particlePositions = new Float32Array(particleCount * 3);
            const particleSizes = new Float32Array(particleCount);

            for (let j = 0; j < particleCount; j++) {
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI;
                const r = radii[i] * (2 + Math.random() * 3);
                particlePositions[j * 3] = r * Math.sin(phi) * Math.cos(theta);
                particlePositions[j * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
                particlePositions[j * 3 + 2] = r * Math.cos(phi);
                particleSizes[j] = Math.random() * 0.1 + 0.02;
            }

            particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
            particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

            const particleMaterial = new THREE.PointsMaterial({
                color: this.colorHexes[i],
                size: 0.12,
                transparent: true,
                opacity: 0.7,
                blending: THREE.AdditiveBlending,
                sizeAttenuation: true,
                depthWrite: false,
            });

            const particles = new THREE.Points(particleGeometry, particleMaterial);
            bodyGroup.add(particles);

            this.bodies.push(bodyGroup);
            this.velocities.push(initialVelocities[i].clone());
            this.masses.push(masses[i]);

            // 轨迹 - 带渐变和发光效果
            const trailGeometry = new THREE.BufferGeometry();
            const trailPositions = new Float32Array(this.params.trailLength * 3);
            const trailColors = new Float32Array(this.params.trailLength * 3);
            trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
            trailGeometry.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));

            const trailMaterial = new THREE.LineBasicMaterial({
                vertexColors: true,
                transparent: true,
                opacity: 0.9,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
            });

            const trail = new THREE.Line(trailGeometry, trailMaterial);
            trail.frustumCulled = false;
            this.scene.add(trail);
            this.trails.push({
                line: trail,
                positions: [],
                geometry: trailGeometry,
            });
        }
    }

    // ===== 光照：全局光照 + 天体互影响 =====
    setupLights() {
        // 半球光 - 模拟全局光照（天空色 + 地面色）
        const hemisphereLight = new THREE.HemisphereLight(
            0x1a0a30,   // 天空色：深紫蓝
            0x050510,   // 地面色：极深蓝
            0.4
        );
        this.scene.add(hemisphereLight);
        this.hemisphereLight = hemisphereLight;

        // 每个天体的点光源 - 天体之间互相照亮
        const lightColors = [0xFFD700, 0x00E5FF, 0xFF00FF];
        const lightIntensities = [5, 3, 2]; // 按质量比例

        for (let i = 0; i < 3; i++) {
            const light = new THREE.PointLight(lightColors[i], lightIntensities[i], 40);
            light.position.copy(this.bodies[i].position);
            this.scene.add(light);
            this.bodies[i].userData.light = light;
        }
    }

    // ===== 星空：闪烁效果 =====
    setupStarfield() {
        const starCount = 4000;
        const starGeometry = new THREE.BufferGeometry();
        const starPositions = new Float32Array(starCount * 3);
        const starPhases = new Float32Array(starCount);
        const starBaseSizes = new Float32Array(starCount);

        for (let i = 0; i < starCount; i++) {
            // 在球面上均匀分布
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 80 + Math.random() * 40;

            starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            starPositions[i * 3 + 2] = r * Math.cos(phi);

            starPhases[i] = Math.random(); // 每颗星独立的闪烁相位
            starBaseSizes[i] = 1.0 + Math.random() * 3.0;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        starGeometry.setAttribute('phase', new THREE.BufferAttribute(starPhases, 1));
        starGeometry.setAttribute('baseSize', new THREE.BufferAttribute(starBaseSizes, 1));

        // 自定义闪烁着色器
        this.starShaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
            },
            vertexShader: `
                attribute float phase;
                attribute float baseSize;
                uniform float time;
                varying float vAlpha;

                void main() {
                    // 每颗星独立闪烁，频率和幅度略有不同
                    float freq = 1.0 + phase * 2.0;
                    vAlpha = 0.5 + 0.5 * sin(time * freq + phase * 6.2831);
                    // 让部分星更亮（模拟不同亮度等级）
                    vAlpha = 0.3 + 0.7 * vAlpha;

                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = baseSize * (200.0 / -mvPosition.z) * (0.6 + 0.4 * vAlpha);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying float vAlpha;

                void main() {
                    float dist = length(gl_PointCoord - vec2(0.5));
                    if (dist > 0.5) discard;
                    // 柔和的圆形星点，中心亮边缘暗
                    float brightness = smoothstep(0.5, 0.0, dist);
                    float alpha = brightness * vAlpha;
                    // 微微偏暖白色
                    vec3 starColor = vec3(1.0, 0.95, 0.85);
                    gl_FragColor = vec4(starColor * alpha, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        const starField = new THREE.Points(starGeometry, this.starShaderMaterial);
        this.scene.add(starField);
        this.starField = starField;
    }

    // ===== 流星系统 =====
    setupShootingStars() {
        this.shootingStars = [];
        const poolSize = 5;

        for (let i = 0; i < poolSize; i++) {
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(6 * 3); // 6个点组成流星尾迹
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

            const material = new THREE.LineBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
            });

            const line = new THREE.Line(geometry, material);
            line.frustumCulled = false;
            this.scene.add(line);

            this.shootingStars.push({
                line,
                geometry,
                material,
                active: false,
                startTime: 0,
                duration: 0.4 + Math.random() * 0.4,
                startPos: new THREE.Vector3(),
                direction: new THREE.Vector3(),
                speed: 60 + Math.random() * 40,
            });
        }

        this.nextShootingStarTime = 3 + Math.random() * 5;
    }

    activateShootingStar(star, elapsed) {
        // 在球面边缘随机位置生成
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 70 + Math.random() * 20;

        star.startPos.set(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi)
        );

        // 随机方向（大致朝向中心区域）
        star.direction.set(
            -star.startPos.x + (Math.random() - 0.5) * 20,
            -star.startPos.y + (Math.random() - 0.5) * 20,
            -star.startPos.z + (Math.random() - 0.5) * 20
        ).normalize();

        star.active = true;
        star.startTime = elapsed;
        star.duration = 0.3 + Math.random() * 0.5;
        star.speed = 50 + Math.random() * 50;
    }

    updateShootingStars(delta, elapsed) {
        // 检查是否应该生成新流星
        if (elapsed > this.nextShootingStarTime) {
            const inactive = this.shootingStars.find(s => !s.active);
            if (inactive) {
                this.activateShootingStar(inactive, elapsed);
            }
            this.nextShootingStarTime = elapsed + 3 + Math.random() * 8;
        }

        // 更新活跃的流星
        for (const star of this.shootingStars) {
            if (!star.active) continue;

            const progress = (elapsed - star.startTime) / star.duration;
            if (progress > 1) {
                star.active = false;
                star.material.opacity = 0;
                continue;
            }

            const currentPos = star.startPos.clone().add(
                star.direction.clone().multiplyScalar(star.speed * (elapsed - star.startTime))
            );

            const positions = star.geometry.attributes.position.array;
            const trailLen = star.speed * star.duration * 0.15;

            // 流星头部
            positions[0] = currentPos.x;
            positions[1] = currentPos.y;
            positions[2] = currentPos.z;

            // 尾迹中间点
            const midPos = currentPos.clone().sub(
                star.direction.clone().multiplyScalar(trailLen * 0.5)
            );
            positions[3] = midPos.x;
            positions[4] = midPos.y;
            positions[5] = midPos.z;

            // 尾迹末端
            const tailPos = currentPos.clone().sub(
                star.direction.clone().multiplyScalar(trailLen)
            );
            positions[6] = tailPos.x;
            positions[7] = tailPos.y;
            positions[8] = tailPos.z;

            // 更长的淡出尾迹
            const farTailPos = currentPos.clone().sub(
                star.direction.clone().multiplyScalar(trailLen * 2)
            );
            positions[9] = farTailPos.x;
            positions[10] = farTailPos.y;
            positions[11] = farTailPos.z;

            // 更远的淡出
            const veryFarTailPos = currentPos.clone().sub(
                star.direction.clone().multiplyScalar(trailLen * 3)
            );
            positions[12] = veryFarTailPos.x;
            positions[13] = veryFarTailPos.y;
            positions[14] = veryFarTailPos.z;

            // 最远淡出
            const extremeTailPos = currentPos.clone().sub(
                star.direction.clone().multiplyScalar(trailLen * 4)
            );
            positions[15] = extremeTailPos.x;
            positions[16] = extremeTailPos.y;
            positions[17] = extremeTailPos.z;

            star.geometry.attributes.position.needsUpdate = true;

            // 快速淡出
            star.material.opacity = Math.max(0, 1 - progress * progress);
        }
    }

    // ===== Bloom 后期处理 =====
    setupBloom() {
        this.composer = new EffectComposer(this.renderer);

        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.2,   // strength - 中等强度
            0.3,   // radius - 中等扩散
            0.35   // threshold - 低阈值让发光体明显bloom
        );
        this.composer.addPass(this.bloomPass);

        // OutputPass 处理色调映射和色彩空间转换
        const outputPass = new OutputPass();
        this.composer.addPass(outputPass);
    }

    // ===== 网格 =====
    setupGrid() {
        const gridHelper = new THREE.GridHelper(50, 50, 0x1a1a3a, 0x0d0d1a);
        gridHelper.position.y = -10;
        gridHelper.material.transparent = true;
        gridHelper.material.opacity = 0.3;
        this.scene.add(gridHelper);
        this.gridHelper = gridHelper;
    }

    // ===== 物理计算（保持不变） =====
    calculateGravity(pos1, pos2, mass) {
        const direction = new THREE.Vector3().subVectors(pos2, pos1);
        const distance = direction.length();
        if (distance < 0.1) return new THREE.Vector3(0, 0, 0);

        const forceMagnitude = (this.params.G * mass) / (distance * distance);
        return direction.normalize().multiplyScalar(forceMagnitude);
    }

    // ===== 更新循环 =====
    update(delta, elapsed) {
        if (!this.params.animate) return;

        const dt = delta * this.params.speed;
        const G = this.params.G;

        // 计算每个天体受到的引力（逻辑不变）
        const forces = [];
        for (let i = 0; i < 3; i++) {
            forces.push(new THREE.Vector3(0, 0, 0));
        }

        for (let i = 0; i < 3; i++) {
            for (let j = i + 1; j < 3; j++) {
                const direction = new THREE.Vector3().subVectors(
                    this.bodies[j].position,
                    this.bodies[i].position
                );
                const distance = Math.max(direction.length(), 0.5);
                const forceMagnitude = (G * this.masses[i] * this.masses[j]) / (distance * distance);
                const force = direction.normalize().multiplyScalar(forceMagnitude);

                forces[i].add(force);
                forces[j].sub(force);
            }
        }

        // 更新速度和位置（逻辑不变）
        for (let i = 0; i < 3; i++) {
            const acceleration = forces[i].clone().divideScalar(this.masses[i]);
            this.velocities[i].add(acceleration.multiplyScalar(dt));

            const newPosition = this.bodies[i].position.clone().add(
                this.velocities[i].clone().multiplyScalar(dt)
            );
            this.bodies[i].position.copy(newPosition);

            // 更新光源位置
            if (this.bodies[i].userData.light) {
                this.bodies[i].userData.light.position.copy(newPosition);
            }

            // 旋转粒子效果
            const particles = this.bodies[i].children.find(child => child instanceof THREE.Points);
            if (particles) {
                particles.rotation.y += delta * 0.2;
                particles.rotation.x += delta * 0.1;
            }

            // 光晕脉动效果
            const outerGlow1 = this.bodies[i].children[2];
            const outerGlow2 = this.bodies[i].children[3];
            if (outerGlow1 && outerGlow1.material) {
                outerGlow1.material.opacity = 0.18 + 0.04 * Math.sin(elapsed * 2 + i * 2);
            }
            if (outerGlow2 && outerGlow2.material) {
                outerGlow2.material.opacity = 0.06 + 0.02 * Math.sin(elapsed * 1.5 + i * 3);
            }
        }

        // 更新轨迹（带渐变）
        if (this.params.showTrails) {
            this.updateTrails();
        }

        // 更新星空闪烁
        if (this.starShaderMaterial) {
            this.starShaderMaterial.uniforms.time.value = elapsed;
        }

        // 缓慢旋转星空
        if (this.starField) {
            this.starField.rotation.y += delta * 0.003;
        }

        // 更新流星
        this.updateShootingStars(delta, elapsed);

        // 星云微动
        for (let i = 0; i < this.nebulaSprites.length; i++) {
            const sprite = this.nebulaSprites[i];
            sprite.material.opacity = 0.08 + 0.02 * Math.sin(elapsed * 0.3 + i * 1.5);
            sprite.position.x += Math.sin(elapsed * 0.1 + i) * 0.01;
        }

        this.time += dt;
    }

    // ===== 轨迹更新（带渐变发光） =====
    updateTrails() {
        for (let i = 0; i < 3; i++) {
            const trail = this.trails[i];
            const positions = trail.positions;

            positions.push(this.bodies[i].position.clone());

            if (positions.length > this.params.trailLength) {
                positions.shift();
            }

            const positionsArray = trail.geometry.attributes.position.array;
            const colorsArray = trail.geometry.attributes.color.array;
            const colorObj = this.colorObjects[i];

            for (let j = 0; j < positions.length; j++) {
                positionsArray[j * 3] = positions[j].x;
                positionsArray[j * 3 + 1] = positions[j].y;
                positionsArray[j * 3 + 2] = positions[j].z;

                // 渐变效果：头部明亮，尾部暗淡
                const t = j / positions.length;
                const fade = Math.pow(t, 1.5); // 非线性渐变
                colorsArray[j * 3] = colorObj.r * fade;
                colorsArray[j * 3 + 1] = colorObj.g * fade;
                colorsArray[j * 3 + 2] = colorObj.b * fade;
            }

            // 填充剩余位置
            for (let j = positions.length; j < this.params.trailLength; j++) {
                positionsArray[j * 3] = positions[positions.length - 1].x;
                positionsArray[j * 3 + 1] = positions[positions.length - 1].y;
                positionsArray[j * 3 + 2] = positions[positions.length - 1].z;
                colorsArray[j * 3] = 0;
                colorsArray[j * 3 + 1] = 0;
                colorsArray[j * 3 + 2] = 0;
            }

            trail.geometry.attributes.position.needsUpdate = true;
            trail.geometry.attributes.color.needsUpdate = true;
            trail.geometry.setDrawRange(0, positions.length);
        }
    }

    // ===== 重置（保持不变） =====
    regenerate() {
        const initialPositions = [
            new THREE.Vector3(-5, 0, 0),
            new THREE.Vector3(5, 0, 0),
            new THREE.Vector3(0, 8, 0),
        ];

        const initialVelocities = [
            new THREE.Vector3(0, 0.3, 0.1),
            new THREE.Vector3(0, -0.3, -0.1),
            new THREE.Vector3(0.4, 0, 0),
        ];

        for (let i = 0; i < 3; i++) {
            this.bodies[i].position.copy(initialPositions[i]);
            this.velocities[i] = initialVelocities[i].clone();
            this.trails[i].positions = [];
        }
    }

    toggleAnimation() {
        this.params.animate = !this.params.animate;
    }

    updateParams(newParams) {
        const oldMasses = [...this.masses];
        Object.assign(this.params, newParams);

        if (newParams.mass1 !== undefined) {
            this.masses[0] = newParams.mass1;
        }
        if (newParams.mass2 !== undefined) {
            this.masses[1] = newParams.mass2;
        }
        if (newParams.mass3 !== undefined) {
            this.masses[2] = newParams.mass3;
        }

        for (let i = 0; i < 3; i++) {
            if (this.masses[i] !== oldMasses[i]) {
                this.updateBodySize(i);
            }
        }
    }

    updateBodySize(index) {
        const baseRadius = 0.5;
        const newRadius = baseRadius * Math.pow(this.masses[index] / 10, 1/3);

        const bodyGroup = this.bodies[index];
        if (!bodyGroup) return;

        // 更新天体本体
        const mesh = bodyGroup.children[0];
        if (mesh && mesh.geometry) {
            mesh.geometry.dispose();
            mesh.geometry = new THREE.SphereGeometry(newRadius, 64, 64);
        }

        // 更新内部发光层
        const innerGlow = bodyGroup.children[1];
        if (innerGlow && innerGlow.geometry) {
            innerGlow.geometry.dispose();
            innerGlow.geometry = new THREE.SphereGeometry(newRadius * 1.4, 32, 32);
        }

        // 更新外部光晕层 1
        const outerGlow1 = bodyGroup.children[2];
        if (outerGlow1 && outerGlow1.geometry) {
            outerGlow1.geometry.dispose();
            outerGlow1.geometry = new THREE.SphereGeometry(newRadius * 2.2, 32, 32);
        }

        // 更新外部光晕层 2
        const outerGlow2 = bodyGroup.children[3];
        if (outerGlow2 && outerGlow2.geometry) {
            outerGlow2.geometry.dispose();
            outerGlow2.geometry = new THREE.SphereGeometry(newRadius * 4.0, 32, 32);
        }
    }

    // ===== 资源清理 =====
    dispose() {
        for (let i = 0; i < 3; i++) {
            this.scene.remove(this.bodies[i]);
            this.bodies[i].children.forEach(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });

            this.scene.remove(this.trails[i].line);
            this.trails[i].geometry.dispose();
            this.trails[i].line.material.dispose();

            if (this.bodies[i].userData.light) {
                this.scene.remove(this.bodies[i].userData.light);
            }
        }

        if (this.gridHelper) {
            this.scene.remove(this.gridHelper);
        }

        if (this.starField) {
            this.scene.remove(this.starField);
            if (this.starShaderMaterial) this.starShaderMaterial.dispose();
        }

        // 清理星云
        for (const sprite of this.nebulaSprites) {
            this.scene.remove(sprite);
            sprite.material.dispose();
        }
        if (this.nebulaTexture) this.nebulaTexture.dispose();
        if (this.backgroundTexture) this.backgroundTexture.dispose();

        // 清理流星
        for (const star of this.shootingStars) {
            this.scene.remove(star.line);
            star.geometry.dispose();
            star.material.dispose();
        }

        // 清理光照
        if (this.hemisphereLight) {
            this.scene.remove(this.hemisphereLight);
        }

        // 清理 Bloom
        if (this.composer) {
            this.composer.dispose();
        }
    }
}