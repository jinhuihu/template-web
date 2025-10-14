#!/bin/bash

# 静态页面构建脚本
# 用法: ./build.sh

echo "=========================================="
echo "  静态页面构建工具"
echo "=========================================="

# 检查Mock服务器是否运行
if ! lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo ""
    echo "⚠️  警告: Mock API服务器未运行！"
    echo ""
    echo "请先在另一个终端窗口启动Mock服务器："
    echo "  node mock-server.js"
    echo ""
    echo "或者按 Ctrl+C 取消，我们为您启动..."
    sleep 3
    
    echo ""
    echo "🚀 启动Mock服务器..."
    node mock-server.js > mock.log 2>&1 &
    MOCK_PID=$!
    echo "   Mock服务器PID: $MOCK_PID"
    
    # 等待服务器启动
    echo "   等待服务器启动..."
    sleep 2
    
    # 验证服务器是否启动成功
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "   ✓ Mock服务器启动成功"
        AUTO_STARTED=1
    else
        echo "   ✗ Mock服务器启动失败"
        exit 1
    fi
else
    echo ""
    echo "✓ Mock API服务器正在运行"
    AUTO_STARTED=0
fi

echo ""
echo "📦 开始构建..."
echo ""

# 运行构建
npm run build

BUILD_EXIT_CODE=$?

echo ""
if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo "=========================================="
    echo "  ✅ 构建成功！"
    echo "=========================================="
    echo ""
    echo "生成的文件在 dist/ 目录中"
    echo ""
    echo "你可以："
    echo "  1. 用浏览器打开 dist/index.html 查看效果"
    echo "  2. 将 dist/ 目录部署到静态服务器"
    echo ""
else
    echo "=========================================="
    echo "  ❌ 构建失败"
    echo "=========================================="
    echo ""
    echo "请检查错误信息并重试"
    echo ""
fi

# 如果是自动启动的Mock服务器，询问是否停止
if [ $AUTO_STARTED -eq 1 ]; then
    echo "Mock服务器仍在后台运行 (PID: $MOCK_PID)"
    echo "如需停止，运行: kill $MOCK_PID"
    echo "或运行: pkill -f 'node mock-server'"
    echo ""
fi

