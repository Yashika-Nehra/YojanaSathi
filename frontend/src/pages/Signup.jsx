import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, KeyRound, ShieldCheck, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth";
import { setPageSeo } from "../seo";

export default function Signup() {
  const { t, i18n } = useTranslation();
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPageSeo({
      title: t("seo.signupTitle"),
      description: t("seo.signupDescription"),
      path: "/signup",
      lang: i18n.language === "en" ? "en-IN" : `${i18n.language}-IN`,
    });
  }, [t, i18n.language]);

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (cleanName.length < 2) {
      setError(t("auth.nameRequired", "Please enter your name."));
      return;
    }

    if (password.length < 8) {
      setError(t("auth.passwordMin", "Password must be at least 8 characters."));
      return;
    }

    if (password !== confirm) {
      setError(t("auth.passwordMismatch"));
      return;
    }

    setBusy(true);
    try {
      await signup(cleanName, cleanEmail, password);
      navigate("/profile", { replace: true });
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
      <div className="auth-grid auth-grid-reverse">
        <div className="auth-story">
          <div className="auth-symbol" aria-hidden="true"><ShieldCheck size={25} /></div>
          <div className="card-label">{t("auth.memberAccess")}</div>
          <h1 className="auth-title font-serif">{t("auth.signupTitle")}</h1>
          <p className="auth-intro">{t("auth.signupIntro")}</p>
          <div className="auth-promise">
            <span className="auth-promise-icon"><KeyRound size={17} /></span>
            <p>{t("auth.signupPromise")}</p>
          </div>
        </div>

        <form className="auth-card" onSubmit={submit} noValidate>
          <div className="auth-card-top"><span /><span /><span /></div>
          <div className="auth-card-inner">
            <div className="auth-card-heading">
              <div className="auth-card-icon"><UserPlus size={19} /></div>
              <div>
                <div className="card-label">{t("auth.signup")}</div>
                <h2 className="font-serif">{t("auth.startHere")}</h2>
              </div>
            </div>

            <Field label={t("auth.name")} htmlFor="signup-name">
              <input
                id="signup-name"
                className="input auth-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
                minLength={2}
                maxLength={80}
              />
            </Field>

            <Field label={t("auth.email")} htmlFor="signup-email">
              <input
                id="signup-email"
                className="input auth-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </Field>

            <Field label={t("auth.password")} htmlFor="signup-password">
              <div className="auth-password-wrap">
                <input
                  id="signup-password"
                  className="input auth-input"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
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
              <p className="field-hint">{t("auth.passwordHint")}</p>
            </Field>

            <Field label={t("auth.confirmPassword")} htmlFor="signup-confirm">
              <input
                id="signup-confirm"
                className="input auth-input"
                type={show ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
              />
            </Field>

            {error && <div className="auth-error" role="alert" aria-live="polite">{error}</div>}

            <button className="auth-submit" type="submit" disabled={busy}>
              <span>{busy ? t("auth.creatingAccount") : t("auth.createAccount")}</span>
              <UserPlus size={18} aria-hidden="true" />
            </button>

            <div className="auth-divider"><span>{t("auth.or")}</span></div>
            <Link className="auth-guest" to="/">{t("auth.continueGuest")}</Link>
            <p className="auth-switch">{t("auth.haveAccount")} <Link to="/login">{t("auth.signIn")}</Link></p>
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
