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
- Use exactly the slide count you are given. Always open with layout "title" and close with layout "closing".
- You are given a DECK ARCHITECTURE. Obey it. It names the layouts this deck is
  built from, and it is the main thing stopping your deck from looking like
  everyone else's. Never use the same layout twice in a row, and never let more
  than 3 slides in the whole deck use "bullets".
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
- You will be given an ASSIGNED APPROACH. It is not a suggestion. Several consultants
  are pitching the SAME scenario to the SAME customer, and their decks must not look
  alike. Obey the assigned opener, narrative device, argument order and closing ask.
  Two decks built from the same scenario with different approaches must differ in
  slide TITLES, slide ORDER, which problem leads, and how value is framed — not just
  in wording. Do not fall back on the obvious "problem 1, problem 2, problem 3" march
  unless the assigned approach asks for it.

LAYOUTS — every slide names one. Fields listed are the ones that layout renders;
anything else you add is ignored. Vary them hard.
  "title"     -> title, subtitle
  "closing"   -> title, subtitle, bullets (2-4 next steps)
  "section"   -> title, subtitle — a chapter divider, no body content
  "statement" -> text (ONE sentence, max 22 words), kicker (optional short line)
  "spotlight" -> value (ONE word or figure, max 9 characters), label (one line)
  "quote"     -> quote (the customer's own sentence), attribution
  "bullets"   -> title, subtitle (optional), bullets (3-5, max 12 words each)
  "three"     -> title, cards: [{heading, body}] exactly 3, body max 20 words
  "quad"      -> title, cards: [{heading, body}] exactly 4, body max 16 words
  "metrics"   -> title, metrics: [{value, label}] exactly 3, value max 8 chars
  "bignum"    -> title, value (max 8 chars), label (one line), note (one sentence)
  "table"     -> title, leftHead, rightHead, rows: [{left, right}] 3-5 rows,
                 each cell max 14 words. Use for before/after and this/that.
  "stack"     -> title, rows: [{left, right}] 3-5 rows — left maps TO right,
                 e.g. a problem to the product that answers it. left max 5 words.
  "timeline"  -> title, steps: [{label, text}] 3-4 — label is short (e.g. "30 days")
  "chevron"   -> title, steps: [{label, text}] 3-4 — a flow, each step feeds the next
  "ladder"    -> title, steps: [{label, text}] 3-4 — ordered smallest to biggest
  "split"     -> title, statement (ONE sentence), bullets (3-5) — claim | evidence
  "agenda"    -> title, bullets (3-5) — at most once, and only if it earns its place

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

/* ============================================================
   Everyone is handed the SAME case, so the decks must be pulled
   apart deliberately. Hashing each name independently is not
   enough — with ten people and twelve arguments, the birthday
   problem hands three of them the same leading argument. So the
   server is the coordination point: it hands out the LEAST-USED
   option on each axis, which guarantees distinct arguments until
   the pool is exhausted.
   ============================================================ */
const LANGS = {
  en: 'English only.',
  zh: '简体中文 only. All slide text and all scripts in Chinese.',
  bi: 'Bilingual. Every visible slide string is "English ／ 中文" on one line. Scripts are English first, then a Chinese line prefixed with 中文：',
};

function buildPrompt({ scenario, presenter, approach }) {
  const str = (v, n) => String(v || '').trim().slice(0, n);
  const a = approach || {};
  const lines = [
    str(a.angle, 300) && `ARGUMENT: ${str(a.angle, 300)}`,
    str(a.device, 300) && `NARRATIVE DEVICE — structure the deck around this: ${str(a.device, 300)}`,
    str(a.opener, 300) && `OPENING MOVE after the title slide: ${str(a.opener, 300)}`,
    str(a.close, 300) && `CLOSING ASK: ${str(a.close, 300)}`,
  ].filter(Boolean).join('\n');

  const st = a.structure || {};
  const arch = [
    str(st.brief, 400),
    Array.isArray(st.uses) && st.uses.length
      ? `Build this deck mainly from these layouts: ${st.uses.join(', ')}. Use each of them at least once.`
      : '',
  ].filter(Boolean).join('\n');

  const slideCount = Math.min(12, Math.max(10, parseInt(a.slides, 10) || 11));

  return [
    '=== CUSTOMER SCENARIO ===',
    String(scenario || '').slice(0, 12000),
    '',
    '=== YOUR ASSIGNED APPROACH (mandatory) ===',
    lines || 'No approach assigned; choose your own and commit to it.',
    '',
    '=== YOUR DECK ARCHITECTURE (mandatory) ===',
    arch || 'No architecture assigned; vary the layouts yourself.',
    `Deck length: exactly ${slideCount} slides.`,
    '',
    presenter ? `Presenter name (put on the title slide): ${presenter}` : 'No presenter name given; omit it.',
    '',
    `Freshness seed (vary wording from other runs): ${Math.random().toString(36).slice(2, 10)}`,
  ].join('\n');
}

async function generateDeck({ scenario, presenter, approach, lang }) {
  if (!KEY) throw new Error('Missing SOCHEAP_API_KEY.');
  const deck = await callLLM(buildPrompt({ scenario, presenter, approach }), LANGS[lang] || LANGS.en);
  if (!Array.isArray(deck?.slides) || !deck.slides.length) {
    throw new Error('The model returned no slides.');
  }
  return deck;
}

/*
 * Everyone pitches the same customer, so identical slide titles turn up across
 * decks even when the arguments differ. This rewrites the offending ones.
 */
async function rewriteTitles({ presenter, angle, slides, taken }) {
  const system = 'You retitle presentation slides. Reply with ONLY a JSON object ' +
    '{"titles": {"<slide number>": "<new title>"}} and nothing else.';
  const user = [
    `This deck argues: ${angle}`,
    '',
    'Rewrite the title of each slide listed below. A new title must:',
    '- say what THIS slide says, using its own content',
    '- fit the argument above',
    '- be at most 9 words',
    '- not match, and not merely reword, any title in the FORBIDDEN list',
    '',
    'SLIDES TO RETITLE:',
    ...slides.map(s => `#${s.n} (current: "${s.title}") content: ${s.content}`),
    '',
    'FORBIDDEN TITLES:',
    ...taken.map(t => `- ${t}`),
  ].join('\n');

  const r = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.9,
      response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    }),
  });
  if (!r.ok) throw new Error(`retitle failed (${r.status})`);
  const body = await r.json();
  const out = JSON.parse(stripFence(body?.choices?.[0]?.message?.content || '{}'));
  return out.titles || {};
}

module.exports = { generateDeck, rewriteTitles, LANGS, MODEL, hasKey: () => !!KEY };
