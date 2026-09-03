const express = require('express');
const path = require('path');

const app = express();
app.use(express.json({ limit: '256kb' }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '5m' }));

const KEY = process.env.SOCHEAP_API_KEY;
const BASE = (process.env.SOCHEAP_BASE_URL || 'https://socheap.ai/v1').replace(/\/$/, '');
const MODEL = process.env.MODEL || 'gpt-5.5';

const SYSTEM = `You are a senior solutions consultant writing a client-facing pitch deck.
You are given a customer scenario (their pains, and the products available to solve them).
You return ONE JSON object — no prose, no markdown fences — matching this shape:

{
  "meta": { "client": "...", "title": "...", "subtitle": "...", "presenter": "..." },
  "slides": [ { "layout": "...", ... , "script": "..." } ]
}

RULES
- 10 to 12 slides. Always open with layout "title" and close with layout "closing".
- Every slide MUST have "script": what the presenter SAYS OUT LOUD for that slide.
  70-110 words, first person plural ("we"), spoken register, no bullet fragments,
  no stage directions, no "in this slide we will see". Start speaking immediately.
  The script must carry the argument — someone who has not read the deck should be
  able to read the script aloud and sound like they built it.
- Ground everything in the scenario given. Use the customer's own numbers and their
  own quoted words where they appear. NEVER invent statistics, client names, case
  studies, prices, or ROI figures that are not derivable from the scenario. If you
  want to express value, express it as a mechanism ("you see it the same day instead
  of on Monday"), not as a fabricated percentage.
- Map every stated customer pain to a named product. If a pain has no product that
  clearly covers it, do not silently drop it: address it honestly on a slide as an
  open item or an adjacent play. This is a scored detail.
- Language of all visible text and scripts: {{LANG}}

LAYOUTS — pick the one that fits; vary them, never use "bullets" more than 4 times.
  "title"    -> title, subtitle
  "quote"    -> quote (one sentence, the customer's voice), attribution
  "bullets"  -> title, subtitle (optional short line), bullets (3-5, max 12 words each)
  "three"    -> title, cards: [{heading, body}] exactly 3, body max 20 words
  "metrics"  -> title, metrics: [{value, label}] exactly 3, value very short ("6 wks","3x","120")
  "agenda"   -> title, bullets (3-5) — use once, early
  "closing"  -> title, subtitle, bullets (2-4 next steps)

Return ONLY the JSON object.`;

async function callLLM(userPrompt, lang) {
  let lastErr;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const r = await fetch(`${BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          temperature: 0.8,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: SYSTEM.replace('{{LANG}}', lang) },
            { role: 'user', content: userPrompt },
          ],
        }),
      });

      if (r.status === 503 || r.status === 502 || r.status === 504) {
        lastErr = new Error(`relay busy (${r.status})`);
        await new Promise((res) => setTimeout(res, 1200 * (attempt + 1)));
        continue;
      }
      const text = await r.text();
      if (!r.ok) {
        // 429 from an exhausted balance is not worth retrying.
        if (r.status === 429 && /insufficient_quota|credit_balance/i.test(text)) {
          throw new Error('The AI account is out of credit. Tell William.');
        }
        if (r.status === 429) {
          lastErr = new Error('rate limited');
          await new Promise((res) => setTimeout(res, 1500 * (attempt + 1)));
          continue;
        }
        throw new Error(`AI error ${r.status}: ${text.slice(0, 300)}`);
      }
      const body = JSON.parse(text);
      const content = body?.choices?.[0]?.message?.content;
      if (!content) throw new Error('Empty response from the model.');
      return JSON.parse(stripFence(content));
    } catch (e) {
      lastErr = e;
      if (/out of credit|AI error 4/.test(e.message)) throw e;
      if (attempt === 3) throw e;
      await new Promise((res) => setTimeout(res, 1000 * (attempt + 1)));
    }
  }
  throw lastErr || new Error('Generation failed.');
}

function stripFence(s) {
  const m = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  return (m ? m[1] : s).trim();
}

const LANGS = {
  en: 'English only.',
  zh: '简体中文 only. All slide text and all scripts in Chinese.',
  bi: 'Bilingual. Every visible slide string is "English ／ 中文" on one line. Scripts are English first, then a Chinese line prefixed with 中文：',
};

app.post('/api/generate', async (req, res) => {
  if (!KEY) return res.status(500).json({ error: 'Server is missing SOCHEAP_API_KEY.' });

  const scenario = String(req.body?.scenario || '').trim();
  if (scenario.length < 40) {
    return res.status(400).json({ error: 'Paste the customer scenario first (a bit more detail needed).' });
  }
  const presenter = String(req.body?.presenter || '').trim().slice(0, 80);
  const angle = String(req.body?.angle || '').trim().slice(0, 400);
  const lang = LANGS[req.body?.lang] ? req.body.lang : 'en';

  const userPrompt = [
    '=== CUSTOMER SCENARIO ===',
    scenario.slice(0, 12000),
    '',
    presenter ? `Presenter name (put on the title slide): ${presenter}` : 'No presenter name given; omit it.',
    angle ? `The presenter wants this angle emphasised: ${angle}` : '',
    '',
    `Freshness seed (vary structure and wording from other runs): ${Math.random().toString(36).slice(2, 10)}`,
  ].join('\n');

  try {
    const deck = await callLLM(userPrompt, LANGS[lang]);
    if (!Array.isArray(deck?.slides) || !deck.slides.length) {
      throw new Error('The model returned no slides. Hit Generate again.');
    }
    res.json(deck);
  } catch (e) {
    console.error('[generate]', e.message);
    res.status(502).json({ error: e.message });
  }
});

app.get('/healthz', (_req, res) => res.json({ ok: true, model: MODEL, keyed: !!KEY }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`pitchdeck-gen on :${PORT}  model=${MODEL}  keyed=${!!KEY}`));
