const SITE = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, "");

export function setPageSeo({ title, description, path = "/", lang = "en-IN" }) {
  document.title = title;
  document.documentElement.lang = lang;
  upsertMeta("description", description);
  upsertMeta("og:title", title, "property");
  upsertMeta("og:description", description, "property");
  upsertMeta("og:url", `${SITE}${path}`, "property");
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = `${SITE}${path}`;
}
function upsertMeta(name, content, attr = "name") {
  let el = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}