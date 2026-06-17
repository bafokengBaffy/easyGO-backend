# Render Deployment Checklist & Verification Guide

## ✅ Status: Code pushed to GitHub
- Commit: Production hardening with middleware fixes, seeders, validators
- Branch: main
- Render should auto-deploy from linked GitHub repository

## 📋 Step-by-Step Verification

### 1. **Check Render Deployment Status**
```bash
# Visit Render dashboard: https://dashboard.render.com
# OR check via GitHub Actions/Render logs
```

**Expected log entries:**
- `npm install` ✅
- `npm run migrate` ✅  
- Build successful ✅
- Deployment live ✅

### 2. **Run Migrations on Render** (if not automatic)
```bash
# SSH into Render service and run:
npm run migrate

# Or via Render deploy hook (should be automatic)
```

**Verify migrations ran:**
- Check PostgreSQL tables exist
- Validate schema created

### 3. **Seed Database** (initial data)
```bash
npm run seed:all

# Or individual seeds:
npm run seed:users      # 25 users (admin, support, riders, drivers)
npm run seed:drivers    # Drivers + vehicles  
npm run seed:rides      # Rides + payments with realistic data
```

**Verify data:**
```sql
SELECT COUNT(*) FROM "Users";         -- Should be 25+
SELECT COUNT(*) FROM "Drivers";       -- Should be drivers
SELECT COUNT(*) FROM "Rides";         -- Should be rides
SELECT COUNT(*) FROM "Payments";      -- Should be payments
```

### 4. **Test Health Endpoints** (verify API alive)

```bash
# Liveness probe
curl https://YOUR_RENDER_URL/health/live

# Readiness probe (checks DB & Redis)
curl https://YOUR_RENDER_URL/health/ready

# Full health
curl https://YOUR_RENDER_URL/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-06-17T...",
  "uptime": 123.45,
  "environment": "production",
  "version": "2.0.0"
}
```

### 5. **Test Core Endpoints**

#### Register User
```bash
curl -X POST https://YOUR_RENDER_URL/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!",
    "name": "Test User",
    "phone": "+1234567890"
  }'
```

#### Login
```bash
curl -X POST https://YOUR_RENDER_URL/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!"
  }'
```

#### Get Profile (with token)
```bash
curl -X GET https://YOUR_RENDER_URL/api/v1/users/profile \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### 6. **Verify Environment Variables**

**On Render Dashboard**, check these are set:
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - `production`
- `JWT_SECRET` - Secret key for tokens
- `REDIS_URL` - Redis connection (if applicable)
- `LOG_LEVEL` - `info` or `debug`

### 7. **Monitor Logs**

**Render Dashboard → Logs**

Look for:
- ✅ Server listening on port (default: 3000 or Render PORT)
- ✅ Database connection successful
- ✅ No errors on startup
- ⚠️ Rate limiting, cache issues (warnings ok)

### 8. **Performance Check**

```bash
# Response time check
time curl https://YOUR_RENDER_URL/api/v1/auth/login

# Load test (basic)
for i in {1..10}; do
  curl -s https://YOUR_RENDER_URL/health/live &
done
```

**Target:** < 200ms response time

### 9. **Database Connection Verification**

```bash
# Via psql (if you have access to Render PostgreSQL)
psql postgresql://user:pass@host/dbname

# Check migrations applied
SELECT * FROM "SequelizeMeta";

# Check seeded data
SELECT * FROM "Users" LIMIT 5;
```

## 🚨 Troubleshooting

### Issue: 502 Bad Gateway
- Check Render logs for crashes
- Verify DATABASE_URL is correct
- Check migrations ran successfully

### Issue: 503 Service Unavailable
- Database down or unreachable
- Check readiness probe
- Verify PostgreSQL connection string

### Issue: Database Connection Refused
- Check DATABASE_URL environment variable
- Verify PostgreSQL on Render is running
- Check firewall/security groups

### Issue: Migrations Failed
```bash
# Reset migrations (warning: deletes all data)
npm run migrate:undo:all

# Re-run migrations
npm run migrate
```

## 📊 Success Criteria

- ✅ Render deployment shows green "Active"
- ✅ All health endpoints return 200 status
- ✅ Database has users/drivers/rides data
- ✅ JWT authentication works
- ✅ Response times < 500ms
- ✅ Logs show no error streams

## 🔄 Next Actions After Verification

1. **If issues found:** Debug using Render logs + database queries
2. **If working:** Proceed to integration testing
3. **Monitor:** Set up Render alerts for errors/uptime

---

## Quick Reference

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/health` | GET | ❌ | Full health check |
| `/health/live` | GET | ❌ | Liveness probe |
| `/health/ready` | GET | ❌ | Readiness probe |
| `/api/v1/auth/register` | POST | ❌ | Create user |
| `/api/v1/auth/login` | POST | ❌ | Authenticate |
| `/api/v1/users/profile` | GET | ✅ | Get user profile |
| `/api/v1/users/profile` | PUT | ✅ | Update profile |
| `/metrics` | GET | ❌ | Prometheus metrics |

