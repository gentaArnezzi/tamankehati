'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com'}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      
      console.log('✅ Login response:', data);
      
      // ✅ Save token with correct key (auth_token)
      localStorage.setItem('auth_token', data.access_token);
      
      // ✅ Save user info with correct key (auth_user, NOT 'user')
      if (data.user_id && data.role) {
        const userInfo = {
          id: String(data.user_id),
          email: data.email || email,
          nama: data.name || email.split('@')[0],
          role: data.role, // ✅ Use role from backend (super_admin or regional_admin)
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        console.log('✅ Saving user info:', userInfo);
        localStorage.setItem('auth_user', JSON.stringify(userInfo));
      } else {
        console.error('❌ Missing user_id or role in login response!', data);
        throw new Error('Invalid login response: missing user data');
      }
      
      console.log('🔄 Redirecting to dashboard...');
      
      // Small delay to ensure localStorage is fully written
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // ✅ FIX: Use window.location.href for hard navigation
      // This ensures a full page reload and dashboard will definitely load user data
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
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
                             radial-gradient(circle at 80% 20%, rgba(5, 150, 105, 0.2) 0%, transparent 50%)`
          }}
        />
        
        {/* Layer 3 - Fast moving subtle texture */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{ 
            transform: `translateY(${scrollY * 0.7}px)`,
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 100px, rgba(255, 255, 255, 0.03) 100px, rgba(255, 255, 255, 0.03) 200px)`
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
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-normal text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all h-11"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-normal text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
              {loading ? 'Memuat...' : 'Masuk'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Bottom fade effect */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-0" />
    </div>
  );
}