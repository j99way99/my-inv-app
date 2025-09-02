#!/bin/sh

# 로그 파일 설정
LOG_FILE="/var/log/docker-cleanup.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] Starting Docker cleanup from container..." >> $LOG_FILE

# 디스크 사용량 확인 (정리 전)
echo "[$DATE] Disk usage before cleanup:" >> $LOG_FILE
df -h / >> $LOG_FILE 2>&1

# Docker 정리 실행
echo "[$DATE] Running docker system prune..." >> $LOG_FILE
docker system prune -f >> $LOG_FILE 2>&1

# 사용하지 않는 이미지 정리 (일요일에만)
if [ $(date +%u) -eq 7 ]; then
    echo "[$DATE] Running weekly cleanup (removing unused images)..." >> $LOG_FILE
    docker system prune -a -f >> $LOG_FILE 2>&1
fi

# 디스크 사용량 확인 (정리 후)
echo "[$DATE] Disk usage after cleanup:" >> $LOG_FILE
df -h / >> $LOG_FILE 2>&1

echo "[$DATE] Docker cleanup completed." >> $LOG_FILE
echo "----------------------------------------" >> $LOG_FILE