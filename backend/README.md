# Braahmi Academy ERP API

Express + PostgreSQL API for Braahmi Academy.

- Database name: `braahmi_academy_erp`
- School branding env: `SCHOOL_NAME=Braahmi Academy`
- Default local port: `5018`

## Setup

```bash
cd backend
cp .env.example .env
# fill PG* credentials and AES_KEY_BASE64
npm install
npm run dev
```

Health check: `http://localhost:5018/api/health`
