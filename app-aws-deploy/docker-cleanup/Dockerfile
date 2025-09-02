FROM alpine:latest

# cron과 docker cli 설치
RUN apk add --no-cache dcron docker-cli curl

# 크론잡 스크립트 복사
COPY cleanup-cron.sh /usr/local/bin/cleanup-cron.sh
COPY crontab /etc/crontabs/root

# 실행 권한 부여
RUN chmod +x /usr/local/bin/cleanup-cron.sh
RUN chmod 0644 /etc/crontabs/root

# 크론 데몬 실행
CMD ["crond", "-f", "-d", "8"]