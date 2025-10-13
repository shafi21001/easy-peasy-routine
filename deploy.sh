#!/bin/bash

echo "Building the project..."
npm run build

echo "Build completed. Contents of dist folder:"
ls -la dist/

echo "Deploying to GitHub Pages..."
git add .
git commit -m "Deploy: Update build files"
git push origin main

echo "Deployment completed!"
echo "Your site should be available at: https://shafi21001.github.io/easy-peasy-routine/"
echo ""
echo "If you're still seeing a white page, try:"
echo "1. Wait 5-10 minutes for GitHub Pages to update"
echo "2. Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)"
echo "3. Check browser console for errors (F12 -> Console tab)"
echo "4. Try accessing: https://shafi21001.github.io/easy-peasy-routine/index.html"
