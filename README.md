# Three.js Generative Art - Interactive 3D Grid System

A beautiful, interactive generative art project inspired by Lygia Clark's geometric art. Built with Three.js, featuring real-time parameter manipulation, performance optimization, and export capabilities.

## 🎨 Features

- **Interactive 3D Grid System**: Dynamic geometric grids with real-time animation
- **Performance Optimized**: Instanced mesh rendering for thousands of objects
- **Real-time Controls**: GUI panel for live parameter adjustment
- **Multiple Color Palettes**: 9+ artistic color schemes
- **Wave Animations**: Organic, flowing movements using sine functions
- **Camera Controls**: Smooth orbit controls with constraints
- **Export Functionality**: Save high-resolution screenshots
- **Performance Monitoring**: FPS counter and memory tracking
- **Keyboard Shortcuts**: Quick access to common actions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or modern browser with WebGL support

### Installation & Development

```bash
# Navigate to project directory
cd threejs-generative-art

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The development server will open at `http://localhost:3000`

## 🎮 Controls

### Mouse/Touch
- **Drag**: Rotate camera
- **Scroll**: Zoom in/out
- **Hover**: Highlight grid elements

### Keyboard
- **R**: Regenerate grid
- **S**: Save screenshot
- **Space**: Toggle animation
- **Mouse**: Interactive camera control

### GUI Panel
The control panel (top-left) provides real-time adjustment of:
- Grid dimensions (columns, rows, spacing)
- Animation parameters (speed, amplitude, noise)
- Visual settings (wireframe, instancing)
- Color palettes
- Actions (regenerate, random palette, export)

## 📁 Project Structure

```
threejs-generative-art/
├── src/
│   ├── scenes/
│   │   └── GridScene.js          # Main generative grid system
│   ├── utils/
│   │   ├── colors.js             # Color utilities and palettes
│   │   ├── gui.js                # GUI controls
│   │   └── stats.js              # Performance monitoring
│   ├── shaders/                  # GLSL shaders (future)
│   ├── main.js                   # Application entry point
│   └── style.css                 # UI styling
├── public/                       # Static assets
├── index.html                    # HTML entry
├── vite.config.js                # Build configuration
└── package.json                  # Dependencies
```

## 🎨 Color Palettes

The project includes 9+ artistic color schemes:

- **Earth**: Organic, natural tones
- **Vibrant**: Purple, pink, blue gradients
- **Monochrome**: Black and white variations
- **Sunset**: Warm reds, oranges, yellows
- **Ocean**: Deep blues and teals
- **Forest**: Green and earth tones
- **Neon**: Cyberpunk bright colors
- **Pastel**: Soft, dreamy colors
- **Fire**: Red, orange, gold
- **Ice**: Cool blues and cyans

## ⚡ Performance Features

### Instanced Rendering
- Uses `THREE.InstancedMesh` for optimal performance
- Single draw call for thousands of objects
- GPU-accelerated transformations

### Optimized Animation
- Efficient wave calculations using sine functions
- Frame rate independent animations
- Optional animation toggle

### Memory Management
- Proper disposal of geometries and materials
- Object pooling for dynamic updates
- Memory leak detection

## 🔧 Technical Details

### Technologies
- **Three.js v160**: 3D rendering engine
- **Vite**: Fast development server and build tool
- **GSAP**: Animation library (optional)
- **dat.GUI**: Real-time controls

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance Targets
- **60 FPS**: Target frame rate
- **10,000+ instances**: Supported with instancing
- **< 50MB**: Memory usage for typical scenes

## 🎯 Usage Examples

### Basic Usage
```javascript
// The app auto-initializes on DOM ready
// Access via window.app if needed
```

### Custom Color Palette
```javascript
// In GUI, select "Custom" palette
// Or modify in code:
gridScene.params.colorPalette = ['#ff0000', '#00ff00', '#0000ff'];
gridScene.updateParams({ colorPalette: ['#ff0000', '#00ff00', '#0000ff'] });
```

### Programmatic Control
```javascript
// Access the grid scene
const gridScene = window.app.gridScene;

// Regenerate with new parameters
gridScene.params.columns = 20;
gridScene.params.rows = 20;
gridScene.regenerate();

// Toggle animation
gridScene.toggleAnimation();
```

## 📸 Exporting Art

### Screenshot
- Press **S** or use GUI "Export Screenshot"
- Downloads high-resolution PNG
- Includes current scene state

### Video Recording
- Use browser screen recording
- Or programmatically capture frames
- See `PerformanceMonitor` for frame tracking

## 🔍 Troubleshooting

### Performance Issues
1. Enable instancing in GUI
2. Reduce grid dimensions
3. Lower animation speed
4. Close other browser tabs

### Rendering Issues
1. Check WebGL support: `chrome://gpu`
2. Update graphics drivers
3. Try different browser
4. Disable hardware acceleration if needed

### GUI Not Loading
1. Check internet connection (CDN required)
2. Try manual dat.GUI installation
3. Use browser console for manual control

## 🚀 Advanced Features

### Shader Integration (Future)
- Custom GLSL shaders for visual effects
- Post-processing effects
- Real-time shader compilation

### Export Formats
- PNG screenshots
- Video sequences
- 3D model export (GLTF)

### Performance Profiling
- FPS monitoring
- Memory usage tracking
- Frame time analysis

## 📚 Learning Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [Lygia Clark Art](https://www.tate.org.uk/art/artists/lygia-clark-16391)
- [Generative Art Principles](https://generativeartistry.com/)
- [WebGL Best Practices](https://webglfundamentals.org/)

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📄 License

MIT License - feel free to use in personal and commercial projects.

## 🎉 Credits

- Three.js team for the amazing 3D library
- Lygia Clark for artistic inspiration
- Vite team for the build tool
- dat.GUI for the control interface

---

**Happy Creating!** 🎨✨