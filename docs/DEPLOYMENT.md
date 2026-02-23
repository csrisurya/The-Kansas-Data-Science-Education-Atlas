# Kansas Atlas Deployment Guide

## 1. Prerequisites

- **Node.js** (v18+): For frontend build and deployment
- **Python** (3.10+): For backend API
- **PostgreSQL** (v13+): Database
- **Railway/Render**: Backend hosting
- **Vercel/Netlify**: Frontend hosting

---

## 2. Environment Variables

Set these variables for backend and frontend:

### Backend (.env)
- `DATABASE_URL` — PostgreSQL connection string (e.g. `postgresql://user:pass@host/db`)
- `API_V1_STR` — API prefix (default: `/api/v1`)
- `PROJECT_NAME` — Project name
- `SECRET_KEY` — Secure random string
- `BACKEND_CORS_ORIGINS` — Allowed origins (comma-separated)

### Frontend (.env)
- `VITE_API_URL` — Backend API URL (e.g. `https://your-backend-url`)

---

## 3. Backend Deployment (Railway/Render)

### Railway
1. Create a new project in Railway.
2. Add PostgreSQL plugin and note the connection string.
3. Deploy backend folder:
	```bash
	railway run python -m venv venv
	railway run pip install -r requirements.txt
	railway run uvicorn app.main:app --host 0.0.0.0 --port 8000
	```
4. Set environment variables in Railway dashboard.

### Render
1. Create a new web service.
2. Set build command:
	```bash
	pip install -r requirements.txt
	```
3. Set start command:
	```bash
	uvicorn app.main:app --host 0.0.0.0 --port 8000
	```
4. Add environment variables in Render dashboard.
5. Add PostgreSQL database and update `DATABASE_URL`.

---

## 4. Frontend Deployment (Vercel/Netlify)

### Vercel
1. Import frontend repo.
2. Set `VITE_API_URL` in project settings.
3. Build command:
	```bash
	npm run build
	```
4. Output directory: `dist`

### Netlify
1. Import frontend repo.
2. Set `VITE_API_URL` in environment variables.
3. Build command:
	```bash
	npm run build
	```
4. Publish directory: `dist`

---

## 5. Database Migration

1. Ensure PostgreSQL is running and accessible.
2. Run migration scripts (e.g. using Alembic or custom SQL):
	```bash
	psql $DATABASE_URL < data/schemas/create_tables.sql
	```
3. Load initial data:
	```bash
	python scripts/load_data.py
	```

---

## 6. SSL Configuration

### Railway/Render
- Enable SSL for PostgreSQL in dashboard.
- Use `sslmode=require` in `DATABASE_URL` if needed.

### Vercel/Netlify
- SSL is enabled by default for custom domains.

---

## 7. Monitoring Setup

- **Backend**: Add Railway/Render monitoring or use [UptimeRobot](https://uptimerobot.com/) for health checks.
- **Frontend**: Use Vercel/Netlify analytics.
- **Logs**: Enable log streaming in hosting dashboards.

---

## 8. Troubleshooting

### Common Issues
- **Backend not reachable**: Check `DATABASE_URL`, port, and CORS settings.
- **Frontend API errors**: Verify `VITE_API_URL` matches backend URL.
- **Database migration errors**: Confirm schema and credentials.
- **SSL errors**: Ensure correct `sslmode` and certificates.

### Debugging Commands
```bash
# Check backend logs
railway logs
render logs

# Test API health
curl https://your-backend-url/health

# Test database connection
psql $DATABASE_URL

# Rebuild frontend
npm run build
```

---

## References
- [Railway Docs](https://docs.railway.app/)
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com/)
