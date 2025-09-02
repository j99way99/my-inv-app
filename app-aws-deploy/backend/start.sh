#!/bin/sh

# 크론 데몬 시작
echo "Starting cron daemon..."
crond -d 8 &

# Node.js 애플리케이션 시작
echo "Starting Node.js application..."
exec node server.js