#!/bin/bash

echo ""
echo "🎨 Three.js Generative Art - 启动脚本"
echo "========================================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js，请先安装 Node.js"
    exit 1
fi

echo "Node.js 版本: $(node --version)"

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

echo ""
echo "✅ 准备就绪！"
echo ""
echo "启动开发服务器..."
echo ""
echo "🚀 在浏览器中打开: http://localhost:3000"
echo ""
echo "快捷键:"
echo "  R - 重新生成网格"
echo "  S - 保存截图"
echo "  空格 - 切换动画"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

npm run dev