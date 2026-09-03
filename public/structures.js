/*
 * A deck's ARCHITECTURE, separate from its colours (public/themes.js).
 * Eleven decks in eleven accents still read as one template, because every
 * slide had the same anatomy: title top-left, content in the same band,
 * footer bottom-right. Ethan's verdict was "now it's colourfully similar".
 *
 * So each deck also gets:
 *   grid  - where the title lives on EVERY page (including a rotated rail and
 *           a bottom-right corner), which changes the shape of the whole deck
 *   uses  - the layout vocabulary the writer is pushed toward, so one deck is
 *           built from chevrons and ladders and another from full-bleed
 *           statements; they cannot converge on the same slide sequence
 *
 * Shared by public/index.html (renderer) and lib/approach.js (allocator).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.STRUCTURES = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  return [
    {
      id: 'classic', grid: 'top', label: 'title above, content below',
      uses: ['agenda', 'quote', 'bullets', 'three', 'metrics'],
      brief: 'A conventional consulting deck: agenda early, the customer quoted in their own words, three-part product slides, one metrics slide.',
    },
    {
      id: 'timeline', grid: 'band', label: 'banner headers, phase timelines',
      uses: ['timeline', 'stack', 'metrics', 'ladder'],
      brief: 'Built out of TIMELINES. Most slides walk a sequence of phases left to right. Use "timeline" at least three times, and "ladder" where something escalates.',
    },
    {
      id: 'matrix', grid: 'sidecol', label: 'side titles, comparison tables',
      uses: ['table', 'bignum', 'stack', 'quad'],
      brief: 'Built out of TABLES. Argue by comparison — today versus after, best store versus worst, symptom versus fix. Use "table" at least three times.',
    },
    {
      id: 'statement', grid: 'centered', label: 'full-bleed statements',
      uses: ['statement', 'spotlight', 'quote', 'bignum'],
      brief: 'Built out of STATEMENTS. Alternate a full-bleed one-sentence slide with a slide that backs it up. Use "statement" at least four times. Almost no bullets.',
    },
    {
      id: 'split', grid: 'rail', label: 'rotated rail, split panels',
      uses: ['split', 'quad', 'three', 'chevron'],
      brief: 'Built out of SPLIT slides — a claim on the left panel, evidence listed on the right. Use "split" at least four times.',
    },
    {
      id: 'sections', grid: 'bottom', label: 'chaptered, title under content',
      uses: ['section', 'bullets', 'three', 'quote'],
      brief: 'Chaptered. Open each part of the argument with a "section" divider, then two or three slides inside it. Use "section" at least three times.',
    },
    {
      id: 'numbers', grid: 'sidecol', label: 'side titles, one big number a page',
      uses: ['bignum', 'spotlight', 'metrics', 'stack'],
      brief: 'Built out of NUMBERS. Most slides lead with a single figure taken from the scenario and explain what it costs. Use "bignum" at least four times. Never invent a figure you were not given.',
    },
    {
      id: 'ledger', grid: 'band', label: 'banner headers, mapped rows',
      uses: ['stack', 'table', 'chevron', 'three'],
      brief: 'Built out of STACKS — rows mapping one thing to another: problem to product, symptom to mechanism. Use "stack" at least three times.',
    },
    {
      id: 'story', grid: 'corner', label: 'corner titles, narrative',
      uses: ['quote', 'statement', 'split', 'spotlight'],
      brief: "A narrative. Carry the customer's own voice through the deck: quote them, answer the quote, quote them again. Use \"quote\" at least three times.",
    },
    {
      id: 'brief', grid: 'bottom', label: 'content first, title beneath',
      uses: ['quad', 'table', 'three', 'metrics'],
      brief: 'A tight working document. Dense, no ceremony, no agenda slide. Lead every page with content and let the title label it. Use "quad" at least three times.',
    },
    {
      id: 'panel', grid: 'rail', label: 'rotated rail, flows',
      uses: ['chevron', 'ladder', 'three', 'timeline'],
      brief: 'Built out of FLOWS. Every argument arrives as a sequence of connected steps. Use "chevron" at least three times.',
    },
    {
      id: 'banner', grid: 'corner', label: 'corner titles, big statements',
      uses: ['spotlight', 'statement', 'metrics', 'table'],
      brief: 'Alternate one enormous word or figure with a plain statement of what it means. Use "spotlight" at least three times. Keep bullets rare.',
    },
  ];
}));
