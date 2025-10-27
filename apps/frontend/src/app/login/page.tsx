'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@kehati.org');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Masuk ke Dashboard Taman Kehati
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <div className="mt-4 text-sm text-gray-600">
            <p>Default credentials:</p>
            <p>Email: admin@kehati.org</p>
            <p>Password: password</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}