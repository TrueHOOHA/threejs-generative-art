/**
 * Create GUI controls for the Three Body simulation
 * Uses dat.GUI for real-time parameter manipulation
 */

export function createGUI(threeBodyScene) {
    // Create GUI container
    const guiContainer = document.createElement('div');
    guiContainer.className = 'gui-container';
    document.getElementById('ui-overlay').appendChild(guiContainer);

    // Import dat.GUI (we'll use a CDN approach for simplicity)
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/build/dat.gui.min.js';
    script.onload = () => {
        initGUI(guiContainer, threeBodyScene);
    };
    document.head.appendChild(script);

    return { dom: guiContainer };
}

function initGUI(container, threeBodyScene) {
    const gui = new dat.GUI({ autoPlace: false, width: 300 });
    container.appendChild(gui.domElement);

    // 物理参数
    const physicsFolder = gui.addFolder('物理参数');
    physicsFolder.add(threeBodyScene.params, 'G', 0.1, 2.0, 0.1).name('引力常数 G').onChange(() => {
        threeBodyScene.updateParams({ G: threeBodyScene.params.G });
    });
    physicsFolder.add(threeBodyScene.params, 'mass1', 1, 50, 1).name('主星质量').onChange(() => {
        threeBodyScene.updateParams({ mass1: threeBodyScene.params.mass1 });
    });
    physicsFolder.add(threeBodyScene.params, 'mass2', 1, 50, 1).name('次星质量').onChange(() => {
        threeBodyScene.updateParams({ mass2: threeBodyScene.params.mass2 });
    });
    physicsFolder.add(threeBodyScene.params, 'mass3', 1, 50, 1).name('第三体质量').onChange(() => {
        threeBodyScene.updateParams({ mass3: threeBodyScene.params.mass3 });
    });
    physicsFolder.open();

    // 动画参数
    const animFolder = gui.addFolder('动画控制');
    animFolder.add(threeBodyScene.params, 'animate').name('启用动画').onChange(() => {
        threeBodyScene.toggleAnimation();
    });
    animFolder.add(threeBodyScene.params, 'speed', 0.1, 5.0, 0.1).name('模拟速度');
    animFolder.open();

    // 视觉参数
    const visualFolder = gui.addFolder('视觉效果');
    visualFolder.add(threeBodyScene.params, 'showTrails').name('显示轨迹').onChange(() => {
        threeBodyScene.updateParams({ showTrails: threeBodyScene.params.showTrails });
    });
    visualFolder.add(threeBodyScene.params, 'trailLength', 50, 500, 50).name('轨迹长度').onChange(() => {
        threeBodyScene.updateParams({ trailLength: threeBodyScene.params.trailLength });
    });
    visualFolder.add(threeBodyScene.params, 'showGrid').name('显示网格').onChange(() => {
        threeBodyScene.updateParams({ showGrid: threeBodyScene.params.showGrid });
    });
    visualFolder.open();

    // 操作
    const actionsFolder = gui.addFolder('操作');
    const actions = {
        '重置系统': () => threeBodyScene.regenerate(),
        '截图保存': () => {
            const link = document.createElement('a');
            link.download = `three-body-${Date.now()}.png`;
            link.href = threeBodyScene.renderer.domElement.toDataURL('image/png');
            link.click();
        },
        '重置视角': () => {
            threeBodyScene.camera.position.set(15, 10, 15);
            threeBodyScene.camera.lookAt(0, 0, 0);
        },
    };
    actionsFolder.add(actions, '重置系统');
    actionsFolder.add(actions, '截图保存');
    actionsFolder.add(actions, '重置视角');
    actionsFolder.open();

    // 信息
    const infoFolder = gui.addFolder('信息');
    const info = {
        '说明': '三体问题物理模拟',
        '操作': '拖动旋转视角，滚轮缩放',
        '快捷键': 'R-重置, S-截图, 空格-暂停',
        '版本': '1.0.0',
    };
    infoFolder.add(info, '说明').listen();
    infoFolder.add(info, '操作').listen();
    infoFolder.add(info, '快捷键').listen();
    infoFolder.add(info, '版本').listen();

    return gui;
}
