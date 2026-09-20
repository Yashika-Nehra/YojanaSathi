import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, BookOpen, GraduationCap, MapPin, Search, Sparkles, Target, UserRound } from "lucide-react";
import { CATEGORIES, EDUCATIONS, GENDERS, OCCUPATIONS, STATES } from "../constants";
import VoiceInput from "./VoiceInput";
import { useAuth } from "../auth";

const emptyProfile = {
  age: "", gender: "", state: "", area: "", income: "", category: "", education: "", occupation: "", goal_text: "", lang: "en",
};

export default function ProfileForm({ accountOnly = false }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, loading: authLoading, saveProfile } = useAuth();
  const loadedRef = useRef(null);
  const [profile, setProfile] = useState({ ...emptyProfile, lang: i18n.language });
  const [errors, setErrors] = useState({});
  const [voiceStatus, setVoiceStatus] = useState("");

  useEffect(() => {
    setProfile((p) => ({ ...p, lang: i18n.language }));
  }, [i18n.language]);

  useEffect(() => {
    if (authLoading || !user || loadedRef.current === user.id) return;
    setProfile((p) => ({ ...p, ...(user.profile || {}), lang: i18n.language }));
    loadedRef.current = user.id;
  }, [authLoading, user, i18n.language]);

  const validation = useMemo(() => {
    const e = {};
    if (profile.age && (Number(profile.age) < 1 || Number(profile.age) > 120)) e.age = t("form.errors.age");
    if (profile.income && Number(profile.income) < 0) e.income = t("form.errors.income");
    return e;
  }, [profile.age, profile.income, t]);

  const update = (key, value) => setProfile((p) => ({ ...p, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setErrors(validation);
    if (Object.keys(validation).length) return;
    const next = { ...profile, age: profile.age === "" ? null : Number(profile.age), income: profile.income === "" ? null : Number(profile.income), lang: i18n.language };
    try {
      if (user) await saveProfile(next);
      sessionStorage.setItem("ys_profile", JSON.stringify(next));
      if (!accountOnly) navigate("/results");
    } catch (error) {
      setErrors({ save: error.message || t("auth.saveProfileError") });
    }
  };

  const applyParsed = ({ text, result }) => {
    update("goal_text", text);
    if (result?.profile) {
      setProfile((p) => ({ ...p, ...result.profile, lang: i18n.language }));
      setErrors({});
    }
  };

  const labelFor = (group, code, fallback) => t(`form.options.${group}.${code}`, { defaultValue: fallback });

  return (
    <form className="profile-panel" onSubmit={submit} noValidate>
      <div className="profile-panel-top" aria-hidden="true"><span /><span /><span /></div>
      <div className="profile-panel-inner">
        <div className="profile-panel-header">
          <div className="profile-kicker"><Sparkles size={14} aria-hidden="true" /> {t("form.step")}</div>
          <h2 className="font-serif">{t("form.title")}</h2>
          <p>{t("form.intro")}</p>
          <VoiceInput lang={i18n.language} onParsed={applyParsed} onStatus={setVoiceStatus} />
          <p className="voice-status" aria-live="polite">
            {voiceStatus === "listening" ? t("voice.listening") : voiceStatus === "parsed" ? t("voice.parsed") : voiceStatus === "error" ? t("voice.error") : ""}
          </p>
          <div className="language-note"><BookOpen size={16} aria-hidden="true" /><span>{t("form.languageNote")}</span></div>
        </div>

        <FormSection icon={UserRound} title={t("form.basicDetails", { defaultValue: "Basic details" })}>
          <div className="form-grid-two">
            <Field label={t("form.age")} htmlFor="age" error={errors.age}>
              <input id="age" className="input" type="number" min="1" max="120" value={profile.age} onChange={(e) => update("age", e.target.value)} autoComplete="off" inputMode="numeric" />
            </Field>
            <Field label={t("form.gender")} htmlFor="gender">
              <Select id="gender" value={profile.gender} onChange={(e) => update("gender", e.target.value)}>
                <option value="">{t("form.select")}</option>
                {GENDERS.map(([c, l]) => <option key={c} value={c}>{labelFor("gender", c, l)}</option>)}
              </Select>
            </Field>
          </div>
        </FormSection>

        <FormSection icon={MapPin} title={t("form.locationDetails", { defaultValue: "Location" })}>
          <div className="form-grid-two">
            <Field label={t("form.state")} htmlFor="state">
              <Select id="state" value={profile.state} onChange={(e) => update("state", e.target.value)}>
                <option value="">{t("form.select")}</option>
                {STATES.map(([c, l]) => <option key={c} value={c}>{l}</option>)}
              </Select>
            </Field>
            <Field label={t("form.area")} htmlFor="area">
              <Select id="area" value={profile.area} onChange={(e) => update("area", e.target.value)}>
                <option value="">{t("form.select")}</option>
                {["rural", "urban"].map((c) => <option key={c} value={c}>{labelFor("area", c, c)}</option>)}
              </Select>
            </Field>
          </div>
        </FormSection>

        <FormSection icon={GraduationCap} title={t("form.backgroundDetails", { defaultValue: "Background" })}>
          <div className="form-grid-two">
            <Field label={t("form.income")} htmlFor="income" hint={t("form.incomeHint")} error={errors.income}>
              <input id="income" className="input" type="number" min="0" step="1000" value={profile.income} onChange={(e) => update("income", e.target.value)} inputMode="numeric" />
            </Field>
            <Field label={t("form.category")} htmlFor="category">
              <Select id="category" value={profile.category} onChange={(e) => update("category", e.target.value)}>
                <option value="">{t("form.select")}</option>
                {CATEGORIES.map(([c, l]) => <option key={c} value={c}>{labelFor("category", c, l)}</option>)}
              </Select>
            </Field>
            <Field label={t("form.education")} htmlFor="education">
              <Select id="education" value={profile.education} onChange={(e) => update("education", e.target.value)}>
                <option value="">{t("form.select")}</option>
                {EDUCATIONS.map(([c, l]) => <option key={c} value={c}>{labelFor("education", c, l)}</option>)}
              </Select>
            </Field>
            <Field label={t("form.occupation")} htmlFor="occupation">
              <Select id="occupation" value={profile.occupation} onChange={(e) => update("occupation", e.target.value)}>
                <option value="">{t("form.select")}</option>
                {OCCUPATIONS.map(([c, l]) => <option key={c} value={c}>{labelFor("occupation", c, l)}</option>)}
              </Select>
            </Field>
          </div>
        </FormSection>

        <FormSection icon={Target} title={t("form.goalSection", { defaultValue: "Your goal" })}>
          <Field label={t("form.goal")} htmlFor="goal" hint={t("form.goalHint")}>
            <textarea id="goal" className="input goal-input" value={profile.goal_text || ""} onChange={(e) => update("goal_text", e.target.value.slice(0, 500))} />
          </Field>
        </FormSection>

        {errors.save && <p className="field-error" role="alert">{errors.save}</p>}
        <div className="form-footer">
          <p>{t("form.optional")}</p>
          <button className="search-action" type="submit">
            <span>{t("form.search")}</span>
            <Search size={18} aria-hidden="true" />
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </form>
  );
}

function FormSection({ icon: Icon, title, children }) {
  return (
    <section className="form-section">
      <div className="form-section-heading">
        <span className="form-section-icon" aria-hidden="true"><Icon size={16} /></span>
        <h3>{title}</h3>
      </div>
      <div className="form-section-content">{children}</div>
    </section>
  );
}

function Field({ label, htmlFor, hint, error, children }) {
  return (
    <div className="field-wrap">
      <label className="field-label" htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <p className="field-hint">{hint}</p>}
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  );
}

function Select({ children, ...props }) {
  return <select className="input" {...props}>{children}</select>;
}
