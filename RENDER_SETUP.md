# Setting Up PostgreSQL on Render and Connecting EasyGO Backend

## 📋 Prerequisites
- Render account (https://render.com)
- Git installed
- Node.js 16+ installed
- EasyGO Backend code

## 🔧 Step-by-Step Setup

### 1. Create PostgreSQL Database on Render

#### Go to Render Dashboard
1. Visit https://dashboard.render.com/
2. Click **"New +"** button
3. Select **"PostgreSQL"**

#### Configure Database
```
Name: easygo-db
Database: easygo_prod
User: easygo_user
Region: [Select your region]
PostgreSQL Version: 15
```

#### Copy Connection Details
After creation, you'll see:
- **Internal Database URL** (for internal connections)
- **External Database URL** (for external connections)

Example format:
```
postgresql://easygo_user:PASSWORD@your-host:5432/easygo_prod
```

**Save these securely!**

### 2. Configure Environment Variables

#### Create `.env` file in web-backend directory

```env
# ==================== APP CONFIG ====================
NODE_ENV=production
PORT=4000
HOST=0.0.0.0
API_VERSION=v1
APP_NAME=EasyGO Backend
APP_BASE_URL=https://your-domain.com

# ==================== DATABASE CONFIG ====================
DATABASE_URL=postgresql://easygo_user:YOUR_PASSWORD@your-host:5432/easygo_prod
DB_DIALECT=postgres
DB_HOST=your-host
DB_PORT=5432
DB_USER=easygo_user
DB_PASSWORD=YOUR_PASSWORD
DB_NAME=easygo_prod

# SSL Configuration (Required for Render)
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false

# Connection Pool
DB_POOL_MAX=20
DB_POOL_MIN=2
DB_POOL_IDLE=10000
DB_POOL_ACQUIRE=30000

# ==================== JWT CONFIG ====================
JWT_SECRET=your-very-long-random-secret-key-minimum-32-characters
JWT_EXPIRY=7d
JWT_REFRESH_SECRET=your-very-long-refresh-secret-key
JWT_REFRESH_EXPIRY=30d

# ==================== REDIS CONFIG ====================
REDIS_URL=redis://default:YOUR_PASSWORD@your-redis-host:6379
REDIS_PASSWORD=YOUR_PASSWORD
REDIS_PORT=6379
REDIS_DB=0

# ==================== EMAIL CONFIG ====================
SENDGRID_API_KEY=SG.your_sendgrid_key
SENDER_EMAIL=noreply@easygo.local

# ==================== PAYMENT CONFIG ====================
STRIPE_API_KEY=sk_live_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# ==================== FIREBASE CONFIG ====================
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com

# ==================== LOGGING ====================
LOG_LEVEL=info
LOG_DIR=./logs

# ==================== SECURITY ====================
CORS_ORIGIN=https://your-frontend-domain.com
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Test Database Connection Locally

```bash
# Install dependencies
npm install

# Test connection
npm run env:check

# Should output: ✅ Database connection established successfully
```

### 4. Run Migrations

```bash
# Run database migrations
npm run migrate

# Seed database with sample data
npm run seed:all
```

**Output:**
```
✨ DATABASE SEEDING COMPLETED SUCCESSFULLY
📊 Database Status:
  ✅ Users seeded (24 records)
  ✅ Drivers & Vehicles seeded (15+ records)
  ✅ Rides & Payments seeded (50 rides, 40 payments)
```

### 5. Verify Database Population

```bash
# Connect to Render PostgreSQL to verify
psql postgresql://easygo_user:PASSWORD@your-host:5432/easygo_prod

# Query tables
SELECT COUNT(*) as user_count FROM "Users";
SELECT COUNT(*) as driver_count FROM "Drivers";
SELECT COUNT(*) as ride_count FROM "Rides";
SELECT COUNT(*) as payment_count FROM "Payments";
```

Expected output:
```
user_count: 24
driver_count: 10
ride_count: 50
payment_count: 40
```

### 6. Deploy to Render Web Service

#### Create Web Service on Render
1. Go to Dashboard → **New +"
2. Select **"Web Service"**
3. Connect your GitHub repository

#### Configure Service
```
Name: easygo-backend
Environment: Node
Build Command: npm install
Start Command: npm start
Region: [Your region]
Plan: [Select appropriate]
```

#### Add Environment Variables
Copy all variables from your `.env` file to Render's environment variables section.

#### Deploy
Click **"Deploy"** and wait for build completion.

### 7. Verify Deployment

```bash
# Test health endpoint
curl https://your-easygo-backend.onrender.com/health

# Response should be:
{
  "status": "UP",
  "timestamp": "2026-06-17T10:00:00Z",
  "uptime": 123.456
}

# Test API
curl https://your-easygo-backend.onrender.com/api/v1/health

# Should return detailed health info with database connection status
```

## 🔑 Test Credentials

Use these for testing after seeding:

```
Admin Account:
  Email: admin@easygo.local
  Password: AdminPassword123!

Rider Account:
  Email: rider1@easygo.local
  Password: RiderPass123!

Driver Account:
  Email: driver1@easygo.local
  Password: DriverPass123!
```

## 📊 Database Management

### View Data on Render

#### Option 1: Using psql Command Line
```bash
# Connect to Render PostgreSQL
psql postgresql://easygo_user:PASSWORD@your-host:5432/easygo_prod

# Common queries
\dt                              # List all tables
SELECT * FROM "Users" LIMIT 5;  # View users
SELECT * FROM "Drivers" LIMIT 5; # View drivers
SELECT * FROM "Rides" LIMIT 5;   # View rides
```

#### Option 2: Using DBeaver (GUI)
1. Download DBeaver Community Edition
2. Create new PostgreSQL connection
3. Enter Render connection details
4. Browse tables visually

### Backup Database

```bash
# Create backup
pg_dump postgresql://easygo_user:PASSWORD@your-host:5432/easygo_prod > backup.sql

# Restore from backup
psql postgresql://easygo_user:PASSWORD@your-host:5432/easygo_prod < backup.sql
```

### Troubleshooting

#### Connection Refused
```bash
# Verify connection string
echo $DATABASE_URL

# Check if host is reachable
ping your-host

# Verify firewall settings in Render
```

#### SSL Certificate Error
```env
# In .env, set:
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
```

#### Seeding Failed
```bash
# Check logs
cat logs/error.log

# Verify database user permissions
# Ensure user can CREATE/DROP tables and insert data
```

#### Migration Issues
```bash
# Check migration status
npm run migrate -- --status

# Rollback last migration
npm run migrate:undo

# Re-run migrations
npm run migrate
```

## 🚀 Quick Start Commands

```bash
# Complete setup (install, migrate, seed, test)
./setup-and-test.sh  # Linux/Mac
./setup-and-test.ps1 # Windows

# Or individual commands
npm install                    # Install deps
npm run env:check             # Test connection
npm run migrate               # Run migrations
npm run seed:all              # Populate database
npm run dev                   # Start dev server
npm test                      # Run tests

# Database management
npm run db:reset              # Reset entire database
npm run seed:users            # Reseed users only
npm run seed:drivers          # Reseed drivers
npm run seed:rides            # Reseed rides
```

## 📈 Monitoring

### Render Dashboard
- View logs: **Logs** tab
- Check metrics: **Analytics** tab
- Monitor deployment: **Deployments** tab

### Application Logs
```bash
# Real-time logs on Render
# In Render dashboard → Logs tab

# Local development
npm run dev
# Logs will show in terminal
```

### Metrics
```bash
# Access metrics endpoint
curl https://your-easygo-backend.onrender.com/metrics

# Prometheus format output
```

## 🔐 Security Notes

1. **Never commit `.env` file** to git
2. **Use strong passwords** for database users
3. **Enable SSL** for all database connections
4. **Rotate API keys** regularly
5. **Use environment variables** for all secrets
6. **Enable CORS** only for your frontend domain
7. **Use HTTPS** in production
8. **Regular backups** of production database

## 📞 Support Resources

- **Render Documentation**: https://render.com/docs
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Node.js Best Practices**: https://nodejs.org/en/docs/
- **EasyGO Development**: See ENHANCEMENTS.md

## ✅ Verification Checklist

- [ ] PostgreSQL database created on Render
- [ ] Connection string obtained and verified
- [ ] `.env` file configured with all credentials
- [ ] Local `npm run env:check` passes
- [ ] Migrations run successfully
- [ ] Database seeded with sample data
- [ ] Test credentials working
- [ ] API endpoints responding correctly
- [ ] Health check returning UP status
- [ ] Logs showing normal operation
- [ ] Render Web Service deployed
- [ ] Production endpoints responding

## 🎉 You're Ready!

Your EasyGO Backend is now running with a production PostgreSQL database on Render!

**Next Steps:**
1. Connect your frontend to the API endpoints
2. Test critical workflows
3. Set up monitoring and alerts
4. Configure backup schedule
5. Plan capacity scaling

---

**Last Updated**: 2026-06-17
**Status**: ✅ Complete Setup Guide
