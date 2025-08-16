# 소규모 재고 관리 시스템

웹 기반 소규모 재고 관리 시스템으로, 물품 등록, 주문 관리, 사용자 인증 등의 기능을 제공합니다.

## 주요 기능

- 사용자 회원가입 및 로그인
- 물품 등록 및 재고 관리
- 주문 생성 및 관리
- 신청 이벤트 처리
- RESTful API 제공

## 기술 스택

### Frontend
- **Next.js 14** - React 기반 프레임워크
- **TypeScript** - 타입 안전성을 위한 언어
- **Tailwind CSS** - 유틸리티 기반 CSS 프레임워크
- **React** - 사용자 인터페이스 라이브러리

### Backend
- **Node.js** - JavaScript 런타임
- **Express.js** - 웹 애플리케이션 프레임워크
- **MongoDB** - NoSQL 데이터베이스
- **Mongoose** - MongoDB ODM
- **JWT** - 인증을 위한 JSON Web Token
- **bcryptjs** - 비밀번호 암호화

### 인프라
- **Docker** - 컨테이너화
- **Docker Compose** - 멀티 컨테이너 관리

## 프로젝트 구조

```
small-inv-management/
├── app-aws-deploy/          # 메인 애플리케이션
│   ├── backend/             # Node.js 백엔드
│   │   ├── models/         # MongoDB 모델
│   │   └── server.js       # 서버 진입점
│   ├── frontend/           # Next.js 프론트엔드
│   │   ├── app/           # Next.js 앱 라우터
│   │   └── components/    # React 컴포넌트
│   └── docker-compose.yml # Docker 구성
└── src/                    # Java 코드 (참고용)
```

## 실행 방법

### Docker를 사용한 실행

```bash
cd app-aws-deploy
docker-compose up -d
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- MongoDB: localhost:27017

### 개발 환경 실행

1. 백엔드 실행:
```bash
cd app-aws-deploy/backend
npm install
npm run dev
```

2. 프론트엔드 실행:
```bash
cd app-aws-deploy/frontend
npm install
npm run dev
```

## API 엔드포인트

- `/api/auth` - 사용자 인증
- `/api/items` - 물품 관리
- `/api/orders` - 주문 관리
- `/api/apply-events` - 신청 이벤트

## 환경 변수

### Backend
- `MONGODB_URI` - MongoDB 연결 URI
- `JWT_SECRET` - JWT 시크릿 키
- `PORT` - 서버 포트 (기본값: 5000)

### Frontend
- `NEXT_PUBLIC_API_URL` - 백엔드 API URL