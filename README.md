# pitchdeck-gen

Paste a customer scenario → get a `.pptx` back, with a word-for-word speaker
script in the **Notes** field of every slide.

Live: https://pitchdeck-gen.onrender.com

## How it works
- `server.js` — one endpoint, `POST /api/generate`. Sends the scenario to the
  SoCheap relay (OpenAI chat-completions shape) and returns a deck as JSON.
  Retries on the relay's intermittent 503s; fails fast on an exhausted balance.
- `public/index.html` — the whole UI, plus the PowerPoint builder. PptxGenJS is
  vendored into `public/vendor/` on purpose: no CDN to fall over mid-workshop.
- Slide layouts: `title`, `quote`, `bullets`, `three`, `metrics`, `agenda`,
  `closing`. The model picks per slide; geometry is fixed in `buildPptx()`.

## Env
| var | |
|---|---|
| `SOCHEAP_API_KEY` | required |
| `SOCHEAP_BASE_URL` | defaults to `https://socheap.ai/v1` |
| `MODEL` | defaults to `gpt-5.5` |

## Local
```
SOCHEAP_API_KEY=sk-... npm start   # http://localhost:3000
```
