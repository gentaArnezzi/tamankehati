'use client';

import React, { useState } from 'react';

export default function TestLoginPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult('Testing login...');
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: 'admin@kehati.org', 
          password: 'password' 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setResult(`❌ Login failed: ${errorData.detail || 'Unknown error'}`);
        return;
      }

      const data = await response.json();
      localStorage.setItem('auth_token', data.access_token);
      
      setResult(`✅ Login successful! Token: ${data.access_token.substring(0, 50)}...`);
      
      // Test dashboard API
      const dashboardResponse = await fetch('http://localhost:8000/api/v1/dashboard/comprehensive-simple?time_range=yearly', {
        headers: {
          'Authorization': `Bearer ${data.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        setResult(prev => prev + `\n✅ Dashboard API working! User: ${dashboardData.user_role}`);
      } else {
        setResult(prev => prev + `\n❌ Dashboard API failed: ${dashboardResponse.status}`);
      }
      
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Test Login</h1>
        <button 
          onClick={testLogin}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Login'}
        </button>
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Result:</h3>
          <pre className="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap">
            {result || 'Click "Test Login" to start'}
          </pre>
        </div>
        <div className="mt-4">
          <a href="/login" className="text-blue-500 hover:underline">
            Go to Login Page
          </a>
        </div>
      </div>
    </div>
  );
}
