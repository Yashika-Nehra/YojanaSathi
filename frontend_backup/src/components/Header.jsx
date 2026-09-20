import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import { LANGS } from "../i18n";

export default function Header() {
  const { t, i18n } = useTranslation();
  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label="YojanaSathi home">
          <span className="logo-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32">
              <rect width="32" height="32" rx="4" fill="#1F4D3A" />
              <path d="M8 22 L14 12 L18 18 L24 8" stroke="#F6F2EA" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="24" cy="8" r="2.6" fill="#C8891B" />
            </svg>
          </span>
          <span className="font-serif text-2xl font-bold tracking-tight">YojanaSathi</span>
        </Link>
        <nav className="hidden items-center gap-5 md:flex" aria-label={t("nav.label")}>
          <NavLink className="nav-link" to="/how-it-works">{t("nav.howItWorks")}</NavLink>
          <NavLink className="nav-link" to="/terms">{t("nav.terms")}</NavLink>
          <NavLink className="nav-link" to="/privacy">{t("nav.privacy")}</NavLink>
        </nav>
        <label className="flex min-h-[44px] items-center gap-2 border border-line bg-surface px-3 py-2 text-sm">
          <Languages size={18} aria-hidden="true" />
          <span className="sr-only">{t("language.label")}</span>
          <select className="bg-transparent outline-none" value={i18n.language} onChange={(e) => i18n.changeLanguage(e.target.value)} aria-label={t("language.label")}>
            {LANGS.map((lang) => <option key={lang.code} value={lang.code}>{lang.label}</option>)}
          </select>
        </label>
      </div>
    </header>
  );
}