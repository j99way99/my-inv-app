#!/bin/sh

# Docker 정리 스크립트 (백엔드 컨테이너용)
LOG_FILE="/var/log/docker-cleanup.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] Starting Docker cleanup from backend container..." >> $LOG_FILE

# Docker 소켓을 통해 호스트의 Docker 명령 실행
if [ -S /var/run/docker.sock ]; then
    echo "[$DATE] Docker socket available, running cleanup..." >> $LOG_FILE
    
    # Docker 정리 실행
    docker system prune -f >> $LOG_FILE 2>&1
    
    # 디스크 사용량 확인
    df -h / >> $LOG_FILE 2>&1
    
    echo "[$DATE] Docker cleanup completed." >> $LOG_FILE
else
    echo "[$DATE] Docker socket not available, skipping cleanup." >> $LOG_FILE
fi

echo "----------------------------------------" >> $LOG_FILE