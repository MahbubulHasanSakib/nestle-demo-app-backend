#!/bin/bash
cd /var/www/m-lenz
echo "pulling"
git pull origin main
echo "Dependency installing."
yarn
echo "bulding..."
yarn build
pm2 restart ecosystem.config.js
echo "Deployment complete."
