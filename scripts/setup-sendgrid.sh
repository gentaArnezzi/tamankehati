#!/bin/bash
# Setup SendGrid SMTP Configuration
# This script helps you configure SendGrid for OTP email delivery

echo "📧 SendGrid SMTP Setup"
echo "======================"
echo ""

# Check if .env exists
ENV_FILE="apps/backend/.env"
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ File $ENV_FILE tidak ditemukan!"
    echo "   Buat file .env terlebih dahulu"
    exit 1
fi

echo "📝 File .env ditemukan: $ENV_FILE"
echo ""

# Check existing SendGrid config
if grep -q "SMTP_HOST.*sendgrid" "$ENV_FILE"; then
    echo "⚠️  SendGrid configuration sudah ada di .env"
    echo ""
    echo "Current SendGrid settings:"
    grep "SMTP_" "$ENV_FILE" | grep -v "^#" || echo "   (tidak ada)"
    echo ""
    read -p "Apakah Anda ingin mengupdate? (y/n): " update_choice
    if [ "$update_choice" != "y" ] && [ "$update_choice" != "Y" ]; then
        echo "✅ Setup dibatalkan"
        exit 0
    fi
fi

echo ""
echo "📋 SendGrid Setup Instructions:"
echo ""
echo "1. Daftar SendGrid (jika belum):"
echo "   https://signup.sendgrid.com/"
echo ""
echo "2. Verifikasi Sender Email:"
echo "   - Buka: Settings → Sender Authentication → Single Sender Verification"
echo "   - Create a Sender dengan email yang akan digunakan"
echo "   - Verifikasi email yang dikirim"
echo ""
echo "3. Buat API Key:"
echo "   - Buka: Settings → API Keys"
echo "   - Create API Key dengan permission 'Mail Send'"
echo "   - Copy API Key (hanya muncul sekali!)"
echo ""
echo "=========================================="
echo ""

# Get SendGrid API Key
read -p "Masukkan SendGrid API Key (SG.xxxxx...): " sendgrid_api_key
if [ -z "$sendgrid_api_key" ]; then
    echo "❌ API Key tidak boleh kosong!"
    exit 1
fi

# Validate API Key format
if [[ ! "$sendgrid_api_key" =~ ^SG\.[A-Za-z0-9_-]+$ ]]; then
    echo "⚠️  Warning: API Key format mungkin tidak benar"
    echo "   Format yang benar: SG.xxxxxxxxxxxxxxxx..."
    read -p "Lanjutkan anyway? (y/n): " continue_choice
    if [ "$continue_choice" != "y" ] && [ "$continue_choice" != "Y" ]; then
        echo "✅ Setup dibatalkan"
        exit 0
    fi
fi

# Get verified sender email
read -p "Masukkan Verified Sender Email (yang sudah diverifikasi di SendGrid): " sendgrid_from
if [ -z "$sendgrid_from" ]; then
    echo "❌ Sender Email tidak boleh kosong!"
    exit 1
fi

# Validate email format
if [[ ! "$sendgrid_from" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
    echo "⚠️  Warning: Email format mungkin tidak benar"
    read -p "Lanjutkan anyway? (y/n): " continue_choice
    if [ "$continue_choice" != "y" ] && [ "$continue_choice" != "Y" ]; then
        echo "✅ Setup dibatalkan"
        exit 0
    fi
fi

# Backup .env
cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"

# Remove existing SMTP config
sed -i.bak '/^SMTP_/d' "$ENV_FILE"
rm -f "${ENV_FILE}.bak"

# Add SendGrid SMTP config
echo "" >> "$ENV_FILE"
echo "# SendGrid SMTP Configuration for OTP" >> "$ENV_FILE"
echo "SMTP_HOST=smtp.sendgrid.net" >> "$ENV_FILE"
echo "SMTP_PORT=587" >> "$ENV_FILE"
echo "SMTP_USER=apikey" >> "$ENV_FILE"
echo "SMTP_PASSWORD=$sendgrid_api_key" >> "$ENV_FILE"
echo "SMTP_FROM=$sendgrid_from" >> "$ENV_FILE"

echo ""
echo "✅ SendGrid SMTP configuration berhasil ditambahkan!"
echo ""
echo "📋 Konfigurasi yang ditambahkan:"
echo "   SMTP_HOST=smtp.sendgrid.net"
echo "   SMTP_PORT=587"
echo "   SMTP_USER=apikey"
echo "   SMTP_PASSWORD=$sendgrid_api_key"
echo "   SMTP_FROM=$sendgrid_from"
echo ""
echo "🧪 Test SMTP connection:"
echo "   python scripts/test-smtp.py"
echo ""
echo "📚 Dokumentasi lengkap:"
echo "   docs/development/SETUP_SENDGRID.md"
echo ""
echo "💡 Tips:"
echo "   - Pastikan sender email sudah diverifikasi di SendGrid"
echo "   - Cek SendGrid Activity untuk melihat email yang dikirim"
echo "   - Free plan: 100 email/hari"
echo ""

