FROM node:18-alpine

# Alpine에서 Sharp 빌드를 위한 패키지 설치
RUN apk add --no-cache \
    vips-dev \
    python3 \
    make \
    g++

WORKDIR /app

COPY package*.json ./

# Sharp를 Alpine 환경에서 다시 빌드
RUN npm ci --only=production && \
    npm rebuild sharp

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]