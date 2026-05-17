# BoothMarket — B2B Rental Marketplace

## Architecture Overview

```
boothmarket/
├── backend/          → Node.js + Express API server
│   ├── src/
│   │   ├── config/       → DB, cloud, JWT config
│   │   ├── controllers/  → Route handlers (business logic)
│   │   ├── middleware/   → Auth, validation, error handling
│   │   ├── models/       → PostgreSQL query models
│   │   ├── routes/       → API route definitions
│   │   ├── services/     → Email, GCS image upload
│   │   ├── utils/        → Helpers, constants
│   │   └── tests/        → Jest unit + integration tests
│   └── migrations/       → SQL schema files
│
├── frontend/         → React 18 SPA
│   └── src/
│       ├── components/   → Reusable UI components
│       ├── pages/        → Route-level pages
│       ├── hooks/        → Custom React hooks
│       ├── context/      → Auth + global state
│       └── services/     → Axios API calls
│
└── infra/            → Google Cloud deployment configs
```

## Three User Roles
1. **Consultant** — Exhibition booth designers. Browse & inquire on rental products.
2. **Rental Provider** — Individuals who list furniture, LED, lighting, etc. for rent.
3. **Company** — End customers (event management teams). View consultants.
4. **Admin** — Approves/rejects all registrations.

## Tech Stack
- **Frontend**: React 18, React Router v6, Axios, TailwindCSS
- **Backend**: Node.js 20, Express 5, JWT Auth, Multer
- **Database**: PostgreSQL 15 (Google Cloud SQL)
- **Storage**: Google Cloud Storage (product images)
- **Hosting**: Google Cloud Run (auto-scales to 1M users)
- **Email**: SendGrid (approval/rejection notifications)

## Setup Instructions

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Google Cloud account
- SendGrid account

### Backend Setup
```bash
cd backend
cp .env.example .env        # Fill in your values
npm install
npm run migrate             # Run DB migrations
npm run dev                 # Start on port 5000
```

### Frontend Setup
```bash
cd frontend
cp .env.example .env        # Fill in your values
npm install
npm start                   # Start on port 3000
```

### Environment Variables (Backend)
```
DATABASE_URL=postgresql://user:pass@host:5432/boothmarket
JWT_SECRET=your-256-bit-secret
JWT_REFRESH_SECRET=your-256-bit-refresh-secret
SENDGRID_API_KEY=SG.xxx
GCS_BUCKET_NAME=boothmarket-assets
GOOGLE_CLOUD_PROJECT=your-project-id
ADMIN_EMAIL=admin@boothmarket.com
CLIENT_URL=https://your-frontend-domain.com
```
