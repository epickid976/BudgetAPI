# Dokploy Deployment Guide

## Prerequisites
- Dokploy installed on your VPS
- Docker Hub account with `epickid976/budgetapi` image

## Deployment Steps

### 1. Create New Application in Dokploy

1. Go to your Dokploy dashboard
2. Create a new **Docker Compose** application
3. Name it: `budgetapi`

### 2. Configure Docker Compose

Use the `docker-compose.yml` from this repository.

**Important**: The app exposes port `3000` internally. Dokploy will handle the external routing.

### 3. Set Environment Variables in Dokploy

Add these environment variables through Dokploy's UI:

#### Required Variables:
```
JWT_ACCESS_SECRET=your_super_secret_access_key_min_16_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_16_chars
```

Generate strong secrets with:
```bash
openssl rand -base64 32
```

#### Optional Email Variables:
```
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
APP_URL=https://your-frontend-domain.com
```

### 4. Configure Domain

In Dokploy:
1. Go to your application settings
2. Add domain: `budgetapi.ejvapps.online`
3. Enable SSL/HTTPS (Dokploy handles this automatically with Let's Encrypt)
4. Set the port: `3000`

### 5. Deploy

Click **Deploy** in Dokploy. It will:
- Pull the Docker image
- Start PostgreSQL database
- Run migrations automatically (via start script)
- Set up reverse proxy with SSL

### 6. Verify Deployment

Check these endpoints:
```bash
# Health check
curl https://budgetapi.ejvapps.online/health

# Should return:
# {"status":"ok","database":"connected",...}

# Test auth endpoint
curl https://budgetapi.ejvapps.online/api/auth/login

# Should return 400 (validation error), not 404
```

## Available Endpoints

- **Health Check**: `GET /health`
- **Auth**: `/api/auth/*`
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/refresh`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
- **Accounts**: `/api/accounts/*`
- **Categories**: `/api/categories/*`
- **Transactions**: `/api/transactions/*`
- **Budgets**: `/api/budgets/*`

## Database Backup

The PostgreSQL data is stored in a Docker volume named `postgres_data`.

To backup:
```bash
docker exec budgetapi-db pg_dump -U budgetuser budgetapi > backup.sql
```

To restore:
```bash
docker exec -i budgetapi-db psql -U budgetuser budgetapi < backup.sql
```

## Troubleshooting

### Check Logs
In Dokploy dashboard, view logs for:
- `budgetapi` (application logs)
- `budgetapi-db` (database logs)

### Database Connection Issues
Ensure the `DATABASE_URL` environment variable is set correctly (already configured in docker-compose.yml).

### Port Conflicts
Dokploy manages external ports automatically. The internal port 3000 should not conflict with other services.

