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

### 인프라 & DevOps
- **Docker** - 컨테이너화
- **Docker Compose** - 멀티 컨테이너 관리
- **GitHub Actions** - CI/CD 파이프라인
- **Nginx** - 리버스 프록시 및 로드 밸런서

## 프로젝트 구조

```
my-inv-app/
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

## CI/CD 파이프라인

이 프로젝트는 GitHub Actions를 사용한 자동 배포 파이프라인을 포함합니다.

### 배포 트리거
- `main` 브랜치에 push할 때 자동 배포
- 수동 배포도 가능 (workflow_dispatch)

### 배포 과정
1. **테스트 단계**
   - 백엔드/프론트엔드 의존성 설치
   - 테스트 실행 (있는 경우)
   - 프론트엔드 빌드 검증

2. **빌드 및 배포 단계**
   - Docker 이미지 빌드
   - Docker Hub에 이미지 푸시
   - 서버에 SSH 접속하여 배포
   - Slack 알림 (선택사항)

### 필요한 GitHub Secrets

다음 secrets을 GitHub 저장소에 설정해야 합니다:

#### Docker Hub
- `DOCKER_USERNAME` - Docker Hub 사용자명
- `DOCKER_PASSWORD` - Docker Hub 비밀번호

#### 서버 접속
- `HOST` - 배포 서버 IP 주소
- `USERNAME` - 서버 사용자명
- `SSH_PRIVATE_KEY` - SSH 개인키
- `PORT` - SSH 포트 (기본값: 22)

#### 알림 (선택사항)
- `SLACK_WEBHOOK_URL` - Slack 웹훅 URL

### 서버 설정

배포 서버에서 다음 설정이 필요합니다:

1. **프로젝트 클론**
```bash
cd /opt
git clone https://github.com/j99way99/my-inv-app.git
cd small-inv-management
```

2. **환경 변수 설정**
```bash
cp .env.example .env
# .env 파일을 편집하여 실제 값으로 설정
```

3. **SSL 인증서 설정** (HTTPS 사용 시)
```bash
mkdir -p nginx/ssl
# SSL 인증서를 nginx/ssl/ 디렉토리에 배치
# cert.pem과 key.pem 파일 필요
```

4. **배포 스크립트 권한**
```bash
chmod +x deploy.sh
```

### 프로덕션 배포 명령

```bash
# 프로덕션 환경으로 배포
docker-compose -f docker-compose.prod.yml up -d
```