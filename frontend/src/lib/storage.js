const KEY = "cms_blog_draft_v1";

export function loadDraft() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "null") || {};
  } catch {
    return {};
  }
}

export function saveDraft(patch) {
  const next = { ...loadDraft(), ...(patch || {}) };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function clearDraft() {
  localStorage.removeItem(KEY);
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
