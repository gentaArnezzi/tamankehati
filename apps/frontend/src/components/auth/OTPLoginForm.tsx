"use client";

import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Mail, KeyRound } from "lucide-react";
import { apiUrl } from "@/lib/api-url";

type OTPLoginFormProps = {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
};

export function OTPLoginForm({ email, onBack, onSuccess }: OTPLoginFormProps) {
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleRequestOTP = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(apiUrl("/api/v1/auth/request-otp"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to send OTP");
      }

      const data = await response.json();
      setOtpSent(true);
      setCountdown(60); // 60 seconds cooldown
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(apiUrl("/api/v1/auth/login-with-otp"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp_code: otpCode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Invalid OTP code");
      }

      const data = await response.json();

      // Save token
      localStorage.setItem("auth_token", data.access_token);

      // Get user info (we'll need to fetch it separately or from token)
      // For now, redirect to dashboard and let useAuth handle it
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
          <Mail className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">
          Masuk dengan OTP
        </h3>
        <p className="text-sm text-gray-600">
          Kami akan mengirimkan kode OTP ke email Anda
        </p>
        <p className="text-sm font-medium text-gray-900">{email}</p>
      </div>

      {!otpSent ? (
        <div className="space-y-4">
          <Button
            type="button"
            onClick={handleRequestOTP}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={loading || countdown > 0}
          >
            {loading
              ? "Mengirim..."
              : countdown > 0
              ? `Kirim ulang (${countdown}s)`
              : "Kirim Kode OTP"}
          </Button>
        </div>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-sm font-normal text-gray-700">
              Kode OTP
            </Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="otp"
                type="text"
                placeholder="Masukkan 6 digit kode"
                value={otpCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtpCode(value);
                }}
                required
                maxLength={6}
                className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all h-11 pl-10 text-center text-2xl tracking-widest font-mono"
              />
            </div>
            <p className="text-xs text-gray-500">
              Kode OTP telah dikirim ke email Anda. Kode berlaku selama 10 menit.
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-normal py-6 text-base transition-all duration-300 shadow-md hover:shadow-lg"
              disabled={loading || otpCode.length !== 6}
            >
              {loading ? "Memverifikasi..." : "Verifikasi & Masuk"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={handleRequestOTP}
              className="w-full text-sm text-gray-600 hover:text-gray-900"
              disabled={loading || countdown > 0}
            >
              {countdown > 0
                ? `Kirim ulang kode (${countdown}s)`
                : "Kirim ulang kode OTP"}
            </Button>
          </div>
        </form>
      )}

      <div className="pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="w-full text-sm text-gray-600 hover:text-gray-900"
        >
          ← Kembali ke login dengan password
        </Button>
      </div>
    </div>
  );
}

