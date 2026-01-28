let draftCache = {};
let previewCache = null;
const DRAFT_EVENT = "cms:draft";

function notifyDraft() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(DRAFT_EVENT, { detail: { ...draftCache } }));
}

export function loadDraft() {
  return { ...draftCache };
}

export function saveDraft(patch) {
  draftCache = { ...draftCache, ...(patch || {}) };
  notifyDraft();
  return { ...draftCache };
}

export function clearDraft() {
  draftCache = {};
  notifyDraft();
}

export function requireDraft(keys = []) {
  const d = loadDraft();
  for (const k of keys) {
    if (d[k] === undefined || d[k] === null || d[k] === "") {
      throw new Error(`Missing draft field: ${k}`);
    }
  }
  return d;
}

export function setPreviewData(data) {
  previewCache = data || null;
  return previewCache;
}

export function getPreviewData() {
  return previewCache;
}

export function clearPreviewData() {
  previewCache = null;
}
