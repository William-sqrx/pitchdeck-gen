const express = require('express');
const path = require('path');
const { approachFor } = require('./lib/approach');
const { generateDeck, MODEL, hasKey } = require('./lib/deck');

const app = express();
app.use(express.json({ limit: '256kb' }));

// The vendored library is immutable; the pages and the pre-built decks are not.
// A 404 served during a deploy would otherwise sit in Cloudflare for maxAge.
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders(res, filePath) {
    res.setHeader('Cache-Control', /[\\/]vendor[\\/]/.test(filePath)
      ? 'public, max-age=604800, immutable'
      : 'no-cache');
  },
}));

app.get('/api/approach', (req, res) => {
  const name = String(req.query.name || '').trim().slice(0, 80);
  if (!name) return res.status(400).json({ error: 'Name required.' });
  const spin = Math.max(0, Math.min(99, parseInt(req.query.spin, 10) || 0));
  res.set('Cache-Control', 'no-store');
  res.json(approachFor(name, spin));
});

// Kept so a deck can still be regenerated on demand — the roster decks
// themselves are pre-built into public/decks by scripts/buildDecks.js.
app.post('/api/generate', async (req, res) => {
  if (!hasKey()) return res.status(500).json({ error: 'Server is missing SOCHEAP_API_KEY.' });
  const scenario = String(req.body?.scenario || '').trim();
  if (scenario.length < 40) {
    return res.status(400).json({ error: 'Paste the customer scenario first (a bit more detail needed).' });
  }
  try {
    res.json(await generateDeck({
      scenario,
      presenter: String(req.body?.presenter || '').trim().slice(0, 80),
      approach: req.body?.approach,
      lang: req.body?.lang,
    }));
  } catch (e) {
    console.error('[generate]', e.message);
    res.status(502).json({ error: e.message });
  }
});

app.get('/healthz', (_req, res) => res.json({ ok: true, model: MODEL, keyed: hasKey() }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`pitchdeck-gen on :${PORT}  model=${MODEL}  keyed=${hasKey()}`));
