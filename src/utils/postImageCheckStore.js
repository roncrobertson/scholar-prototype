/**
 * Post-image check store: record prompt + image when generated, optional accept/reject for quality tuning.
 * Aligns with CHECK_11 (label-off) and CHECK_12 (image teaches before text).
 * In-memory with optional localStorage persistence (last N records).
 */

const STORAGE_KEY = 'scholar_picmonic_post_image_checks';
const MAX_PERSISTED = 50;

let records = [];
let nextId = 1;

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.records)) records = parsed.records;
      if (typeof parsed.nextId === 'number') nextId = parsed.nextId;
    }
  } catch {
    records = [];
  }
}

function saveToStorage() {
  try {
    const toSave = records.slice(-MAX_PERSISTED);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ records: toSave, nextId }));
  } catch {
    // ignore
  }
}

/** One-time load on first use */
let loaded = false;
function ensureLoaded() {
  if (!loaded) {
    loadFromStorage();
    loaded = true;
  }
}

/**
 * Add a post-image record when an image is generated.
 * Includes render blob for audit (mode, prompt_snippet, output_image_uri).
 * @param {{ concept_id?: string, concept_title: string, prompt: string, image_url: string }} payload
 * @returns {string} Record id for later outcome
 */
export function addPostImageRecord(payload) {
  ensureLoaded();
  const id = `pic-${nextId++}`;
  const promptStr = (payload.prompt || '').slice(0, 2000);
  const record = {
    id,
    concept_id: payload.concept_id ?? null,
    concept_title: payload.concept_title || 'Unknown',
    prompt: promptStr,
    image_url: payload.image_url || '',
    generated_at: new Date().toISOString(),
    outcome: null,
    render: {
      mode: 'image-gen',
      prompt_snippet: (payload.prompt || '').slice(0, 300),
      output_image_uri: payload.image_url || '',
    },
  };
  records.push(record);
  saveToStorage();
  return id;
}

/**
 * Record accept/reject outcome for a post-image record.
 * @param {string} id - From addPostImageRecord
 * @param {'accept' | 'reject'} outcome
 */
export function recordPostImageOutcome(id, outcome) {
  ensureLoaded();
  const r = records.find((x) => x.id === id);
  if (r) {
    r.outcome = outcome;
    r.outcome_at = new Date().toISOString();
    saveToStorage();
  }
}

/**
 * Get all records (for dev dashboard or export).
 * @returns {Array<{ id: string, concept_title: string, outcome: string|null, generated_at: string }>}
 */
export function getPostImageRecords() {
  ensureLoaded();
  return records.map((r) => ({
    id: r.id,
    concept_id: r.concept_id,
    concept_title: r.concept_title,
    outcome: r.outcome,
    generated_at: r.generated_at,
    outcome_at: r.outcome_at,
  }));
}

/**
 * Export records as JSON for tuning/analysis (e.g. download).
 * @returns {string}
 */
export function exportPostImageRecordsJson() {
  ensureLoaded();
  return JSON.stringify(records, null, 2);
}
