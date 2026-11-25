
const PVPHQ_API = 'https://pvphq.com/api/v1/players/by-name/';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': 'no-store'
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(),
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders()
      });
    }

    if (request.method !== 'GET') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    if (url.pathname !== '/api/player') {
      return jsonResponse({ error: 'Not found' }, 404);
    }

    const name = (url.searchParams.get('name') || '').trim();

    if (!/^[A-Za-z0-9_]{1,16}$/.test(name)) {
      return jsonResponse({ error: 'Invalid player name' }, 400);
    }

    try {
      const upstream = await fetch(
        PVPHQ_API + encodeURIComponent(name),
        {
          headers: { 'Accept': 'application/json' }
        }
      );

      const body = await upstream.text();

      return new Response(body, {
        status: upstream.status,
        headers: {
          ...corsHeaders(),
          'Content-Type':
            upstream.headers.get('Content-Type') ||
            'application/json; charset=utf-8'
        }
      });

    } catch (error) {
      return jsonResponse({
        error: 'Could not reach PVPHQ',
        detail: String(error)
      }, 502);
    }
  }
};
