const DEFAULT_BASE = "http://127.0.0.1:8001";
export const API_BASE_URL = (import.meta?.env?.VITE_API_BASE_URL || DEFAULT_BASE).replace(/\/+$/, "");

export function getStoredAuth() {
  try {
    return JSON.parse(localStorage.getItem("cms_auth_v1") || "null");
  } catch {
    return null;
  }
}

export function setStoredAuth(auth) {
  localStorage.setItem("cms_auth_v1", JSON.stringify(auth));
}

export function clearStoredAuth() {
  localStorage.removeItem("cms_auth_v1");
}

export function getAccessToken() {
  return getStoredAuth()?.access_token || "";
}

async function parseError(resp) {
  try {
    const data = await resp.json();
    return data?.detail || data?.message || JSON.stringify(data);
  } catch {
    try {
      return await resp.text();
    } catch {
      return `HTTP ${resp.status}`;
    }
  }
}

export async function apiRequest(path, { method = "GET", json, formData, auth = true } = {}) {
  const headers = {};
  if (auth) {
    const token = getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let body;
  if (formData) {
    body = formData;
  } else if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  }

  const resp = await fetch(`${API_BASE_URL}${path}`, { method, headers, body });

  if (!resp.ok) {
    const msg = await parseError(resp);
    throw new Error(msg || `Request failed (${resp.status})`);
  }

  const ct = resp.headers.get("content-type") || "";
  if (ct.includes("application/json")) return resp.json();
  return resp.text();
}

export const apiGet = (path, opts) => apiRequest(path, { ...(opts || {}), method: "GET" });
export const apiPost = (path, json, opts) => apiRequest(path, { ...(opts || {}), method: "POST", json });
export const apiUpload = (path, file, field = "file", opts) => {
  const fd = new FormData();
  fd.append(field, file);
  return apiRequest(path, { ...(opts || {}), method: "POST", formData: fd });
};
