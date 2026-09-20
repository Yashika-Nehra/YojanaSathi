const API = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) }
    });
  } catch (error) {
    const e = new Error("SERVER_UNREACHABLE");
    e.cause = error;
    throw e;
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const e = new Error(body.detail || `Request failed with status ${response.status}`);
    e.status = response.status;
    throw e;
  }
  return response.json();
}
export const searchSchemes = (profile, types = null) =>
  request("/api/search", { method: "POST", body: JSON.stringify({ profile, types }) });
export const parseProfile = (text, lang) =>
  request("/api/parse-profile", { method: "POST", body: JSON.stringify({ text, lang }) });
export const fetchModelInfo = () => request("/api/model-info");
export const fetchScheme = (id, lang = "en") =>
  request(`/api/schemes/${encodeURIComponent(id)}?lang=${lang}`);
export const health = () => request("/api/health");