/*
 * Pre-builds one deck per person on the roster and writes them into
 * public/decks/. Everyone gets the same customer case but a different
 * assigned approach, so no two decks come out alike.
 *
 *   SOCHEAP_API_KEY=sk-... node scripts/buildDecks.js
 */
const fs = require('fs');
const path = require('path');
const roster = require('./roster');
const { approachFor } = require('../lib/approach');
const { generateDeck, rewriteTitles } = require('../lib/deck');

const SCENARIO = fs.readFileSync(path.join(__dirname, 'scenario.txt'), 'utf8');
const OUT = path.join(__dirname, '..', 'public', 'decks');
const LANG = process.env.DECK_LANG || 'en';
const CONCURRENCY = 4;

const slug = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function buildOne(name) {
  const approach = approachFor(name, 0);
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const deck = await generateDeck({ scenario: SCENARIO, presenter: name, approach, lang: LANG });
      deck.accent = approach.accent.hex;
      deck.themeId = approach.themeId;
      deck.approach = approach;
      if (!deck.meta) deck.meta = {};
      deck.meta.presenter = name;
      fs.writeFileSync(path.join(OUT, slug(name) + '.json'), JSON.stringify(deck, null, 1));
      console.log(`  ✓ ${name.padEnd(24)} ${deck.slides.length} slides · ${approach.theme.name}`);
      return { name, slug: slug(name), slides: deck.slides.length, accent: approach.accent,
               themeId: approach.themeId, themeName: approach.theme.name,
               title: deck.meta.title || '', angle: approach.angle };
    } catch (e) {
      console.log(`  ! ${name} attempt ${attempt} failed: ${e.message}`);
      if (attempt === 3) return null;
      await new Promise(r => setTimeout(r, 2500 * attempt));
    }
  }
}

const readDeck  = (slug) => JSON.parse(fs.readFileSync(path.join(OUT, slug + '.json'), 'utf8'));
const writeDeck = (slug, d) => fs.writeFileSync(path.join(OUT, slug + '.json'), JSON.stringify(d, null, 1));
const slideText = (s) => [s.subtitle, ...(s.bullets || []),
  ...(s.cards || []).map(c => `${c.heading}: ${c.body}`),
  ...(s.metrics || []).map(m => `${m.value} ${m.label}`)].filter(Boolean).join(' | ').slice(0, 300);

/*
 * Everyone pitches the same customer, so the same slide title turns up in two
 * decks even when the arguments differ. Whoever built first keeps the title;
 * the others get theirs rewritten against the full list of titles in use.
 */
async function dedupeTitles(built) {
  for (let pass = 1; pass <= 3; pass++) {
    const decks = built.map(b => ({ ...b, deck: readDeck(b.slug) }));
    const owner = new Map();          // lowercased title -> slug that keeps it
    const clashes = new Map();        // slug -> [{n, title, content}]
    const all = new Set();

    for (const d of decks) {
      d.deck.slides.forEach((s, i) => {
        const t = (s.title || '').trim();
        if (!t) return;
        all.add(t);
        const k = t.toLowerCase();
        if (!owner.has(k)) { owner.set(k, d.slug); return; }
        if (!clashes.has(d.slug)) clashes.set(d.slug, []);
        clashes.get(d.slug).push({ n: i + 1, title: t, content: slideText(s) });
      });
    }

    if (!clashes.size) {
      console.log(pass === 1 ? '\nNo duplicate slide titles.' : `\nNo duplicate slide titles after pass ${pass - 1}.`);
      return;
    }
    console.log(`\nPass ${pass}: retitling ${[...clashes.values()].flat().length} duplicated slide(s)…`);

    for (const [slug, slides] of clashes) {
      const d = decks.find(x => x.slug === slug);
      try {
        const titles = await rewriteTitles({
          presenter: d.name, angle: d.angle, slides, taken: [...all],
        });
        let changed = 0;
        for (const [n, title] of Object.entries(titles)) {
          const i = parseInt(n, 10) - 1;
          const fresh = String(title || '').trim();
          if (!fresh || !d.deck.slides[i] || all.has(fresh)) continue;
          console.log(`  ${d.name}: #${i + 1} "${d.deck.slides[i].title}" -> "${fresh}"`);
          d.deck.slides[i].title = fresh;
          all.add(fresh);
          changed++;
        }
        if (changed) writeDeck(slug, d.deck);
      } catch (e) {
        console.log(`  ! retitle failed for ${d.name}: ${e.message}`);
      }
    }
  }
  console.log('  (gave up after 3 passes — check for remaining duplicates)');
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  console.log(`Building ${roster.length} decks (${CONCURRENCY} at a time)…\n`);

  const queue = [...roster];
  const done = [];
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const r = await buildOne(queue.shift());
      if (r) done.push(r);
    }
  }));

  await dedupeTitles(done);

  // Keep the roster's order, not whichever finished first.
  done.sort((a, b) => roster.indexOf(a.name) - roster.indexOf(b.name));
  fs.writeFileSync(path.join(OUT, 'index.json'),
    JSON.stringify({ builtAt: new Date().toISOString(), decks: done }, null, 1));

  const missing = roster.filter(n => !done.some(d => d.name === n));
  console.log(`\n${done.length}/${roster.length} built.`);
  if (missing.length) { console.log('FAILED:', missing.join(', ')); process.exitCode = 1; }
})();
