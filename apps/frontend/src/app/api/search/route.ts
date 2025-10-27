import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') ?? '';

  try {
    // TODO: Implement global search functionality
    const results: any[] = [];
    return NextResponse.json({ query, results });
  } catch (error) {
    console.error('Gagal menjalankan pencarian global', error);
    return NextResponse.json({ query, results: [] }, { status: 500 });
  }
}
