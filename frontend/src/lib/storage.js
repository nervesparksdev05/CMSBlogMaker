let draftCache = {};
let previewCache = null;

export function loadDraft() {
  return { ...draftCache };
}

export function saveDraft(patch) {
  draftCache = { ...draftCache, ...(patch || {}) };
  return { ...draftCache };
}

export function clearDraft() {
  draftCache = {};
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
