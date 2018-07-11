#!/bin/sh

echo "[0/3] WELCOME TO THE DAPNET WEB DOCKER IMAGE!"

# build website
echo "[1/3] BUILDING WEBSITE..."
cd /app/

if ! npm run build ; then
  exit 1
fi

# start coverage cron
echo "[2/3] STARTING COVERAGE DATA CRON..."
nohup sh /app/docker/coverage.sh &

# start nginx
echo "[3/4] STARTING NGINX..."
nginx -g 'pid /tmp/nginx.pid; daemon off;'
