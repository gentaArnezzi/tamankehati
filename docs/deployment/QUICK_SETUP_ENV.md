# ⚡ Quick Setup .env

Panduan cepat untuk setup `.env` file di server.

---

## 🚀 Langkah Cepat

### 1. Copy Example File

```bash
cd ~/dasmap_prod/apps/tamankehati
cp env.production.example .env
```

---

### 2. Generate Secrets

**Generate Secret Key:**
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Generate Strong Password:**
```bash
openssl rand -base64 32
```

**Copy output dari kedua command di atas.**

---

### 3. Edit .env

```bash
nano .env
```

**Update values berikut:**

```bash
# =============================================================================
# SERVER CONFIGURATION
# =============================================================================
SERVER_IP=38.47.93.167

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================
POSTGRES_DB=tamankehati_db
POSTGRES_USER=tamankehati_user
POSTGRES_PASSWORD=<PASTE_PASSWORD_DARI_OPENSSL>  # ← Paste di sini

# =============================================================================
# SECURITY
# =============================================================================
SECRET_KEY=<PASTE_SECRET_KEY_DARI_PYTHON>  # ← Paste di sini

# =============================================================================
# ADMIN USER CONFIGURATION
# =============================================================================
ADMIN_EMAIL=admin@kehati.org
ADMIN_PASSWORD=<SET_PASSWORD_ANDA>  # ← Set password admin Anda

# =============================================================================
# DOCKER REGISTRY CONFIGURATION
# =============================================================================
DOCKER_REGISTRY=docker.io
DOCKER_USERNAME=arnezzi
IMAGE_TAG=latest

# =============================================================================
# CORS CONFIGURATION
# =============================================================================
CORS_ORIGINS=http://38.47.93.167:3000,http://38.47.93.167:80,https://dasmap.co.id

# =============================================================================
# FRONTEND API URL
# =============================================================================
NEXT_PUBLIC_API_URL=http://38.47.93.167:8000

# =============================================================================
# PORT CONFIGURATION
# =============================================================================
FRONTEND_PORT=3000
BACKEND_PORT=8000

# =============================================================================
# OLLAMA CONFIGURATION (Optional)
# =============================================================================
OLLAMA_URL=http://ollama:11434
OLLAMA_MODEL=qwen2:1.5b
```

---

## 📝 Contoh .env Lengkap

```bash
# Server
SERVER_IP=38.47.93.167

# Docker
DOCKER_REGISTRY=docker.io
DOCKER_USERNAME=arnezzi
IMAGE_TAG=latest

# Database
POSTGRES_DB=tamankehati_db
POSTGRES_USER=tamankehati_user
POSTGRES_PASSWORD=K8xP2mN9vL5qR7sT3wY6zA1bC4dE8fG0h  # ← Generate dengan openssl

# Security
SECRET_KEY=AbCdEfGhIjKlMnOpQrStUvWxYz1234567890abcdefghijklmnopqrstuvwxyz  # ← Generate dengan python3

# Admin
ADMIN_EMAIL=admin@kehati.org
ADMIN_PASSWORD=YourAdminPassword123!  # ← Set password Anda

# CORS
CORS_ORIGINS=http://38.47.93.167:3000,http://38.47.93.167:80,https://dasmap.co.id

# Frontend
NEXT_PUBLIC_API_URL=http://38.47.93.167:8000

# Ports
FRONTEND_PORT=3000
BACKEND_PORT=8000

# Ollama (optional)
OLLAMA_URL=http://ollama:11434
OLLAMA_MODEL=qwen2:1.5b
```

---

## ✅ Checklist

- [ ] Copy `env.production.example` ke `.env`
- [ ] Generate `SECRET_KEY` dengan `python3`
- [ ] Generate `POSTGRES_PASSWORD` dengan `openssl`
- [ ] Set `ADMIN_PASSWORD` (password Anda sendiri)
- [ ] Update `SERVER_IP` (38.47.93.167)
- [ ] Update `CORS_ORIGINS` dengan IP server
- [ ] Update `NEXT_PUBLIC_API_URL` dengan IP server
- [ ] Save file (Ctrl+X, Y, Enter di nano)

---

## 🚀 Next Steps

Setelah `.env` selesai, lanjut ke:

1. **Setup Nginx Config**
2. **Pull Docker Images**
3. **Start Services**
4. **Run Migrations**
5. **Reload Nginx**

Lihat: `docs/DEPLOYMENT_STEPS_FINAL.md`

---

**Last Updated:** 2025-11-04

