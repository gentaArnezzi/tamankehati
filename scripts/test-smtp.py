#!/usr/bin/env python3
"""
Test SMTP Connection for OTP Email
Run this script to verify SMTP configuration
"""
import os
import sys
import smtplib
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend directory
backend_path = Path(__file__).parent.parent / "apps" / "backend"
env_path = backend_path / ".env"

if not env_path.exists():
    print(f"❌ File .env tidak ditemukan: {env_path}")
    print("   Jalankan: bash scripts/setup-otp-env.sh")
    sys.exit(1)

load_dotenv(env_path)

# Get SMTP configuration
smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
smtp_port = int(os.getenv("SMTP_PORT", "587"))
smtp_user = os.getenv("SMTP_USER")
smtp_password = os.getenv("SMTP_PASSWORD")
smtp_from = os.getenv("SMTP_FROM", smtp_user)

print("🔐 Testing SMTP Connection")
print("=" * 50)
print(f"Host:     {smtp_host}")
print(f"Port:     {smtp_port}")
print(f"User:     {smtp_user}")
print(f"From:     {smtp_from}")
if "sendgrid" in smtp_host.lower():
    print("Provider: SendGrid")
    print("💡 Tips: Pastikan sender email sudah diverifikasi di SendGrid")
print("=" * 50)
print()

if not smtp_user or not smtp_password:
    print("❌ SMTP_USER atau SMTP_PASSWORD tidak dikonfigurasi!")
    print("   Jalankan: bash scripts/setup-otp-env.sh")
    sys.exit(1)

try:
    print("🔄 Connecting to SMTP server...")
    server = smtplib.SMTP(smtp_host, smtp_port)
    server.set_debuglevel(1)  # Show debug output
    
    print("🔄 Starting TLS...")
    server.starttls()
    
    print("🔄 Authenticating...")
    server.login(smtp_user, smtp_password)
    
    print()
    print("✅ SMTP connection successful!")
    print("   OTP emails should work correctly.")
    print()
    
    # Test sending email
    test_email = input("Kirim test email? (y/n): ").strip().lower()
    if test_email == "y":
        test_recipient = input("Masukkan email penerima: ").strip()
        if test_recipient:
            from email.mime.text import MIMEText
            from email.mime.multipart import MIMEMultipart
            
            msg = MIMEMultipart()
            msg["From"] = smtp_from
            msg["To"] = test_recipient
            msg["Subject"] = "Test OTP Email - Taman Kehati"
            
            body = """
            Ini adalah test email dari sistem OTP Taman Kehati.
            
            Jika Anda menerima email ini, berarti konfigurasi SMTP sudah benar.
            
            OTP login system siap digunakan!
            """
            
            msg.attach(MIMEText(body, "plain"))
            
            print(f"🔄 Sending test email to {test_recipient}...")
            server.send_message(msg)
            print(f"✅ Test email sent successfully!")
            print(f"   Cek inbox: {test_recipient}")
    
    server.quit()
    
except smtplib.SMTPAuthenticationError as e:
    print()
    print("❌ SMTP Authentication failed!")
    print(f"   Error: {e}")
    print()
    print("💡 Tips:")
    print("   - Pastikan SMTP_USER dan SMTP_PASSWORD benar")
    print("   - Untuk Gmail, gunakan App Password (bukan password biasa)")
    print("   - Buka: https://myaccount.google.com/apppasswords")
    sys.exit(1)
    
except smtplib.SMTPConnectError as e:
    print()
    print("❌ SMTP Connection failed!")
    print(f"   Error: {e}")
    print()
    print("💡 Tips:")
    print("   - Cek SMTP_HOST dan SMTP_PORT")
    print("   - Pastikan firewall tidak memblokir port 587")
    print("   - Cek koneksi internet")
    sys.exit(1)
    
except Exception as e:
    print()
    print(f"❌ Error: {e}")
    print()
    print("💡 Tips:")
    print("   - Cek semua konfigurasi SMTP")
    print("   - Pastikan email provider mendukung SMTP")
    sys.exit(1)

