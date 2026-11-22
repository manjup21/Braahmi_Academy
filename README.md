# Braahmi Academy

- `Static_UI/` — public marketing website
- `backend/` — ERP API (Express + PostgreSQL)
- `UI/` — ERP admin/lecturer PWA

## ERP local run

1. Ensure PostgreSQL database `braahmi_academy_erp` exists.
2. Backend:

```bash
cd backend
npm install
npm run dev
```

3. UI:

```bash
cd UI
npm install
npm run generate-pwa-icons
npm run dev
```

- API: http://localhost:5018/api  
- UI: http://localhost:5173  

Branding (name, address, phones, logo) is aligned with `Static_UI`.
