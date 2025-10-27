# ✅ Railway PostgreSQL Deployment - COMPLETE!

## 🎉 Database Successfully Deployed!

Railway PostgreSQL database sudah berhasil di-setup dengan semua tables dan data initial!

---

## 📊 Database Summary

### **Connection Details**:
```
Host:     maglev.proxy.rlwy.net
Port:     26951
Database: railway
User:     postgres
Password: wHGvcsZIyxRQaJmpkqRfFnwheFUlZfUz
```

### **Connection String**:
```bash
# For psycopg2 (sync)
postgresql://postgres:wHGvcsZIyxRQaJmpkqRfFnwheFUlZfUz@maglev.proxy.rlwy.net:26951/railway

# For asyncpg (async)
postgresql+asyncpg://postgres:wHGvcsZIyxRQaJmpkqRfFnwheFUlZfUz@maglev.proxy.rlwy.net:26951/railway
```

---

## 📦 What Was Deployed

### **1. Database Tables** ✅

| Table | Status | Description |
|-------|--------|-------------|
| `users` | ✅ Created | User accounts with roles |
| `regions` | ✅ Created | 38 Indonesian provinces |
| `parks` | ✅ Created | Taman Kehati parks |
| `flora` | ✅ Created | Flora species data |
| `fauna` | ✅ Created | Fauna species data |
| `activities` | ✅ Created | Park activities |
| `articles` | ✅ Created | News articles |
| `galleries` | ✅ Created | Image galleries |

### **2. Initial Data** ✅

#### **Users (3 accounts)**:
```
✅ admin@kehati.org (Super Admin)
   Password: password
   
✅ kaltim.admin@kehati.org (Regional Admin KALTIM)
   Password: password
   
✅ sumut.admin@kehati.org (Regional Admin SUMUT)
   Password: password
```

#### **Regions (38 provinces)**:
```
✅ Sumatera (10): ACEH, SUMUT, SUMBAR, RIAU, KEPRI, JAMBI, SUMSEL, BENGKULU, LAMPUNG, BABEL
✅ Jawa (6): DKI, JABAR, BANTEN, JATENG, YOGYA, JATIM
✅ Kalimantan (5): KALBAR, KALTENG, KALSEL, KALTIM, KALTARA
✅ Sulawesi (6): SULUT, SULTENG, SULSEL, SULTRA, GORONTALO, SULBAR
✅ Bali & Nusa Tenggara (3): BALI, NTB, NTT
✅ Maluku (2): MALUKU, MALUT
✅ Papua (6): PAPUA, PAPBAR, PAPTENG, PAPSEL, PAPPEG, PAPBARDAYA
```

### **3. Database Stats**:
```
Users:      3
Regions:    38
Parks:      0 (empty - ready for submissions)
Flora:      0 (empty - ready for submissions)
Fauna:      0 (empty - ready for submissions)
Activities: 0 (empty - ready for submissions)
Articles:   0 (empty - ready for submissions)
Galleries:  0 (empty - ready for submissions)
```

---

## 🔧 Backend Configuration

### **Step 1: Update Environment Variables**

Copy `railway.env` to `apps/backend/.env`:

```bash
cd apps/backend
cp ../../railway.env .env
```

Or manually update `.env`:

```bash
# Database Configuration
DATABASE_URL=postgresql+asyncpg://postgres:wHGvcsZIyxRQaJmpkqRfFnwheFUlZfUz@maglev.proxy.rlwy.net:26951/railway
DATABASE_URL_SYNC=postgresql://postgres:wHGvcsZIyxRQaJmpkqRfFnwheFUlZfUz@maglev.proxy.rlwy.net:26951/railway

# JWT / Authentication
SECRET_KEY=your-super-secret-key-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALGORITHM=HS256

# CORS Configuration (update with your frontend URL)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,https://your-frontend-domain.com

# Production Settings
DEBUG=false
RELOAD=false
HOST=0.0.0.0
PORT=8000
```

### **Step 2: Test Backend Connection**

```bash
cd apps/backend
source venv/bin/activate
python3 -c "
from core.database.engine import engine
import asyncio

async def test():
    async with engine.begin() as conn:
        result = await conn.execute('SELECT COUNT(*) FROM users')
        print(f'✅ Connected! Users: {result.scalar()}')

asyncio.run(test())
"
```

### **Step 3: Start Backend**

```bash
cd apps/backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## 🎨 Frontend Configuration

### **Update API Base URL**

Edit `apps/frontend/src/lib/api-client.ts`:

```typescript
// For local development with Railway DB
const API_BASE_URL = 'http://localhost:8000';

// For production
// const API_BASE_URL = 'https://your-backend-domain.com';
```

---

## 🧪 Testing

### **Test 1: Database Connection**

```bash
psql "postgresql://postgres:wHGvcsZIyxRQaJmpkqRfFnwheFUlZfUz@maglev.proxy.rlwy.net:26951/railway" -c "SELECT version();"
```

Expected output:
```
PostgreSQL 17.6 (Debian 17.6-2.pgdg13+1)
```

### **Test 2: Verify Users**

```bash
psql "postgresql://postgres:wHGvcsZIyxRQaJmpkqRfFnwheFUlZfUz@maglev.proxy.rlwy.net:26951/railway" -c "SELECT id, email, role FROM users;"
```

Expected output:
```
 id |          email          |      role      
----+-------------------------+----------------
  1 | admin@kehati.org        | super_admin
  2 | kaltim.admin@kehati.org | regional_admin
  3 | sumut.admin@kehati.org  | regional_admin
```

### **Test 3: Verify Regions**

```bash
psql "postgresql://postgres:wHGvcsZIyxRQaJmpkqRfFnwheFUlZfUz@maglev.proxy.rlwy.net:26951/railway" -c "SELECT COUNT(*) as total_provinces FROM regions;"
```

Expected output:
```
 total_provinces 
-----------------
              38
```

### **Test 4: Login via API**

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kehati.org","password":"password"}' | python3 -m json.tool
```

Expected output:
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "admin@kehati.org",
    "role": "super_admin"
  }
}
```

---

## 🚀 Deployment to Production

### **Option 1: Deploy to Railway**

1. **Create Railway Project**:
   ```bash
   railway init
   ```

2. **Link Database**:
   - Database is already on Railway ✅
   - Just need to deploy backend service

3. **Deploy Backend**:
   ```bash
   cd apps/backend
   railway up
   ```

4. **Set Environment Variables** in Railway Dashboard:
   ```
   DATABASE_URL=postgresql+asyncpg://postgres:...@maglev.proxy.rlwy.net:26951/railway
   SECRET_KEY=your-production-secret-key
   ALLOWED_ORIGINS=https://your-frontend-domain.com
   ```

### **Option 2: Deploy to Render**

1. **Create New Web Service** on Render

2. **Connect GitHub Repo**

3. **Set Build Command**:
   ```bash
   cd apps/backend && pip install -r requirements.txt
   ```

4. **Set Start Command**:
   ```bash
   cd apps/backend && uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

5. **Set Environment Variables**:
   ```
   DATABASE_URL=postgresql+asyncpg://postgres:...@maglev.proxy.rlwy.net:26951/railway
   SECRET_KEY=your-production-secret-key
   ALLOWED_ORIGINS=https://your-frontend-domain.com
   ```

### **Option 3: Deploy to Vercel (Frontend)**

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy Frontend**:
   ```bash
   cd apps/frontend
   vercel
   ```

3. **Set Environment Variables** in Vercel Dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-domain.com
   ```

---

## 🔒 Security Checklist

### **Before Production**:

- [ ] Change `SECRET_KEY` to a random 32+ character string
- [ ] Update `ALLOWED_ORIGINS` with your actual frontend domain
- [ ] Change default passwords for all users
- [ ] Enable SSL/TLS for database connection
- [ ] Set `DEBUG=false` in production
- [ ] Review and update CORS settings
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging
- [ ] Backup database regularly

### **Generate Secure SECRET_KEY**:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

Example output:
```
xK9mP2nQ4rS6tU8vW0yZ1aB3cD5eF7gH9iJ0kL2mN4oP6qR8sT0uV2wX4yZ6aB8c
```

---

## 📝 Database Maintenance

### **Backup Database**:

```bash
pg_dump "postgresql://postgres:wHGvcsZIyxRQaJmpkqRfFnwheFUlZfUz@maglev.proxy.rlwy.net:26951/railway" > backup_$(date +%Y%m%d).sql
```

### **Restore Database**:

```bash
psql "postgresql://postgres:wHGvcsZIyxRQaJmpkqRfFnwheFUlZfUz@maglev.proxy.rlwy.net:26951/railway" < backup_20251025.sql
```

### **Monitor Database Size**:

```bash
psql "postgresql://postgres:wHGvcsZIyxRQaJmpkqRfFnwheFUlZfUz@maglev.proxy.rlwy.net:26951/railway" -c "
SELECT 
    pg_size_pretty(pg_database_size('railway')) as database_size;
"
```

### **View Active Connections**:

```bash
psql "postgresql://postgres:wHGvcsZIyxRQaJmpkqRfFnwheFUlZfUz@maglev.proxy.rlwy.net:26951/railway" -c "
SELECT COUNT(*) as active_connections 
FROM pg_stat_activity 
WHERE datname = 'railway';
"
```

---

## 🐛 Troubleshooting

### **Issue: Cannot connect to database**

**Solution**:
```bash
# Test connection
psql "postgresql://postgres:wHGvcsZIyxRQaJmpkqRfFnwheFUlZfUz@maglev.proxy.rlwy.net:26951/railway" -c "SELECT 1;"

# Check if Railway database is online
# Go to Railway Dashboard → Database → Check status
```

### **Issue: Backend can't connect**

**Solution**:
```bash
# Check DATABASE_URL in .env
cat apps/backend/.env | grep DATABASE_URL

# Test connection from Python
cd apps/backend
python3 -c "import asyncpg; import asyncio; asyncio.run(asyncpg.connect('postgresql://postgres:wHGvcsZIyxRQaJmpkqRfFnwheFUlZfUz@maglev.proxy.rlwy.net:26951/railway'))"
```

### **Issue: Login fails**

**Solution**:
```bash
# Verify users exist
psql "postgresql://postgres:wHGvcsZIyxRQaJmpkqRfFnwheFUlZfUz@maglev.proxy.rlwy.net:26951/railway" -c "SELECT email, role FROM users;"

# Test password hash
# Default password is "password" with bcrypt hash
```

---

## ✅ Deployment Checklist

### **Database** ✅
- [x] Railway PostgreSQL created
- [x] Tables created (8 tables)
- [x] Initial data seeded (3 users, 38 regions)
- [x] Connection tested
- [x] Schema verified

### **Backend** (Next Steps)
- [ ] Update `.env` with Railway database URL
- [ ] Test local connection to Railway DB
- [ ] Deploy backend to Railway/Render
- [ ] Update CORS settings
- [ ] Change SECRET_KEY
- [ ] Test API endpoints

### **Frontend** (Next Steps)
- [ ] Update API base URL
- [ ] Deploy to Vercel/Netlify
- [ ] Test login flow
- [ ] Test data submission
- [ ] Verify regional admin filtering

---

## 📞 Support

### **Railway Dashboard**:
https://railway.app/dashboard

### **Database Connection String**:
```
postgresql://postgres:wHGvcsZIyxRQaJmpkqRfFnwheFUlZfUz@maglev.proxy.rlwy.net:26951/railway
```

### **Login Credentials**:
```
Admin:  admin@kehati.org / password
KALTIM: kaltim.admin@kehati.org / password
SUMUT:  sumut.admin@kehati.org / password
```

---

## 🎉 Summary

### **What's Done** ✅:
- ✅ Railway PostgreSQL database created
- ✅ 8 tables created (users, regions, parks, flora, fauna, activities, articles, galleries)
- ✅ 3 users seeded (admin, kaltim.admin, sumut.admin)
- ✅ 38 Indonesian provinces seeded
- ✅ Database connection tested and verified
- ✅ Configuration files created (`railway.env`, `setup_railway_simple.sql`)

### **Next Steps** 🚀:
1. Update `apps/backend/.env` with Railway database URL
2. Test backend connection to Railway DB
3. Deploy backend to Railway/Render
4. Deploy frontend to Vercel/Netlify
5. Update CORS and SECRET_KEY for production
6. Test full application flow

---

**Status**: ✅ **RAILWAY DATABASE DEPLOYED!**

**Date**: 2025-10-25  
**Database**: Railway PostgreSQL  
**Host**: maglev.proxy.rlwy.net:26951  
**Ready**: ✅ For backend connection and deployment!

