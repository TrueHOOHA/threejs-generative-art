@echo off
echo.
echo 🎨 Three.js Generative Art - 启动脚本
echo ========================================
echo.

cd /d "%~dp0"

echo 检查 Node.js 版本...
node --version
if errorlevel 1 (
    echo ❌ 错误: 未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

echo.
echo 检查依赖...
if not exist "node_modules" (
    echo 📦 安装依赖...
    call npm install
)

echo.
echo ✅ 准备就绪！
echo.
echo 启动开发服务器...
echo.
echo 🚀 在浏览器中打开: http://localhost:3000
echo.
echo 快捷键:
echo   R - 重新生成网格
echo   S - 保存截图
echo   空格 - 切换动画
echo.
echo 按 Ctrl+C 停止服务器
echo.

call npm run dev