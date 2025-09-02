#!/bin/bash

# 크론 데몬 시작 (Ubuntu/Debian)
echo "Starting cron service..."
service cron start

# Node.js 애플리케이션 시작
echo "Starting Node.js application..."
exec node server.js