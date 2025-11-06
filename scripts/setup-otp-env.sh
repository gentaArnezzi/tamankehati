#!/bin/bash
# Setup OTP Environment Variables
# This script helps you configure SMTP settings for OTP email delivery

echo "🔐 OTP Setup - SMTP Configuration"
echo "=================================="
echo ""

# Check if .env exists
ENV_FILE="apps/backend/.env"
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ File $ENV_FILE tidak ditemukan!"
    echo "   Buat file .env terlebih dahulu atau copy dari .env.example"
    exit 1
fi

echo "📝 File .env ditemukan: $ENV_FILE"
echo ""

# Check existing SMTP config
if grep -q "SMTP_HOST" "$ENV_FILE"; then
    echo "⚠️  SMTP configuration sudah ada di .env"
    echo ""
    echo "Current SMTP settings:"
    grep "SMTP_" "$ENV_FILE" | grep -v "^#" || echo "   (tidak ada)"
    echo ""
    read -p "Apakah Anda ingin mengupdate? (y/n): " update_choice
    if [ "$update_choice" != "y" ] && [ "$update_choice" != "Y" ]; then
        echo "✅ Setup dibatalkan"
        exit 0
    fi
fi

echo ""
echo "Masukkan konfigurasi SMTP Anda:"
echo ""

# SMTP Host
read -p "SMTP Host [smtp.gmail.com]: " smtp_host
smtp_host=${smtp_host:-smtp.gmail.com}

# SMTP Port
read -p "SMTP Port [587]: " smtp_port
smtp_port=${smtp_port:-587}

# SMTP User (email)
read -p "SMTP User (email): " smtp_user
if [ -z "$smtp_user" ]; then
    echo "❌ SMTP User tidak boleh kosong!"
    exit 1
fi

# SMTP Password
read -sp "SMTP Password (App Password untuk Gmail): " smtp_password
echo ""
if [ -z "$smtp_password" ]; then
    echo "❌ SMTP Password tidak boleh kosong!"
    exit 1
fi

# SMTP From
read -p "SMTP From (sender email) [$smtp_user]: " smtp_from
smtp_from=${smtp_from:-$smtp_user}

# Backup .env
cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"

# Remove existing SMTP config
sed -i.bak '/^SMTP_/d' "$ENV_FILE"
rm -f "${ENV_FILE}.bak"

# Add new SMTP config
echo "" >> "$ENV_FILE"
echo "# SMTP Configuration for OTP" >> "$ENV_FILE"
echo "SMTP_HOST=$smtp_host" >> "$ENV_FILE"
echo "SMTP_PORT=$smtp_port" >> "$ENV_FILE"
echo "SMTP_USER=$smtp_user" >> "$ENV_FILE"
echo "SMTP_PASSWORD=$smtp_password" >> "$ENV_FILE"
echo "SMTP_FROM=$smtp_from" >> "$ENV_FILE"

echo ""
echo "✅ SMTP configuration berhasil ditambahkan ke $ENV_FILE"
echo ""
echo "📋 Konfigurasi yang ditambahkan:"
echo "   SMTP_HOST=$smtp_host"
echo "   SMTP_PORT=$smtp_port"
echo "   SMTP_USER=$smtp_user"
echo "   SMTP_PASSWORD=***"
echo "   SMTP_FROM=$smtp_from"
echo ""
echo "💡 Tips:"
echo "   - Untuk Gmail, gunakan App Password (bukan password biasa)"
echo "   - Buka: https://myaccount.google.com/apppasswords"
echo "   - Pilih 'Mail' dan buat App Password baru"
echo ""
echo "🧪 Test SMTP connection:"
echo "   python scripts/test-smtp.py"
echo ""

