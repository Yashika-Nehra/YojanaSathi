import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, KeyRound, LogIn, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth";
import { setPageSeo } from "../seo";

export default function Login() {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPageSeo({
      title: t("seo.loginTitle"),
      description: t("seo.loginDescription"),
      path: "/login",
      lang: i18n.language === "en" ? "en-IN" : `${i18n.language}-IN`,
    });
  }, [t, i18n.language]);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      await login(email.trim(), password);
      const destination = typeof location.state?.from === "string" ? location.state.from : "/";
      navigate(destination, { replace: true });
    } catch (e) {
      if (e?.code === "SERVER_UNREACHABLE") {
        setError(t("auth.serverUnavailable", "The server is not reachable. Please make sure the backend is running and try again."));
      } else {
        setError(String(e?.message || t("auth.genericError")));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="auth-shell mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16">
      <div className="auth-grid">
        <div className="auth-story">
          <div className="auth-symbol" aria-hidden="true"><ShieldCheck size={25} /></div>
          <div className="card-label">{t("auth.memberAccess")}</div>
          <h1 className="auth-title font-serif">{t("auth.loginTitle")}</h1>
          <p className="auth-intro">{t("auth.loginIntro")}</p>
          <div className="auth-promise">
            <span className="auth-promise-icon"><KeyRound size={17} /></span>
            <p>{t("auth.loginPromise")}</p>
          </div>
        </div>

        <form className="auth-card" onSubmit={submit} noValidate>
          <div className="auth-card-top"><span /><span /><span /></div>
          <div className="auth-card-inner">
            <div className="auth-card-heading">
              <div className="auth-card-icon"><LogIn size={19} /></div>
              <div>
                <div className="card-label">{t("auth.login")}</div>
                <h2 className="font-serif">{t("auth.welcomeBack")}</h2>
              </div>
            </div>

            <Field label={t("auth.email")} htmlFor="login-email">
              <input
                id="login-email"
                className="input auth-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </Field>

            <Field label={t("auth.password")} htmlFor="login-password">
              <div className="auth-password-wrap">
                <input
                  id="login-password"
                  className="input auth-input"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="auth-eye"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? t("auth.hidePassword") : t("auth.showPassword")}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Field>

            {error && <div className="auth-error" role="alert" aria-live="polite">{error}</div>}

            <button className="auth-submit" type="submit" disabled={busy}>
              <span>{busy ? t("auth.signingIn") : t("auth.signIn")}</span>
              <LogIn size={18} aria-hidden="true" />
            </button>

            <div className="auth-divider"><span>{t("auth.or")}</span></div>
            <Link className="auth-guest" to="/">{t("auth.continueGuest")}</Link>
            <p className="auth-switch">{t("auth.noAccount")} <Link to="/signup">{t("auth.createAccount")}</Link></p>
          </div>
        </form>
      </div>
    </section>
  );
}

function Field({ label, htmlFor, children }) {
  return (
    <div className="field-wrap auth-field">
      <label className="field-label" htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}
