import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown, Languages, LogIn, LogOut, Menu, Sparkles, UserRound, X } from "lucide-react";
import { LANGS } from "../i18n";
import { useAuth } from "../auth";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const boxRef = useRef(null);
  const current = LANGS.find((lang) => lang.code === (i18n.resolvedLanguage || i18n.language)) || LANGS[0];

  useEffect(() => {
    const onPointerDown = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const changeLanguage = async (code) => {
    await i18n.changeLanguage(code);
    setOpen(false);
    setMobileOpen(false);
  };

  return (
    <header className="site-header">
      <div className="header-inner mx-auto max-w-[1480px] px-4 sm:px-7 lg:px-10">
        <Link to="/" className="brand-link" aria-label="YojanaSathi home">
          <span className="logo-frame" aria-hidden="true">
            <span className="logo-frame-inner">
              <svg viewBox="0 0 42 42" fill="none">
                <path d="M9 29L17 16L22.5 23L33 9" stroke="var(--paper)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="33" cy="9" r="3.1" fill="var(--accent)" />
              </svg>
            </span>
          </span>
          <span>
            <span className="brand-name font-serif">YojanaSathi</span>
            <span className="brand-sub">{t("home.label")}</span>
          </span>
        </Link>

        <nav className="header-nav" aria-label={t("nav.label")}>
          <NavLink className="nav-link" to="/how-it-works">{t("nav.howItWorks")}</NavLink>
          <NavLink className="nav-link" to="/terms">{t("nav.terms")}</NavLink>
          <NavLink className="nav-link" to="/privacy">{t("nav.privacy")}</NavLink>
        </nav>

        <div className="header-actions">
          <div className="language-wrap" ref={boxRef}>
            <button
              type="button"
              className="language-trigger"
              onClick={() => setOpen((value) => !value)}
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-label={t("language.label")}
            >
              <Languages size={17} aria-hidden="true" />
              <span className="language-trigger-copy">
                <small>{current.short || current.code.toUpperCase()}</small>
                <strong>{current.label}</strong>
              </span>
              <ChevronDown size={16} aria-hidden="true" className={open ? "rotate-180" : ""} />
            </button>
            {open && (
              <div className="language-menu" role="listbox" aria-label={t("language.label")}>
                <div className="language-menu-head">
                  <Sparkles size={15} aria-hidden="true" />
                  <span>{t("language.label")}</span>
                </div>
                {LANGS.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    role="option"
                    aria-selected={current.code === lang.code}
                    className={`language-option ${current.code === lang.code ? "language-option-active" : ""}`}
                    onClick={() => changeLanguage(lang.code)}
                  >
                    <span className="language-option-code">{lang.short || lang.code.toUpperCase()}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <div className="ys-account-actions">
              <Link className="ys-account-link" to="/profile" title={user.email}>
                <span className="ys-account-avatar"><UserRound size={15} /></span>
                <span className="ys-account-name">{user.name}</span>
              </Link>
              <button type="button" className="ys-logout-link" onClick={async () => { await logout(); navigate("/"); }} aria-label={t("auth.logout")} title={t("auth.logout")}><LogOut size={15} /></button>
            </div>
          ) : (
            <Link className="ys-signin-link" to="/login"><LogIn size={15} />{t("auth.signIn")}</Link>
          )}

          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-panel">
          <nav aria-label={t("nav.label")}>
            <NavLink className="mobile-nav-link" to="/how-it-works" onClick={() => setMobileOpen(false)}>{t("nav.howItWorks")}</NavLink>
            <NavLink className="mobile-nav-link" to="/terms" onClick={() => setMobileOpen(false)}>{t("nav.terms")}</NavLink>
            <NavLink className="mobile-nav-link" to="/privacy" onClick={() => setMobileOpen(false)}>{t("nav.privacy")}</NavLink>
            {user ? (<>
              <NavLink className="mobile-nav-link" to="/profile" onClick={() => setMobileOpen(false)}>{t("auth.account")}</NavLink>
              <button className="mobile-nav-link mobile-logout" type="button" onClick={async () => { await logout(); setMobileOpen(false); navigate("/"); }}><LogOut size={16} />{t("auth.logout")}</button>
            </>) : (
              <NavLink className="mobile-nav-link" to="/login" onClick={() => setMobileOpen(false)}>{t("auth.signIn")}</NavLink>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
