const API = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const TOKEN_KEY = "ys_auth_token";

function formatApiError(body, status) {
  const detail = body?.detail;

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") return item.msg || item.message || null;
        return null;
      })
      .filter(Boolean);
    if (messages.length) return messages.join(". ");
  }

  if (detail && typeof detail === "object") {
    return detail.message || detail.msg || JSON.stringify(detail);
  }

  if (typeof detail === "string" && detail.trim()) return detail;
  return `Request failed with status ${status}`;
}

async function request(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API}${path}`, { ...options, headers });
  } catch (error) {
    const e = new Error("SERVER_UNREACHABLE");
    e.code = "SERVER_UNREACHABLE";
    e.cause = error;
    throw e;
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const e = new Error(formatApiError(body, response.status));
    e.status = response.status;
    e.code = response.status === 401 ? "UNAUTHORIZED" : "API_ERROR";
    e.details = body?.detail ?? null;
    if (response.status === 401) localStorage.removeItem(TOKEN_KEY);
    throw e;
  }

  return body;
}

export const searchSchemes = (profile, types = null) =>
  request("/api/search", {
    method: "POST",
    body: JSON.stringify({ profile, types }),
  });

export const parseProfile = (text, lang) =>
  request("/api/parse-profile", {
    method: "POST",
    body: JSON.stringify({ text, lang }),
  });

export const fetchModelInfo = () => request("/api/model-info");
export const fetchScheme = (id, lang = "en") =>
  request(`/api/schemes/${encodeURIComponent(id)}?lang=${encodeURIComponent(lang)}`);
export const health = () => request("/api/health");

export const signupUser = (name, email, password) =>
  request("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

export const loginUser = (email, password) =>
  request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const getMe = () => request("/api/auth/me");

export const updateMyProfile = (profile) =>
  request("/api/auth/profile", {
    method: "PUT",
    body: JSON.stringify(profile),
  });

export const logoutUser = () => request("/api/auth/logout", { method: "POST" });

export { TOKEN_KEY };
