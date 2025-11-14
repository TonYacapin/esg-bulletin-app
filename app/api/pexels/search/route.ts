import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const page = searchParams.get('page') || '1';
  const perPage = searchParams.get('per_page') || '20';

  if (!query) {
    return new Response(
      JSON.stringify({ error: 'Query parameter is required' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey) {
      throw new Error('PEXELS_API_KEY is not configured');
    }

    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
      {
        headers: {
          'Authorization': apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Pexels API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch images' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}