# IronGate Proxy

Server-side proxy for the IronGate Live Practice Arena.

This Vercel function holds the Anthropic API key as an encrypted environment variable, so the agent's HTML file (hosted at dbednarczyk.com) can call Claude without exposing the key in browser-readable code.

## Setup

1. Deploy this repo to Vercel.
2. In the Vercel project settings, add an environment variable named `ANTHROPIC_API_KEY` with your Anthropic key as the value.
3. The function lives at `https://[your-vercel-project].vercel.app/api/reeves`.
4. Update the IronGate agent HTML to call this URL instead of api.anthropic.com directly.

## Origin restriction

The proxy only accepts requests originating from `dbednarczyk.com`. Update the `allowedOrigins` array in `api/reeves.js` if the site moves to a different domain.
