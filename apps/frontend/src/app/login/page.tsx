"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api-url";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [requiresOTP, setRequiresOTP] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        apiUrl("/api/v1/auth/login"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Login failed");
      }

      const data = await response.json();

      console.log("✅ Login response:", data);

      // Check if OTP is required
      if (data.requires_otp) {
        setRequiresOTP(true);
        setError(null);
        return;
      }

      // If no OTP required (shouldn't happen with new flow, but handle it)
      if (data.access_token) {
        localStorage.setItem("auth_token", data.access_token);

        if (data.user_id && data.role) {
          const userInfo = {
            id: String(data.user_id),
            email: data.email || email,
            nama: data.name || email.split("@")[0],
            role: data.role,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          localStorage.setItem("auth_user", JSON.stringify(userInfo));
        }

        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        apiUrl("/api/v1/auth/verify-otp-after-password"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, otp_code: otpCode }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Invalid OTP code");
      }

      const data = await response.json();

      console.log("✅ OTP verified, login response:", data);
      console.log("📋 Response keys:", Object.keys(data));
      console.log("📋 user_id:", data.user_id, "role:", data.role, "email:", data.email);

      // Save token
      if (!data.access_token) {
        console.error("❌ Missing access_token in response!", data);
        throw new Error("Invalid login response: missing access_token");
      }
      
      localStorage.setItem("auth_token", data.access_token);

      // Save user info - check all possible fields
      const userId = data.user_id || data.userId || data.id;
      const userRole = data.role || data.userRole;
      const userEmail = data.email || email;
      const userName = data.name || data.display_name || email.split("@")[0];

      if (userId && userRole) {
        const userInfo = {
          id: String(userId),
          email: userEmail,
          nama: userName,
          role: userRole,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        console.log("✅ Saving user info:", userInfo);
        localStorage.setItem("auth_user", JSON.stringify(userInfo));
      } else {
        console.error("❌ Missing user_id or role in login response!", {
          user_id: userId,
          role: userRole,
          full_data: data
        });
        throw new Error("Invalid login response: missing user data");
      }

      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Parallax Background with Images */}
      <div className="absolute inset-0 z-0">
        {/* Layer 1 - Base image (slowest parallax) */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/hero/forest.webp')`,
            transform: `translateY(${scrollY * 0.3}px) scale(1.1)`,
          }}
        />

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/40 via-green-900/50 to-teal-950/60" />

        {/* Layer 2 - Medium speed overlay with pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
            backgroundImage: `radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 80% 20%, rgba(5, 150, 105, 0.2) 0%, transparent 50%)`,
          }}
        />

        {/* Layer 3 - Fast moving subtle texture */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            transform: `translateY(${scrollY * 0.7}px)`,
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 100px, rgba(255, 255, 255, 0.03) 100px, rgba(255, 255, 255, 0.03) 200px)`,
          }}
        />
      </div>

      {/* Login Card */}
      <Card className="relative z-10 w-full max-w-md mx-4 shadow-2xl border-0 bg-white/98 backdrop-blur-md">
        <CardHeader className="space-y-1 pb-4 pt-8">
          <CardTitle className="text-3xl font-light text-center text-gray-800 tracking-wide">
            Taman Kehati
          </CardTitle>
          <p className="text-sm text-center text-gray-600 font-light pt-1">
            Portal Keanekaragaman Hayati Indonesia
          </p>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          {!requiresOTP ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-normal text-gray-700"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all h-11"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-normal text-gray-700"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all h-11"
                />
              </div>

              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-normal py-6 text-base transition-all duration-300 shadow-md hover:shadow-lg mt-6"
                disabled={loading}
              >
                {loading ? "Memverifikasi..." : "Masuk"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div className="text-center space-y-2 mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
                  <svg
                    className="w-8 h-8 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Verifikasi OTP
                </h3>
                <p className="text-sm text-gray-600">
                  Kode OTP telah dikirim ke email Anda
                </p>
                <p className="text-sm font-medium text-gray-900">{email}</p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="otp"
                  className="text-sm font-normal text-gray-700"
                >
                  Kode OTP
                </Label>
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
                  disabled={loading}
                  className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all h-11 text-center text-2xl tracking-widest font-mono"
                />
                <p className="text-xs text-gray-500">
                  Kode OTP berlaku selama 10 menit
                </p>
              </div>

              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-normal py-6 text-base transition-all duration-300 shadow-md hover:shadow-lg mt-6"
                disabled={loading || otpCode.length !== 6}
              >
                {loading ? "Memverifikasi..." : "Verifikasi & Masuk"}
              </Button>

              <div className="pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setRequiresOTP(false);
                    setOtpCode("");
                    setError(null);
                  }}
                  className="w-full text-sm text-gray-600 hover:text-gray-900"
                >
                  ← Kembali
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Bottom fade effect */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-0" />
    </div>
  );
}
