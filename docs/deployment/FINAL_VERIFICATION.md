# Final Verification Checklist

## ✅ Status Saat Ini

### Container Status
- ✅ **Frontend**: Running & Healthy (port 3000)
- ✅ **Backend**: Running & Healthy (port 8000)
- ✅ **PostgreSQL**: Running & Healthy
- ✅ **Redis**: Running & Healthy
- ⚠️ **Ollama**: Running but Unhealthy (non-critical untuk deployment utama)

### Nginx Routing
- ✅ Port 8080: Active (Nginx listening)
- ✅ Frontend accessible: `http://38.47.93.167:8080`
- ✅ HTML response: Valid Next.js app content

## 🧪 Verification Tests

### 1. Test Backend Health
```bash
curl http://38.47.93.167:8080/api/health
# atau
curl http://38.47.93.167:8080/health
```

Expected: JSON response with status

### 2. Test Backend API Direct
```bash
curl http://38.47.93.167:8000/health
```

Expected: Backend health check response

### 3. Test Frontend in Browser
1. Buka browser: `http://38.47.93.167:8080`
2. Buka Developer Console (F12)
3. Check Network tab untuk API calls
4. Verify no `ERR_CONNECTION_REFUSED` errors

### 4. Test API Endpoint from Frontend
```bash
# Test dari browser console atau curl
curl http://38.47.93.167:8080/api/flora?limit=5
```

Expected: JSON data dari backend

### 5. Check Frontend Logs
```bash
docker logs tamankehati-frontend-prod --tail 50
```

Look for:
- ✅ No `sharp` errors
- ✅ No `ECONNREFUSED` errors
- ✅ Ready in XXXms

### 6. Check Backend Logs
```bash
docker logs tamankehati-backend-prod --tail 50
```

Look for:
- ✅ Database migrations successful
- ✅ Gunicorn started
- ✅ No connection errors

## 🔍 Common Issues to Check

### Issue 1: Frontend can't reach backend
**Symptom**: Browser console shows `ERR_CONNECTION_REFUSED` to `localhost:8000`

**Cause**: `NEXT_PUBLIC_API_URL` not set correctly during build

**Fix**: Rebuild frontend with correct `NEXT_PUBLIC_API_URL`:
```bash
export DOCKER_USERNAME=arnezzi
export IMAGE_TAG=v1.0.5
export NEXT_PUBLIC_API_URL=http://38.47.93.167:8080
./scripts/build-and-push-images.sh
```

### Issue 2: Nginx routing to wrong app
**Symptom**: Port 8080 shows Vue.js app instead of Taman Kehati

**Fix**: Check Nginx config priority:
```bash
docker exec -it dasmap_prod-go-1 nginx -t
docker exec -it dasmap_prod-go-1 cat /etc/nginx/sites-enabled/tamankehati.conf | grep listen
```

Should show: `listen 8080;`

### Issue 3: API returns 405 Method Not Allowed
**Symptom**: `curl -I` returns 405

**Cause**: HEAD request not supported by some endpoints

**Fix**: Use `curl` without `-I` flag or test in browser

## ✅ Success Criteria

1. ✅ Frontend accessible at `http://38.47.93.167:8080`
2. ✅ Backend health check responds: `http://38.47.93.167:8080/api/health`
3. ✅ No errors in browser console
4. ✅ API calls from frontend work correctly
5. ✅ All containers healthy (except Ollama if not needed)

## 📝 Next Steps

Jika semua test pass:
1. ✅ Deployment successful!
2. Test fitur utama: login, CRUD, upload
3. Monitor logs untuk 24 jam pertama
4. Setup monitoring/alerting (optional)

