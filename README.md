# BandMates AI 🎸

**Your Personal AI Writing Coach.**

An intelligent web application that evaluates English writing proficiency using Google Gemini AI. Built with a production-ready **Modular Monolith** architecture and modern React ecosystem.

![BandMates Platform](https://img.shields.io/badge/Status-Production-green)

## 🚀 Features

- **AI-Powered Analysis**: Instant feedback on grammar, vocabulary, and style using Gemini 1.5 Flash.
- **Secure Authentication**: 
  - Google OAuth2 integration.
  - **HttpOnly Cookies** for Refresh Token storage (XSS Protection).
  - Silent Refresh mechanism for seamless user experience.
- **Rate Limiting System**: 
  - Complex logic to limit Guest users to 3 requests/day.
  - Implemented using MySQL backing (no Redis dependency required).
- **Modern UI/UX**: 
  - Clean interface built with **Ant Design** & **Tailwind CSS**.
  - Real-time scoring visualization.

## 🛠️ Tech Stack

### Backend (NestJS)
- **Framework**: NestJS (Modular Monolith Architecture).
- **Database**: MySQL + TypeORM.
- **Security**: Helmet, Cookie-Parser, CORS, JWT (Access + Refresh Token rotation).
- **AI Integration**: Google Generative AI SDK.
- **Validation**: Class-Validator (Env vars & DTOs).

### Frontend (React)
- **Core**: React 19 + Vite.
- **State Management**: Zustand (Lightweight & Scalable).
- **Styling**: Tailwind CSS + Ant Design.
- **HTTP Client**: Axios (with Interceptors for Auto-Auth).

## 📂 Project Structure

```
bandmates/
├── backend/          # NestJS Server
│   ├── src/config/       # Environment Validation & DB Config
│   ├── src/modules/      # Feature Modules (Auth, Users, Scoring)
│   └── src/common/       # Shared Guards, Decorators, Utils
└── frontend/         # React Client
    ├── src/pages/        # Route Components
    ├── src/store/        # Zustand Stores
    └── src/services/     # API Integration
```

## ⚡ Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL Database

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Update your credentials
npm run start:dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Environment Variables (.env)
**Backend:**
```env
PORT=3000
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=...
DATABASE_NAME=bandmates_db
JWT_SECRET=...
JWT_REFRESH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GEMINI_API_KEY=...
```

## 📬 Liên hệ

Dự án được phát triển và duy trì bởi:

*   **Phan Đình Tuân** - *Backend Developer*
*   📧 Email: [tuanktvn2001@gmail.com](mailto:tuanktvn2001@gmail.com)
*   🐙 Github: [github.com/nameTun](https://github.com/nameTun)
*   💼 LinkedIn: [linkedin.com/in/phan-dinh-tuan](https://www.linkedin.com/in/phan-dinh-tuan)
---