/*
 * One visual system per deck. Everyone pitches the same customer, so the decks
 * must not merely differ in accent colour — cover treatment, page background,
 * typeface pairing, bullet mark, card and metric styling all change together.
 * Fonts are restricted to faces that ship on both macOS and Windows, because a
 * missing face silently reflows the whole deck on someone else's laptop.
 *
 * Shared by public/index.html (the .pptx builder) and lib/approach.js (the
 * allocator), so a theme can never drift between the two.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.THEMES = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  return [
    {
      id: 'ink', name: 'navy / clean',
      bg: 'FFFFFF', ink: '0F172A', body: '475569', muted: '64748B', panel: 'F1F5F9',
      rule: 'E2E8F0', accent: '2563EB', quoteBg: 'F1F5F9',
      coverBg: '0F172A', coverInk: 'FFFFFF', coverSub: 'AFC0DB', coverStyle: 'block',
      head: 'Arial', text: 'Arial',
      chrome: 'bar', cards: 'filled', metrics: 'plain', bullet: 'square',
      titleSize: 29, coverSize: 44,
    },
    {
      id: 'paper', name: 'cream / serif',
      bg: 'FBF7F0', ink: '2B2118', body: '5A4B3C', muted: '8A7969', panel: 'F2EADD',
      rule: 'DFD2BF', accent: 'A8571B', quoteBg: 'F2EADD',
      coverBg: 'FBF7F0', coverInk: '2B2118', coverSub: '8A7969', coverStyle: 'center',
      head: 'Georgia', text: 'Georgia',
      chrome: 'rule', cards: 'outline', metrics: 'underline', bullet: 'dash',
      titleSize: 30, coverSize: 42,
    },
    {
      id: 'slate', name: 'all-dark / teal',
      bg: '14181F', ink: 'F4F7FA', body: 'A9B6C6', muted: '76869A', panel: '1D232D',
      rule: '2C3542', accent: '2DD4BF', quoteBg: '1D232D',
      coverBg: '0A0D12', coverInk: 'FFFFFF', coverSub: '8FA3B8', coverStyle: 'edge',
      head: 'Trebuchet MS', text: 'Trebuchet MS',
      chrome: 'sidebar', cards: 'outline', metrics: 'plain', bullet: 'dot',
      titleSize: 28, coverSize: 43,
    },
    {
      id: 'editorial', name: 'white / editorial',
      bg: 'FFFFFF', ink: '111111', body: '3C3C3C', muted: '8A8A8A', panel: 'FFFFFF',
      rule: 'D6D6D6', accent: 'B91C1C', quoteBg: 'FFFFFF',
      coverBg: 'FFFFFF', coverInk: '111111', coverSub: '6B6B6B', coverStyle: 'plain',
      head: 'Times New Roman', text: 'Arial',
      chrome: 'rule', cards: 'top-rule', metrics: 'underline', bullet: 'number',
      titleSize: 32, coverSize: 48,
    },
    {
      id: 'blueprint', name: 'blue-grey / technical',
      bg: 'EEF2F7', ink: '13263D', body: '3D546E', muted: '6C8199', panel: 'FFFFFF',
      rule: 'CBD7E3', accent: '1D4ED8', quoteBg: 'FFFFFF',
      coverBg: '13263D', coverInk: 'FFFFFF', coverSub: '9FB6CE', coverStyle: 'split',
      head: 'Verdana', text: 'Verdana',
      chrome: 'number', cards: 'filled', metrics: 'boxed', bullet: 'arrow',
      titleSize: 25, coverSize: 36,
    },
    {
      id: 'block', name: 'bold block / green',
      bg: 'FFFFFF', ink: '0B2418', body: '3F5A4C', muted: '76907F', panel: 'E8F3EC',
      rule: 'C9E0D3', accent: '10814A', quoteBg: '0B2418',
      coverBg: '10814A', coverInk: 'FFFFFF', coverSub: 'C6E9D6', coverStyle: 'block',
      head: 'Arial', text: 'Arial',
      chrome: 'bar', cards: 'numbered', metrics: 'boxed', bullet: 'square',
      titleSize: 33, coverSize: 50,
    },
    {
      id: 'mono', name: 'off-white / violet',
      bg: 'FAFAFB', ink: '1B1730', body: '4A4470', muted: '827CA5', panel: 'F1EFF8',
      rule: 'DDD8EC', accent: '6D28D9', quoteBg: 'F1EFF8',
      coverBg: '1B1730', coverInk: 'FFFFFF', coverSub: 'B7AEDB', coverStyle: 'band',
      head: 'Courier New', text: 'Arial',
      chrome: 'number', cards: 'outline', metrics: 'plain', bullet: 'dash',
      titleSize: 27, coverSize: 40,
    },
    {
      id: 'forest', name: 'deep green / serif',
      bg: 'F6F8F5', ink: '14261B', body: '3E5647', muted: '748A7C', panel: 'E7EFE8',
      rule: 'CBDBCF', accent: '2F6B45', quoteBg: '14261B',
      coverBg: '14261B', coverInk: 'FFFFFF', coverSub: 'A9C4B2', coverStyle: 'center',
      head: 'Georgia', text: 'Arial',
      chrome: 'rule', cards: 'filled', metrics: 'underline', bullet: 'dot',
      titleSize: 30, coverSize: 44,
    },
    {
      id: 'crimson', name: 'split / crimson',
      bg: 'FFFFFF', ink: '2A0E14', body: '5B3A41', muted: '967078', panel: 'FBEFF1',
      rule: 'EFD5DA', accent: 'B0203C', quoteBg: 'FBEFF1',
      coverBg: '2A0E14', coverInk: 'FFFFFF', coverSub: 'F0C4CC', coverStyle: 'split',
      head: 'Tahoma', text: 'Tahoma',
      chrome: 'sidebar', cards: 'top-rule', metrics: 'boxed', bullet: 'arrow',
      titleSize: 27, coverSize: 41,
    },
    {
      id: 'midnight', name: 'midnight / gold',
      bg: '11131A', ink: 'F5F1E6', body: 'B4AE9C', muted: '857F70', panel: '1A1D26',
      rule: '2B2F3B', accent: 'C9A227', quoteBg: '1A1D26',
      coverBg: '11131A', coverInk: 'F5F1E6', coverSub: 'A79E86', coverStyle: 'band',
      head: 'Georgia', text: 'Arial',
      chrome: 'rule', cards: 'outline', metrics: 'underline', bullet: 'dash',
      titleSize: 30, coverSize: 45,
    },
    {
      id: 'grid', name: 'white grid / orange',
      bg: 'FFFFFF', ink: '1A1A1A', body: '4D4D4D', muted: '8C8C8C', panel: 'FAFAFA',
      rule: 'E0E0E0', accent: 'D2691E', quoteBg: 'FAFAFA',
      coverBg: 'FFFFFF', coverInk: '1A1A1A', coverSub: '7A7A7A', coverStyle: 'edge',
      head: 'Arial', text: 'Arial',
      chrome: 'number', cards: 'top-rule', metrics: 'boxed', bullet: 'number',
      titleSize: 28, coverSize: 46,
    },
    {
      id: 'terracotta', name: 'warm sand / terracotta',
      bg: 'FDF6F0', ink: '3A2119', body: '69493C', muted: '9A7A6C', panel: 'F7E8DC',
      rule: 'E7CFBD', accent: 'C05621', quoteBg: 'F7E8DC',
      coverBg: '3A2119', coverInk: 'FFF6EF', coverSub: 'C9A794', coverStyle: 'plain',
      head: 'Trebuchet MS', text: 'Trebuchet MS',
      chrome: 'bar', cards: 'numbered', metrics: 'plain', bullet: 'dot',
      titleSize: 29, coverSize: 43,
    },
  ];
}));
