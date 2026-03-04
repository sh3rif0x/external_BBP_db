#!/bin/bash

# 🚀 QUICK START DEPLOYMENT SCRIPT

echo "╔════════════════════════════════════════════════════════╗"
echo "║  🎯 BUG BOUNTY PROGRAMS - DEPLOYMENT STARTER          ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

PROJECT_DIR="/home/boot/Desktop/external_BBP_db"

echo "✅ DEPLOYMENT OPTIONS:"
echo ""
echo "1️⃣  Python Server (Simplest)"
echo "    Command: npm run serve:python"
echo "    Port: 3000"
echo ""
echo "2️⃣  Node Serve Package"
echo "    Command: npm run serve:node"
echo "    Port: Auto-detected"
echo ""
echo "3️⃣  Development Server"
echo "    Command: npm run dev"
echo "    Port: 3000"
echo ""
echo "📖 LOGIN CREDENTIALS:"
echo "    Username: sh3rif0x"
echo "    Password: sh3rif0x"
echo ""

# Check if build exists
if [ -d "$PROJECT_DIR/build" ]; then
    echo "✅ Build folder exists and ready!"
    echo "   Size: $(du -sh $PROJECT_DIR/build | cut -f1)"
else
    echo "❌ Build folder not found. Run: npm run build"
    exit 1
fi

echo ""
read -p "Which option do you want to use? (1-3): " option

case $option in
    1)
        echo ""
        echo "🚀 Starting with Python Server..."
        sleep 1
        cd "$PROJECT_DIR/build"
        python3 -m http.server 3000
        ;;
    2)
        echo ""
        echo "🚀 Starting with Node Serve..."
        sleep 1
        cd "$PROJECT_DIR"
        if ! command -v serve &> /dev/null; then
            echo "Installing serve package..."
            npm install -g serve
        fi
        serve -s build
        ;;
    3)
        echo ""
        echo "🚀 Starting development server..."
        sleep 1
        cd "$PROJECT_DIR"
        npm start
        ;;
    *)
        echo "Invalid option!"
        exit 1
        ;;
esac
