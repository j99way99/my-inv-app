# AWS Deployment Application

Next.js 프론트엔드와 Node.js 백엔드로 구성된 풀스택 애플리케이션입니다.

## 프로젝트 구조

```
app-aws-deploy/
├── frontend/       # Next.js 프론트엔드
├── backend/        # Node.js 백엔드 서버
└── docker/         # Docker 설정 파일
```

## 시작하기

### 개발 환경

1. 백엔드 서버 실행:
```bash
cd backend
npm install
npm run dev
```

2. 프론트엔드 실행:
```bash
cd frontend
npm install
npm run dev
```

### 프로덕션 배포

Docker를 사용하여 AWS에 배포할 수 있습니다.

```bash
docker-compose up --build
```