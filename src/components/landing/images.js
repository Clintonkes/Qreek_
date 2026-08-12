/* ─── Landing imagery manifest ─────────────────────────────────────────────
   Every photograph on the landing page is declared here, once. Components
   reference a slot key, never a raw URL, so a bad photo is fixed in exactly
   one place.

   Photos are hotlinked from the Unsplash CDN, which resizes and re-encodes
   (WebP/AVIF) on the fly via the query string. All ids below were verified
   to return 200 at w=1600.

   pos  → object-position, used to keep the subject visible after the crop.
          Hero photos sit under a left-to-right scrim, so their subjects are
          pushed right of centre to stay clear of the headline.
─────────────────────────────────────────────────────────────────────────── */

const BASE = 'https://images.unsplash.com';

export const url = (id, w, q = 68) =>
  `${BASE}/${id}?auto=format&fit=crop&w=${w}&q=${q}`;

export const WIDTHS = [640, 1024, 1600, 2400];

export const srcSetFor = (id) =>
  WIDTHS.map(w => `${url(id, w)} ${w}w`).join(', ');

export const IMG = {
  /* ── Hero slides ─────────────────────────────────────────────────────── */
  heroPool: {
    id: 'photo-1585540083814-ea6ee8af9e4f',
    alt: 'A trader sitting above baskets of peppers and tomatoes at a Nigerian market',
    credit: 'Omotayo Tajudeen',
    pos: '62% 42%',
  },
  heroLink: {
    id: 'photo-1687422808248-f807f4ea2a2e',
    alt: 'A street food vendor checking a payment on his smartphone',
    credit: 'Ali Mkumbwa',
    pos: '42% 45%',
  },
  heroPayroll: {
    id: 'photo-1573164574397-dd250bc8a598',
    alt: 'Three colleagues reviewing work on laptops around an office desk',
    credit: 'Christina @ wocintechchat.com',
    pos: '68% 40%',
  },

  /* ── Product rail cards ──────────────────────────────────────────────── */
  railPools: {
    id: 'photo-1612365245810-0d73ad771b2d',
    alt: 'Women in patterned headwraps seated together at a community gathering',
    credit: 'Carles Martinez',
    pos: '50% 45%',
  },
  railLinks: {
    id: 'photo-1620829813795-9855fe1ff0e3',
    alt: 'A person paying on a phone held in both hands',
    credit: 'Kojo Kwarteng',
    pos: '45% 50%',
  },
  railPayroll: {
    id: 'photo-1642929264315-ada2f8c9ecb9',
    alt: 'A professional working on a tablet in a modern Lagos office',
    credit: 'Francis Odeyemi',
    pos: '50% 40%',
  },
  railFeed: {
    id: 'photo-1655720357872-ce227e4164ba',
    alt: 'Three women reviewing figures together on a laptop',
    credit: 'Iwaria Inc.',
    pos: '55% 45%',
  },
  railPin: {
    id: 'photo-1602177281687-c8900253495b',
    alt: 'A person unlocking a phone in low light',
    credit: 'Chad Madden',
    pos: '50% 50%',
  },
  railReceipts: {
    id: 'photo-1687422808278-d17b09489ed1',
    alt: 'A shop owner confirming a payment on his phone behind the counter',
    credit: 'Ali Mkumbwa',
    pos: '52% 42%',
  },

  /* ── Alternating product panels ──────────────────────────────────────── */
  panelPools: {
    id: 'photo-1655720357740-bdf90f34483f',
    alt: 'Three friends talking over drinks while planning a group contribution',
    credit: 'Iwaria Inc.',
    pos: '50% 42%',
  },
  panelLinks: {
    id: 'photo-1687422808289-e721259c9eb4',
    alt: 'A tailor at his sewing machine in his own workshop',
    credit: 'Ali Mkumbwa',
    pos: '52% 45%',
  },
  panelPayroll: {
    id: 'photo-1573164574511-73c773193279',
    alt: 'A team around a boardroom table during a payroll review',
    credit: 'Christina @ wocintechchat.com',
    pos: '50% 45%',
  },

  /* ── Mode switcher ───────────────────────────────────────────────────── */
  modeCommunal: {
    id: 'photo-1515657241610-a6b33f0f6c5a',
    alt: 'A dense crowd in brightly patterned fabric at a community event',
    credit: 'Ian Macharia',
    pos: '50% 45%',
  },
  modeSolo: {
    id: 'photo-1620829813573-7c9e1877706f',
    alt: 'A young freelancer working alone on a laptop',
    credit: 'Kojo Kwarteng',
    pos: '45% 42%',
  },
  modeMerchant: {
    id: 'photo-1687422808191-93810cd07ab0',
    alt: 'A shop owner standing with folded arms outside his storefront',
    credit: 'Ali Mkumbwa',
    pos: '58% 45%',
  },
  modeEnterprise: {
    id: 'photo-1683107695974-98a9fddb249a',
    alt: 'A finance manager working through records at her desk',
    credit: 'Sweet Life',
    pos: '55% 45%',
  },

  /* ── Customer stories (order matches CASES in Landing.jsx) ───────────── */
  storyAjo: {
    id: 'photo-1687422808225-318a2436ff23',
    alt: 'A market vendor holding produce at his stall',
    credit: 'Ali Mkumbwa',
    pos: '55% 45%',
  },
  storyMerchant: {
    id: 'photo-1583875087261-49562e69ebe5',
    alt: 'A tailor and his customer in a neighbourhood tailoring shop',
    credit: 'Claudia Altamimi',
    pos: '55% 45%',
  },
  storyChurch: {
    id: 'photo-1604072424771-7300bc5de457',
    alt: 'A congregation seated in wooden pews during a service',
    credit: 'Danique Godwin',
    pos: '50% 45%',
  },
  storyEnterprise: {
    id: 'photo-1666867540898-aaa1993ffabc',
    alt: 'A corporate professional standing with folded arms',
    credit: 'Raymond Owusu-Afriyie',
    pos: '50% 35%',
  },
  storyStudents: {
    id: 'photo-1584365098838-50ccef838f4a',
    alt: 'A group of university students standing together on campus',
    credit: 'Dr Josiah Sarpong',
    pos: '50% 40%',
  },
  storyAgency: {
    id: 'photo-1683535161123-585f7b10080d',
    alt: 'An agency owner working from a home studio desk',
    credit: 'Sweet Life',
    pos: '50% 45%',
  },

  /* ── Full-bleed closing band ─────────────────────────────────────────── */
  ctaBand: {
    id: 'photo-1734255026082-82fdc81991f0',
    alt: 'A busy open-air market with a POS sign above the stalls',
    credit: 'Tunde Buremo',
    pos: '50% 55%',
  },
};

/* Deduplicated photographer list for the footer credit line. */
export const CREDITS = [...new Set(Object.values(IMG).map(i => i.credit))].sort();
