import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import hi from "./locales/hi.json";
import bn from "./locales/bn.json";
import ta from "./locales/ta.json";
import te from "./locales/te.json";
import mr from "./locales/mr.json";
import gu from "./locales/gu.json";

export const LANGS = [
  { code: "en", tag: "en-IN", label: "English", short: "EN" },
  { code: "hi", tag: "hi-IN", label: "हिन्दी", short: "HI" },
  { code: "bn", tag: "bn-IN", label: "বাংলা", short: "BN" },
  { code: "ta", tag: "ta-IN", label: "தமிழ்", short: "TA" },
  { code: "te", tag: "te-IN", label: "తెలుగు", short: "TE" },
  { code: "mr", tag: "mr-IN", label: "मराठी", short: "MR" },
  { code: "gu", tag: "gu-IN", label: "ગુજરાતી", short: "GU" },
];

export const LANGUAGE_THEMES = {
  en: { primary: "#1f533f", accent: "#c58a2b" },
  hi: { primary: "#8b3b2e", accent: "#d39a2d" },
  bn: { primary: "#17645f", accent: "#c76a4e" },
  ta: { primary: "#7c3432", accent: "#c6972e" },
  te: { primary: "#2b6045", accent: "#cf7040" },
  mr: { primary: "#684b35", accent: "#c58a2b" },
  gu: { primary: "#176064", accent: "#cf9632" },
};

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  bn: { translation: bn },
  ta: { translation: ta },
  te: { translation: te },
  mr: { translation: mr },
  gu: { translation: gu },
};

const saved = typeof window !== "undefined" ? localStorage.getItem("ys_lang") : null;
const initial = LANGS.some((l) => l.code === saved) ? saved : "en";

function syncDocumentLanguage(lng) {
  const code = LANGS.some((item) => item.code === lng) ? lng : "en";
  const lang = LANGS.find((item) => item.code === code) || LANGS[0];
  const colors = LANGUAGE_THEMES[code] || LANGUAGE_THEMES.en;

  if (typeof document !== "undefined") {
    document.documentElement.lang = lang.tag;
    document.documentElement.dataset.lang = code;
    document.documentElement.dataset.theme = code;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", colors.primary);
  }
  if (typeof window !== "undefined") localStorage.setItem("ys_lang", code);
}

i18n.use(initReactI18next).init({
  resources,
  lng: initial,
  fallbackLng: "en",
  supportedLngs: LANGS.map((lang) => lang.code),
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

i18n.on("languageChanged", syncDocumentLanguage);
syncDocumentLanguage(initial);

export default i18n;
