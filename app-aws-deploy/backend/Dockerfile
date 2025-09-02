FROM node:18-alpine

# cron과 docker cli 설치
RUN apk add --no-cache dcron docker-cli

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# 크론잡 스크립트 복사 및 권한 설정
COPY docker-cleanup.sh /usr/local/bin/docker-cleanup.sh
RUN chmod +x /usr/local/bin/docker-cleanup.sh

# 크론탭 설정
RUN echo "0 2 * * * /usr/local/bin/docker-cleanup.sh" > /etc/crontabs/root
RUN chmod 0644 /etc/crontabs/root

# 로그 디렉터리 생성
RUN mkdir -p /var/log

EXPOSE 5000

# 크론 데몬과 Node.js 앱을 동시에 실행하는 스크립트
COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]