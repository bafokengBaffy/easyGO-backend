#!/bin/bash
echo "🚀 Starting EasyGo Professional Deployment..."

# 1. Build Frontend
if [ -d "web-frontend" ]; then
    cd web-frontend
else
    echo "❌ Error: web-frontend directory not found. Run this from the project root."
    exit 1
fi

echo "📦 Ensuring dependencies are installed (fixing missing modules)..."
npm install --legacy-peer-deps

echo "📦 Building production React assets..."
npm run build

# 2. Deploy to Firebase
cd ..
echo "☁️ Uploading to easygols.web.app..."
npx firebase-tools deploy --only hosting

echo "✅ Deployment Successful! Your app is live."