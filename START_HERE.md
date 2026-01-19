# 🎨 Three.js Generative Art - 快速开始

恭喜！你已经成功创建了一个完整的 Three.js 3D 艺术项目。这是一个交互式的生成艺术网格系统，灵感来自 Lygia Clark 的几何艺术。

## 🚀 立即开始

### 1. 启动开发服务器
```bash
cd threejs-generative-art
npm run dev
```

### 2. 打开浏览器
访问 `http://localhost:3000`

### 3. 交互体验
- 🖱️ **拖拽**：旋转相机视角
- 🔍 **滚轮**：缩放视图
- 🎨 **GUI 面板**：实时调整参数
- ⌨️ **快捷键**：
  - `R` - 重新生成网格
  - `S` - 保存截图
  - `空格` - 切换动画

## 🎯 项目特色

### ✨ 核心功能
- **动态网格系统**：可调节的列数、行数、间距
- **波浪动画**：使用正弦函数创建有机流动效果
- **9+ 艺术配色**：从大地色系到霓虹色彩
- **性能优化**：实例化渲染支持 10,000+ 对象
- **实时控制**：dat.GUI 面板实时调整所有参数

### 🎨 艺术风格
- **Lygia Clark 灵感**：几何网格与有机运动的结合
- **生成艺术**：算法驱动的视觉创作
- **交互体验**：观众可以参与创作过程

### ⚡ 技术亮点
- **Three.js v160**：现代 3D 渲染引擎
- **Vite 构建**：极速开发体验
- **InstancedMesh**：GPU 加速渲染
- **响应式设计**：支持桌面和移动设备

## 📁 项目结构

```
threejs-generative-art/
├── src/
│   ├── scenes/
│   │   └── GridScene.js          # 核心网格生成系统
│   ├── utils/
│   │   ├── colors.js             # 颜色工具和调色板
│   │   ├── gui.js                # GUI 控制面板
│   │   └── stats.js              # 性能监控
│   ├── main.js                   # 应用入口
│   └── style.css                 # UI 样式
├── test/
│   └── test-setup.cjs            # 项目测试脚本
├── index.html                    # HTML 入口
├── vite.config.js                # 构建配置
├── package.json                  # 依赖管理
├── README.md                     # 详细文档
└── START_HERE.md                 # 本文件
```

## 🎮 交互指南

### GUI 面板功能

**Grid Parameters (网格参数)**
- Columns/Rows: 调整网格尺寸 (3-30)
- Spacing: 网格间距 (0.5-3)
- Width/Depth/Height: 立方体尺寸

**Animation (动画)**
- Enable Animation: 开关动画
- Speed: 动画速度 (0-3)
- Rotation: 旋转速度 (0-2)
- Wave Height: 波浪幅度 (0-5)
- Noise Scale: 噪声尺度 (0.01-0.5)

**Visual (视觉)**
- Use Instancing: 性能优化开关
- Wireframe: 线框模式

**Colors (颜色)**
- 9+ 预设调色板
- 随机配色功能

**Actions (操作)**
- Regenerate: 重新生成
- Random Palette: 随机配色
- Export Screenshot: 导出截图
- Reset Camera: 重置相机

## 🎨 艺术创作提示

### 探索不同风格

1. **大地艺术**
   - 选择 "Earth" 调色板
   - 降低动画速度到 0.5
   - 增加波浪幅度到 3
   - 适合：有机、自然主题

2. **赛博朋克**
   - 选择 "Neon" 调色板
   - 提高动画速度到 2
   - 开启线框模式
   - 适合：未来主义、科技主题

3. **极简主义**
   - 选择 "Monochrome" 调色板
   - 减少网格尺寸 (5x5)
   - 关闭动画
   - 适合：现代、简约主题

4. **梦幻色彩**
   - 选择 "Pastel" 调色板
   - 中等动画速度 (1)
   - 适中的波浪幅度 (2)
   - 适合：浪漫、温柔主题

### 创作技巧

- **构图**：尝试不同的网格尺寸和间距
- **节奏**：调整动画速度创造不同节奏感
- **色彩**：实验不同调色板的情绪表达
- **视角**：从不同角度观察同一场景

## 📸 导出作品

### 截图导出
1. 调整到满意的画面
2. 按 `S` 键或点击 "Export Screenshot"
3. PNG 文件自动下载到浏览器下载目录

### 高分辨率技巧
1. 在浏览器开发者工具中设置设备像素比
2. 或修改代码中的 `renderer.setPixelRatio()`
3. 重新加载页面后截图

## 🔧 高级配置

### 修改默认参数
编辑 `src/scenes/GridScene.js` 中的 `params` 对象：

```javascript
this.params = {
    columns: 12,        // 默认列数
    rows: 12,           // 默认行数
    spacing: 1.5,       // 默认间距
    // ... 其他参数
}
```

### 添加新调色板
编辑 `src/utils/colors.js` 中的 `PALETTES` 对象：

```javascript
export const PALETTES = {
    // ... 现有调色板
    MY_PALETTE: ['#ff0000', '#00ff00', '#0000ff'],
};
```

### 自定义动画
修改 `src/scenes/GridScene.js` 中的 `update()` 方法：

```javascript
update(delta, elapsed) {
    // 添加你的自定义动画逻辑
    const customValue = Math.sin(elapsed * 0.5) * 2;
    // 应用到网格对象
}
```

## 🐛 常见问题

### 页面空白或黑屏
- 检查浏览器控制台错误
- 确保 WebGL 支持：访问 `chrome://gpu`
- 尝试不同的浏览器（Chrome, Firefox, Edge）

### 性能问题
- 启用 "Use Instancing" 选项
- 减少网格尺寸
- 降低动画速度
- 关闭其他浏览器标签

### GUI 不显示
- 检查网络连接（需要 CDN 加载 dat.GUI）
- 等待几秒让脚本加载
- 查看浏览器控制台错误

### 导出截图失败
- 检查浏览器下载设置
- 尝试不同的浏览器
- 确保没有弹窗阻止下载

## 🚀 生产部署

### 构建项目
```bash
npm run build
```

### 预览构建
```bash
npm run preview
```

### 部署到 Vercel
1. 推送到 GitHub
2. 连接到 Vercel
3. 自动部署

## 📚 学习资源

- [Three.js 官方文档](https://threejs.org/docs/)
- [Vite 文档](https://vitejs.dev/)
- [生成艺术介绍](https://generativeartistry.com/)
- [Lygia Clark 艺术](https://www.tate.org.uk/art/artists/lygia-clark-16391)

## 🎉 开始创作！

现在你拥有一个完整的、可运行的 Three.js 3D 艺术项目。尽情实验不同的参数组合，创造属于你的独特艺术作品！

**提示**：每个参数的微小变化都可能产生意想不到的美丽效果，大胆尝试吧！