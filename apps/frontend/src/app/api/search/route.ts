import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://tamankehati-backend.onrender.com';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') ?? '';
  const limit = searchParams.get('limit') ?? '20';

  if (!query.trim()) {
    return NextResponse.json({ 
      query: '', 
      results: [], 
      total: 0 
    });
  }

  try {
    // Call the backend search API
    const response = await fetch(
      `${BACKEND_URL}/api/v1/public/search?q=${encodeURIComponent(query)}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Backend search failed: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      query: data.query,
      results: data.results || [],
      total: data.total || 0
    });
  } catch (error) {
    console.error('Gagal menjalankan pencarian global', error);
    
    // Return empty results on error instead of 500 to prevent UI breaking
    return NextResponse.json({ 
      query, 
      results: [], 
      total: 0,
      error: 'Gagal melakukan pencarian. Silakan coba lagi.'
    });
  }
}
