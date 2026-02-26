## Server (Cloudflare Workers)

Install dependencies:
```sh
bun install
```

Run locally in Workers runtime:
```sh
bun run dev
```

This starts `wrangler dev` on:
- `http://localhost:3000`

Build type declarations / JS output:
```sh
bun run build
```

Set TwelveData API key for local dev:
1. create `server/.env` (gitignored) with:
```sh
TWELVE_DATA_API_KEY=your_key
```
2. sync to Wrangler local vars file:
```sh
bun run sync:dev-vars
```

Production/staging key should still use Wrangler Secret:
```sh
bunx wrangler secret put TWELVE_DATA_API_KEY
```
