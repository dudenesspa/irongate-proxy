export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'ping' }]
      })
    });

    if (response.ok) {
      res.status(200).json({ status: 'ok', model: 'claude-sonnet-4-6' });
    } else {
      const error = await response.json();
      res.status(500).json({ status: 'model_error', detail: error });
    }
  } catch (e) {
    res.status(500).json({ status: 'failed', error: e.message });
  }
}
Step 5: Scroll down and click Commit changes. Leave the default commit message, commit directly to main.
Vercel will automatically detect the new file and redeploy. Takes about 60 seconds. Tell me when that's done and I'll walk you through the UptimeRobot setup.
