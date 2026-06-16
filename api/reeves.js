// Vercel serverless function: IronGate Reeves proxy
// This file lives in /api/reeves.js inside your GitHub repo.
// Vercel auto-deploys this as a callable endpoint at /api/reeves.

// The Anthropic API key is read from Vercel's encrypted environment variables.
// You set ANTHROPIC_API_KEY in the Vercel dashboard, never in this file.

export default async function handler(req, res) {
  // ===== Origin check =====
  // Only allow requests from your own website. This blocks anyone who finds
  // the Vercel URL from calling it from a different site.
  const allowedOrigins = [
    'https://dbednarczyk.com',
    'https://www.dbednarczyk.com'
  ];

  const origin = req.headers.origin || req.headers.referer || '';
  const isAllowed = allowedOrigins.some(allowed => origin.startsWith(allowed));

  // CORS preflight handling
  if (req.method === 'OPTIONS') {
    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Access-Control-Max-Age', '86400');
    }
    return res.status(204).end();
  }

  if (!isAllowed) {
    return res.status(403).json({
      error: 'Forbidden: requests from this origin are not allowed.'
    });
  }

  // Only accept POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set CORS header for the actual request
  res.setHeader('Access-Control-Allow-Origin', origin);

  // ===== Validate API key is configured =====
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Server misconfigured: ANTHROPIC_API_KEY environment variable is not set.'
    });
  }

  // ===== Validate request body =====
  const body = req.body;
  if (!body || !body.messages || !Array.isArray(body.messages)) {
    return res.status(400).json({
      error: 'Invalid request: missing messages array.'
    });
  }

  // ===== Forward to Anthropic =====
  try {
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: body.model || 'claude-sonnet-4-6',
        max_tokens: body.max_tokens || 1000,
        system: body.system,
        messages: body.messages
      })
    });

    const responseText = await anthropicResponse.text();

    // Pass through whatever Anthropic returned, including error responses
    res.status(anthropicResponse.status);
    try {
      const parsed = JSON.parse(responseText);
      return res.json(parsed);
    } catch (e) {
      return res.send(responseText);
    }
  } catch (e) {
    return res.status(502).json({
      error: 'Upstream error calling Anthropic: ' + e.message
    });
  }
}
