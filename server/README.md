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

## R2 setup

Create buckets (one-time):
```sh
bunx wrangler r2 bucket create block-strategy-ohlcv
bunx wrangler r2 bucket create block-strategy-ohlcv-preview
```

`wrangler.toml` already contains:
- `[[r2_buckets]]` binding: `OHLCV_BUCKET`
- `[vars] OHLCV_OBJECT_PREFIX = "ohlcv/"`
- `[vars] TWELVE_DATA_BASE_URL = "https://api.twelvedata.com"`

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

When `OHLCV_BUCKET` is available, server DI uses `R2CsvOhlcvRepository`.
If the binding is missing, it falls back to `DummyOhlcvRepository`.

Object key layout:
- `<OHLCV_OBJECT_PREFIX><symbol>/<YYYY-MM-DD>.csv`
- example: `ohlcv/BTCUSDT/2025-01-01.csv`
