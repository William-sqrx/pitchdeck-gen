/* ============================================================
   Everyone is handed the SAME case, so the decks must be pulled
   apart deliberately. Hashing each name independently is not
   enough — with ten people and twelve arguments, the birthday
   problem hands three of them the same leading argument. So the
   server is the coordination point: it hands out the LEAST-USED
   option on each axis, which guarantees distinct arguments until
   the pool is exhausted.
   ============================================================ */
const AXES = {
  angle: [
    "The real problem is not missing data, it is that nothing reaches the COO in time to act. Argue for closing the loop from floor to decision inside a single day.",
    "The real problem is variance, not average performance. Argue that the customer already has the answers - they live in the best store managers - and the job is replication.",
    "Lead with the cost of the status quo. Invent no numbers you were not given, but make the reader feel what a week of blind operating costs across the estate.",
    "Argue speed to value: a narrow pilot in a handful of stores that proves the loop in weeks, not a platform programme that lands next year.",
    "Take the frontline employee's point of view. A new hire's first six weeks is the sharpest version of every problem the COO raised.",
    "Take the store manager's point of view. They are the pivot between what head office wants and what actually happens, and today they are unsupported.",
    "Frame it as one operating system rather than four tools. The products are worth more joined up than bought separately, and that is the whole pitch.",
    "Lead with the Monday-morning test: what the COO knows on Monday today, versus what they would know under this proposal.",
    "Frame it as risk. Not knowing what happens across the estate is an exposure - brand, compliance, customer experience - not just an inconvenience.",
    "Argue standardisation: the stores are running as many different businesses as there are branches. Make consistency the prize and the products the means.",
    "Lead with adoption. All of this fails if the frontline will not use it, so make change management the spine of the proposal.",
    "Pick the single metric that moves everything else for this customer, defend that choice, and hang the entire proposal on it.",
  ],
  device: [
    "Follow one store through a single day, before and after.",
    "Structure as 30 / 60 / 90 days - three horizons of what changes.",
    "Before-and-after: the COO's week today, then the COO's week with this in place.",
    "Problem, then what it actually costs, then what fixes it, then proof. Repeat tightly.",
    "Start from the end state you are promising and work backwards to today.",
    "Follow one new hire from day one to competent, letting the products appear as they are needed.",
    "Contrast two stores - the best and the worst - and close the gap between them on stage.",
    "Structure around the things the customer said, but re-ordered by what you can fix fastest.",
  ],
  opener: [
    "Open on the customer's own words - put their quote on screen before anything else.",
    "Open on the numbers of their operation, so the scale of the problem lands first.",
    "Open with a short agenda so the COO knows exactly where you are taking them.",
    "Open with the one sentence you want them to remember, then justify it.",
    "Open by naming the thing everyone in the room already knows but has not said.",
    "Open on the end state - show them what good looks like, then explain how.",
  ],
  close: [
    "Close by asking for a pilot in a small, named set of stores.",
    "Close by asking for a two-week discovery with their ops team.",
    "Close by asking for one decision today and listing what happens the week after.",
    "Close on a phased rollout with a clear first phase and a checkpoint.",
    "Close by asking who owns this on their side, and proposing the first working session.",
    "Close on what they lose by waiting another quarter, then propose the smallest first step.",
    "Close by proposing a single success metric and the date you would review it against.",
    "Close by asking to run the proposal against one real store before scaling the conversation.",
  ],
};
const THEMES = require('../public/themes.js');
const STRUCTURES = require('../public/structures.js');

const ACCENTS = [
  { hex: '2563EB', name: 'blue'    }, { hex: '0F766E', name: 'teal'   },
  { hex: 'B45309', name: 'bronze'  }, { hex: '7C3AED', name: 'violet' },
  { hex: 'BE123C', name: 'crimson' }, { hex: '15803D', name: 'green'  },
];

const usage = { angle: [], device: [], opener: [], close: [], accent: [], theme: [], structure: [] };
for (const k of Object.keys(usage)) {
  const sizes = { accent: ACCENTS.length, theme: THEMES.length, structure: STRUCTURES.length };
  usage[k] = new Array(sizes[k] || AXES[k].length).fill(0);
}
const assigned = new Map(); // nameKey -> { spin, idx: {...} }

function leastUsed(axis, avoid) {
  const counts = usage[axis];
  let best = -1;
  for (let i = 0; i < counts.length; i++) {
    if (i === avoid && counts.length > 1) continue;
    if (best === -1 || counts[i] < counts[best]) best = i;
  }
  return best;
}

function assign(name, spin) {
  const key = name.trim().toLowerCase();
  const prev = assigned.get(key);
  if (prev && prev.spin === spin) return prev.idx;

  // A re-roll gives the previous choices back to the pool first.
  if (prev) for (const axis of Object.keys(usage)) usage[axis][prev.idx[axis]]--;

  const idx = {};
  for (const axis of Object.keys(usage)) {
    idx[axis] = leastUsed(axis, prev ? prev.idx[axis] : -1);
    usage[axis][idx[axis]]++;
  }
  idx.slides = 10 + (usage.angle[idx.angle] + idx.device) % 3;
  assigned.set(key, { spin, idx });
  return idx;
}

function approachFor(name, spin) {
  const idx = assign(name, spin);
  return {
    angle: AXES.angle[idx.angle],
    device: AXES.device[idx.device],
    opener: AXES.opener[idx.opener],
    close: AXES.close[idx.close],
    accent: ACCENTS[idx.accent],
    theme: THEMES[idx.theme],
    themeId: THEMES[idx.theme].id,
    structure: STRUCTURES[idx.structure],
    structureId: STRUCTURES[idx.structure].id,
    slides: idx.slides,
  };
}

module.exports = { AXES, ACCENTS, THEMES, STRUCTURES, approachFor };
