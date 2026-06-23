import { normalizeMonster } from '../utils/normalize.js';

const OPEN5E_ENDPOINTS = [
  'https://api.open5e.com/v2/creatures/?format=json',
  'https://api.open5e.com/v1/monsters/?format=json',
];

function pickCr(item) {
  const candidates = [
    item.cr,
    item.challenge_rating,
    item.challengeRating,
    item.challenge?.rating,
    item.stats?.cr,
    item.stats?.challenge_rating,
  ];
  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined || candidate === '') continue;
    if (typeof candidate === 'object') {
      const nested = candidate.cr ?? candidate.value ?? candidate.rating ?? null;
      if (nested !== null && nested !== undefined && nested !== '') return nested;
      continue;
    }
    return candidate;
  }
  return null;
}

function pickSource(item) {
  const direct = item.document__slug || item.document__title || item.source || null;
  if (direct) return direct;
  const doc = item.document;
  if (!doc) return null;
  if (typeof doc === 'string') return doc;
  if (typeof doc === 'object') {
    return doc.slug || doc.title || doc.name || null;
  }
  return null;
}

function normalizeOpen5eCreature(item) {
  const crValue = pickCr(item);
  const typeValue = item.type ?? item.creature_type ?? item.creatureType ?? null;
  const alignmentValue = item.alignment ?? item.alignments ?? null;
  const sourceValue = pickSource(item);

  return normalizeMonster({
    name: item.name,
    cr: crValue,
    type: typeValue,
    alignment: alignmentValue,
    source: sourceValue,
  }, 'open5e');
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Open5e request failed (${response.status})`);
  return response.json();
}

async function fetchOpen5eEndpoint(firstUrl, onProgress) {
  const all = [];
  let next = firstUrl;
  let page = 1;

  while (next) {
    onProgress?.(`Loading Open5e page ${page}...`);
    const payload = await fetchJson(next);
    const results = Array.isArray(payload) ? payload : payload.results || [];
    for (const item of results) {
      if (item?.name) all.push(normalizeOpen5eCreature(item));
    }
    next = Array.isArray(payload) ? null : payload.next;
    page += 1;
    await new Promise((r) => setTimeout(r, 0));
  }

  return all;
}

export async function fetchAllOpen5eMonsters(onProgress) {
  const errors = [];

  for (const endpoint of OPEN5E_ENDPOINTS) {
    try {
      const monsters = await fetchOpen5eEndpoint(endpoint, onProgress);
      if (monsters.length) return monsters;
      errors.push(`${endpoint}: no creatures returned`);
    } catch (err) {
      errors.push(`${endpoint}: ${err.message}`);
    }
  }

  throw new Error(`Could not load Open5e bestiary. ${errors.join(' | ')}`);
}
