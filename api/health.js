// Vercel serverless function: IronGate health check
// Pings Anthropic to verify the model is active.
// Called by UptimeRobot to monitor chatbot availability.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      status: 'error',
      error: 'ANTHROPIC_API_KEY not set.'
    });
  }

  try {
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'ping' }]
      })
    });

    if (anthropicResponse.ok) {
      return res.status(200).json({ status: 'ok', model: 'claude-sonnet-4-6' });
    } else {
      const error = await anthropicResponse.json();
      return res.status(500).json({ status: 'model_error', detail: error });
    }
  } catch (e) {
    return res.status(502).json({ status: 'failed', error: e.message });
  }
}
