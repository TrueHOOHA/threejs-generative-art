/**
 * Create GUI controls for the generative art application
 * Uses dat.GUI for real-time parameter manipulation
 */

export function createGUI(gridScene) {
    // Create GUI container
    const guiContainer = document.createElement('div');
    guiContainer.className = 'gui-container';
    document.getElementById('ui-overlay').appendChild(guiContainer);

    // Import dat.GUI (we'll use a CDN approach for simplicity)
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/build/dat.gui.min.js';
    script.onload = () => {
        initGUI(guiContainer, gridScene);
    };
    document.head.appendChild(script);

    return { dom: guiContainer };
}

function initGUI(container, gridScene) {
    const gui = new dat.GUI({ autoPlace: false, width: 300 });
    container.appendChild(gui.domElement);

    // Grid Parameters
    const gridFolder = gui.addFolder('Grid Parameters');
    gridFolder.add(gridScene.params, 'columns', 3, 30, 1).name('Columns').onChange(() => gridScene.updateParams({ columns: gridScene.params.columns }));
    gridFolder.add(gridScene.params, 'rows', 3, 30, 1).name('Rows').onChange(() => gridScene.updateParams({ rows: gridScene.params.rows }));
    gridFolder.add(gridScene.params, 'spacing', 0.5, 3, 0.1).name('Spacing').onChange(() => gridScene.updateParams({ spacing: gridScene.params.spacing }));
    gridFolder.add(gridScene.params, 'width', 0.1, 2, 0.1).name('Width').onChange(() => gridScene.updateParams({ width: gridScene.params.width }));
    gridFolder.add(gridScene.params, 'depth', 0.1, 2, 0.1).name('Depth').onChange(() => gridScene.updateParams({ depth: gridScene.params.depth }));
    gridFolder.add(gridScene.params, 'height', 0.1, 3, 0.1).name('Height').onChange(() => gridScene.updateParams({ height: gridScene.params.height }));
    gridFolder.open();

    // Animation Parameters
    const animFolder = gui.addFolder('Animation');
    animFolder.add(gridScene.params, 'animate').name('Enable Animation').onChange(() => gridScene.toggleAnimation());
    animFolder.add(gridScene.params, 'animationSpeed', 0, 3, 0.1).name('Speed');
    animFolder.add(gridScene.params, 'rotationSpeed', 0, 2, 0.1).name('Rotation');
    animFolder.add(gridScene.params, 'waveAmplitude', 0, 5, 0.1).name('Wave Height');
    animFolder.add(gridScene.params, 'noiseScale', 0.01, 0.5, 0.01).name('Noise Scale');
    animFolder.open();

    // Visual Parameters
    const visualFolder = gui.addFolder('Visual');
    visualFolder.add(gridScene.params, 'useInstancing').name('Use Instancing').onChange(() => gridScene.updateParams({ useInstancing: gridScene.params.useInstancing }));
    visualFolder.add(gridScene.params, 'showWireframe').name('Wireframe').onChange(() => gridScene.updateParams({ showWireframe: gridScene.params.showWireframe }));
    visualFolder.open();

    // Color Palette
    const colorFolder = gui.addFolder('Colors');
    const colorOptions = {
        'Earth': ['#8B4513', '#D2691E', '#CD853F', '#DEB887', '#F5DEB3'],
        'Vibrant': ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'],
        'Monochrome': ['#1a1a1a', '#4a4a4a', '#7a7a7a', '#aaaaaa', '#dadada'],
        'Sunset': ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'],
        'Ocean': ['#0077b6', '#0096c7', '#00b4d8', '#48cae4', '#90e0ef'],
        'Forest': ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2'],
        'Neon': ['#ff00ff', '#00ffff', '#ff00aa', '#00ff00', '#ffff00'],
        'Pastel': ['#ffc8dd', '#ffafcc', '#bde0fe', '#a2d2ff', '#cdb4db'],
    };

    const currentPalette = { value: 'Vibrant' };
    colorFolder.add(currentPalette, 'value', Object.keys(colorOptions)).name('Palette').onChange((value) => {
        gridScene.params.colorPalette = colorOptions[value];
        gridScene.updateParams({ colorPalette: colorOptions[value] });
    });
    colorFolder.open();

    // Actions
    const actionsFolder = gui.addFolder('Actions');
    const actions = {
        'Regenerate': () => gridScene.regenerate(),
        'Random Palette': () => {
            const keys = Object.keys(colorOptions);
            const randomKey = keys[Math.floor(Math.random() * keys.length)];
            gridScene.params.colorPalette = colorOptions[randomKey];
            gridScene.updateParams({ colorPalette: colorOptions[randomKey] });
        },
        'Export Screenshot': () => {
            const link = document.createElement('a');
            link.download = `generative-art-${Date.now()}.png`;
            link.href = gridScene.renderer.domElement.toDataURL('image/png');
            link.click();
        },
        'Reset Camera': () => {
            gridScene.camera.position.set(15, 10, 15);
            gridScene.camera.lookAt(0, 0, 0);
        },
    };
    actionsFolder.add(actions, 'Regenerate');
    actionsFolder.add(actions, 'Random Palette');
    actionsFolder.add(actions, 'Export Screenshot');
    actionsFolder.add(actions, 'Reset Camera');
    actionsFolder.open();

    // Info
    const infoFolder = gui.addFolder('Info');
    const info = {
        'Instructions': 'Drag to rotate, Scroll to zoom, R to regenerate, S to save',
        'Performance': 'Use instancing for large grids',
        'Version': '1.0.0',
    };
    infoFolder.add(info, 'Instructions').listen();
    infoFolder.add(info, 'Performance').listen();
    infoFolder.add(info, 'Version').listen();

    return gui;
}