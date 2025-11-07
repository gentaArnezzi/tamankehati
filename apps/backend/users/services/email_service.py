# apps/backend/users/services/email_service.py
"""Email service for sending OTP codes"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional


async def send_otp_email(email: str, otp_code: str) -> bool:
    """
    Send OTP code via email.
    
    Args:
        email: Recipient email address
        otp_code: OTP code to send
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    # Get email configuration from environment
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_from = os.getenv("SMTP_FROM", smtp_user or "noreply@tamankehati.id")
    
    # If SMTP is not configured, log and return False
    if not smtp_user or not smtp_password:
        print(f"⚠️ SMTP not configured. OTP for {email}: {otp_code}")
        print("   Set SMTP_USER and SMTP_PASSWORD environment variables to enable email sending.")
        return False
    
    # DMARC Alignment Check: For SendGrid, ensure From header matches authenticated domain
    # If using SendGrid, SMTP_FROM must match a verified sender or authenticated domain
    if "sendgrid" in smtp_host.lower():
        from_domain = smtp_from.split("@")[-1] if "@" in smtp_from else ""
        user_domain = smtp_user.split("@")[-1] if "@" in smtp_user else ""
        
        # Warning if From domain doesn't match user domain (might cause DMARC alignment issues)
        if from_domain and user_domain and from_domain != user_domain:
            print(f"⚠️ WARNING: SMTP_FROM domain ({from_domain}) differs from SMTP_USER domain ({user_domain})")
            print(f"   This may cause DMARC alignment errors if domain is not authenticated in SendGrid.")
            print(f"   Ensure {from_domain} is verified in SendGrid (Single Sender or Domain Authentication)")
        
        # If SMTP_USER is "apikey" (SendGrid API key), From must be a verified sender
        if smtp_user == "apikey" and not smtp_from:
            print(f"⚠️ ERROR: When using SendGrid API key, SMTP_FROM must be set to a verified sender email")
            print(f"   Go to SendGrid Dashboard → Settings → Sender Authentication")
            print(f"   Verify a sender email and set it as SMTP_FROM in .env")
            return False
    
    try:
        # Create message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Kode OTP untuk Login - Taman Kehati"
        msg["From"] = smtp_from
        msg["To"] = email
        
        # Create HTML email body
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #233c2b; color: white; padding: 20px; text-align: center; }}
                .content {{ background-color: #f9f9f9; padding: 30px; }}
                .otp-code {{ 
                    background-color: #233c2b; 
                    color: white; 
                    font-size: 32px; 
                    font-weight: bold; 
                    text-align: center; 
                    padding: 20px; 
                    margin: 20px 0;
                    letter-spacing: 5px;
                    border-radius: 5px;
                }}
                .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
                .warning {{ color: #d32f2f; font-size: 14px; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Taman Kehati</h1>
                    <p>Portal Keanekaragaman Hayati Indonesia</p>
                </div>
                <div class="content">
                    <h2>Kode OTP untuk Login</h2>
                    <p>Halo,</p>
                    <p>Anda telah meminta kode OTP untuk login ke akun Taman Kehati Anda.</p>
                    <p>Gunakan kode berikut untuk melanjutkan:</p>
                    <div class="otp-code">{otp_code}</div>
                    <p>Kode ini berlaku selama <strong>10 menit</strong> dan hanya dapat digunakan sekali.</p>
                    <p class="warning">
                        <strong>⚠️ Peringatan:</strong> Jangan bagikan kode ini kepada siapa pun. 
                        Tim Taman Kehati tidak akan pernah meminta kode OTP Anda.
                    </p>
                    <p>Jika Anda tidak meminta kode ini, abaikan email ini atau hubungi tim support.</p>
                </div>
                <div class="footer">
                    <p>Email ini dikirim secara otomatis. Mohon jangan membalas email ini.</p>
                    <p>&copy; {os.getenv("CURRENT_YEAR", "2025")} Taman Kehati. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Create plain text version
        text_body = f"""
Taman Kehati - Portal Keanekaragaman Hayati Indonesia

Kode OTP untuk Login

Halo,

Anda telah meminta kode OTP untuk login ke akun Taman Kehati Anda.

Gunakan kode berikut untuk melanjutkan:

{otp_code}

Kode ini berlaku selama 10 menit dan hanya dapat digunakan sekali.

Peringatan: Jangan bagikan kode ini kepada siapa pun. Tim Taman Kehati tidak akan pernah meminta kode OTP Anda.

Jika Anda tidak meminta kode ini, abaikan email ini atau hubungi tim support.

---
Email ini dikirim secara otomatis. Mohon jangan membalas email ini.
© {os.getenv("CURRENT_YEAR", "2025")} Taman Kehati. All rights reserved.
        """
        
        # Attach both versions
        msg.attach(MIMEText(text_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))
        
        # Send email
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
        
        print(f"✅ OTP email sent to {email}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send OTP email to {email}: {e}")
        return False

