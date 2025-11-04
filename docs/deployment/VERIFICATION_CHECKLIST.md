# ✅ Deployment Verification Checklist

Checklist untuk memastikan semua services berjalan dengan benar setelah deployment.

---

## 🐳 Container Status

**Check semua containers running:**
```bash
docker compose -f docker-compose.pull.no-nginx.yml ps
```

**Expected output:**
- ✅ `tamankehati-postgres-prod` - Up (healthy)
- ✅ `tamankehati-redis-prod` - Up (healthy)
- ✅ `tamankehati-backend-prod` - Up (healthy)
- ✅ `tamankehati-frontend-prod` - Up (healthy)
- ✅ `tamankehati-ollama-prod` - Up (running)

**Jika ada yang tidak healthy:**
```bash
# Check logs
docker compose -f docker-compose.pull.no-nginx.yml logs <service-name> --tail=50
```

---

## 🏥 Health Checks

### 1. Backend Health (Direct)

```bash
curl http://localhost:8000/health
# Expected: {"status": "ok"}
```

### 2. Backend Health (Via Nginx)

```bash
curl http://38.47.93.167:8080/health
curl http://38.47.93.167:8080/api/health
# Expected: {"status": "ok"}
```

### 3. Frontend Health

```bash
curl -I http://38.47.93.167:8080
# Expected: HTTP/1.1 200 OK
```

---

## 🌐 API Endpoints

### 1. Public Stats

```bash
curl http://38.47.93.167:8080/api/public/stats/
# Expected: JSON dengan stats data
```

### 2. Public Parks

```bash
curl http://38.47.93.167:8080/api/public/parks?limit=1
# Expected: JSON dengan parks data
```

### 3. Public Flora

```bash
curl http://38.47.93.167:8080/api/public/flora?limit=1
# Expected: JSON dengan flora data
```

---

## 🔍 Detailed Checks

### Check Container Logs

```bash
# Backend logs
docker compose -f docker-compose.pull.no-nginx.yml logs backend --tail=50

# Frontend logs
docker compose -f docker-compose.pull.no-nginx.yml logs frontend --tail=50

# Database logs
docker compose -f docker-compose.pull.no-nginx.yml logs postgres --tail=50
```

**Look for:**
- ✅ No errors
- ✅ Services started successfully
- ✅ Database migrations completed
- ✅ Admin user initialized

### Check Network Connectivity

```bash
# Backend can reach database
docker exec tamankehati-backend-prod ping -c 1 postgres

# Backend can reach redis
docker exec tamankehati-backend-prod ping -c 1 redis

# Frontend can reach backend (via API URL)
docker exec tamankehati-frontend-prod env | grep NEXT_PUBLIC_API_URL
```

### Check Nginx Configuration

```bash
# Test Nginx config
docker exec -it dasmap_prod-go-1 nginx -t

# Check if tamankehati.conf is loaded
docker exec -it dasmap_prod-go-1 cat /etc/nginx/sites-enabled/tamankehati.conf | head -20
```

---

## 🌍 Browser Testing

### 1. Open Frontend

Buka browser: `http://38.47.93.167:8080`

**Check:**
- ✅ Homepage loads
- ✅ No console errors
- ✅ No `ERR_CONNECTION_REFUSED` errors
- ✅ API calls successful (check Network tab)

### 2. Test Features

- ✅ Homepage loads
- ✅ Flora page loads
- ✅ Fauna page loads
- ✅ Taman page loads
- ✅ Images load correctly
- ✅ Search works

### 3. Check Browser Console

**Open Developer Tools (F12):**
- ✅ No red errors
- ✅ No `ERR_CONNECTION_REFUSED`
- ✅ API calls return 200 OK
- ✅ All resources loaded

---

## 🔐 Security Checks

### 1. CORS Configuration

```bash
# Test CORS headers
curl -H "Origin: http://38.47.93.167:8080" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     http://38.47.93.167:8080/api/public/stats/
```

**Expected:** CORS headers present

### 2. Environment Variables

```bash
# Check sensitive vars not exposed
docker exec tamankehati-backend-prod env | grep SECRET
docker exec tamankehati-backend-prod env | grep PASSWORD
```

**Should:** Only show in container, not exposed externally

---

## 📊 Database Verification

### 1. Database Connection

```bash
# Test database connection
docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "SELECT version();"
```

### 2. Check Migrations

```bash
# Check if migrations applied
docker compose -f docker-compose.pull.no-nginx.yml exec backend alembic current
```

### 3. Check Tables

```bash
# List tables
docker exec tamankehati-postgres-prod psql -U kehati_user -d kehati_db -c "\dt"
```

---

## 🚨 Common Issues & Fixes

### Issue: Frontend ERR_CONNECTION_REFUSED

**Symptom:** Browser console shows `ERR_CONNECTION_REFUSED` to `localhost:8000`

**Fix:**
1. Rebuild frontend with correct `NEXT_PUBLIC_API_URL`
2. Pull new image
3. Restart frontend

### Issue: Backend Can't Connect to Database

**Symptom:** Backend logs show database connection errors

**Fix:**
1. Check database container is healthy
2. Verify `DATABASE_URL` in `.env`
3. Check network connectivity

### Issue: Nginx 405 Method Not Allowed

**Symptom:** `/api/health` returns 405

**Fix:**
1. Update Nginx config to proxy `/api/health` to `/health`
2. Reload Nginx

### Issue: Container Exits Immediately

**Symptom:** Container status shows "Exited"

**Fix:**
1. Check logs: `docker logs <container-name>`
2. Check environment variables
3. Check port conflicts

---

## ✅ Final Verification

### Quick Test Script

```bash
#!/bin/bash
echo "🔍 Quick Verification..."

# Containers
echo "📦 Containers:"
docker ps | grep tamankehati | wc -l
echo "Expected: 5"

# Health
echo "🏥 Health:"
curl -s http://38.47.93.167:8080/api/health | grep -q "ok" && echo "✅ Backend OK" || echo "❌ Backend Failed"

# Frontend
echo "🌐 Frontend:"
curl -s -I http://38.47.93.167:8080 | grep -q "200" && echo "✅ Frontend OK" || echo "❌ Frontend Failed"

# API
echo "📡 API:"
curl -s http://38.47.93.167:8080/api/public/stats/ | grep -q "total" && echo "✅ API OK" || echo "❌ API Failed"

echo ""
echo "✅ Verification complete!"
```

---

## 📝 Verification Report

After verification, document:

- [ ] All containers running and healthy
- [ ] Health endpoints responding
- [ ] API endpoints working
- [ ] Frontend accessible
- [ ] No console errors in browser
- [ ] Database connected
- [ ] Nginx routing correctly
- [ ] CORS configured
- [ ] Environment variables set correctly
- [ ] Logs show no critical errors

---

## 🎯 Success Criteria

Deployment is successful if:

1. ✅ All 5 containers running and healthy
2. ✅ Health endpoints return 200 OK
3. ✅ Frontend accessible at `http://38.47.93.167:8080`
4. ✅ API endpoints return valid JSON
5. ✅ No errors in browser console
6. ✅ Database migrations applied
7. ✅ Nginx routing works correctly

---

**Last Updated:** 2025-11-05

