import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { CATEGORIES, EDUCATIONS, GENDERS, OCCUPATIONS, STATES } from "../constants";
import VoiceInput from "./VoiceInput";

const emptyProfile={age:"",gender:"",state:"",area:"",income:"",category:"",education:"",occupation:"",goal_text:"",lang:"en"};

export default function ProfileForm() {
  const { t, i18n } = useTranslation();
  const navigate=useNavigate();
  const [profile,setProfile]=useState({...emptyProfile,lang:i18n.language});
  const [errors,setErrors]=useState({});
  const [voiceStatus,setVoiceStatus]=useState("");
  useEffect(()=>setProfile(p=>({...p,lang:i18n.language})),[i18n.language]);
  const validation=useMemo(()=>{
    const e={};
    if(profile.age && (Number(profile.age)<1 || Number(profile.age)>120)) e.age=t("form.errors.age");
    if(profile.income && Number(profile.income)<0) e.income=t("form.errors.income");
    return e;
  },[profile.age,profile.income,t]);
  const update=(key,value)=>setProfile(p=>({...p,[key]:value}));
  const submit=e=>{e.preventDefault();setErrors(validation);if(Object.keys(validation).length)return;sessionStorage.setItem("ys_profile",JSON.stringify({...profile,lang:i18n.language}));navigate("/results");};
  const applyParsed=({text,result})=>{update("goal_text",text);if(result?.profile){setProfile(p=>({...p,...result.profile,lang:i18n.language}));setErrors({});}};
  return (
    <form className="border border-line bg-surface p-5 sm:p-7" onSubmit={submit} noValidate>
      <div className="mb-6 flex flex-col gap-3 border-b border-line pb-5">
        <div className="card-label">{t("form.step")}</div><div><h2 className="font-serif text-2xl font-bold">{t("form.title")}</h2><p className="mt-1 text-sm text-ink/70">{t("form.intro")}</p></div>
        <VoiceInput lang={i18n.language} onParsed={applyParsed} onStatus={setVoiceStatus}/>
        <p className="text-sm text-ink/70" aria-live="polite">{voiceStatus==="listening"?t("voice.listening"):voiceStatus==="parsed"?t("voice.parsed"):voiceStatus==="error"?t("voice.error"):""}</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("form.age")} htmlFor="age" error={errors.age}><input id="age" className="input" type="number" min="1" max="120" value={profile.age} onChange={e=>update("age",e.target.value)}/></Field>
        <Field label={t("form.gender")} htmlFor="gender"><select id="gender" className="input" value={profile.gender} onChange={e=>update("gender",e.target.value)}><option value="">{t("form.select")}</option>{GENDERS.map(([c,l])=><option key={c} value={c}>{l}</option>)}</select></Field>
        <Field label={t("form.state")} htmlFor="state"><select id="state" className="input" value={profile.state} onChange={e=>update("state",e.target.value)}><option value="">{t("form.select")}</option>{STATES.map(([c,l])=><option key={c} value={c}>{l}</option>)}</select></Field>
        <Field label={t("form.area")} htmlFor="area"><select id="area" className="input" value={profile.area} onChange={e=>update("area",e.target.value)}><option value="">{t("form.select")}</option><option value="rural">{t("form.rural")}</option><option value="urban">{t("form.urban")}</option></select></Field>
        <Field label={t("form.income")} htmlFor="income" hint={t("form.incomeHint")} error={errors.income}><input id="income" className="input" type="number" min="0" step="1000" value={profile.income} onChange={e=>update("income",e.target.value)}/></Field>
        <Field label={t("form.category")} htmlFor="category"><select id="category" className="input" value={profile.category} onChange={e=>update("category",e.target.value)}><option value="">{t("form.select")}</option>{CATEGORIES.map(([c,l])=><option key={c} value={c}>{l}</option>)}</select></Field>
        <Field label={t("form.education")} htmlFor="education"><select id="education" className="input" value={profile.education} onChange={e=>update("education",e.target.value)}><option value="">{t("form.select")}</option>{EDUCATIONS.map(([c,l])=><option key={c} value={c}>{l}</option>)}</select></Field>
        <Field label={t("form.occupation")} htmlFor="occupation"><select id="occupation" className="input" value={profile.occupation} onChange={e=>update("occupation",e.target.value)}><option value="">{t("form.select")}</option>{OCCUPATIONS.map(([c,l])=><option key={c} value={c}>{l}</option>)}</select></Field>
        <Field className="sm:col-span-2" label={t("form.goal")} htmlFor="goal" hint={t("form.goalHint")}><textarea id="goal" className="input min-h-[110px]" value={profile.goal_text||""} onChange={e=>update("goal_text",e.target.value.slice(0,500))}/></Field>
      </div>
      <div className="mt-7 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-ink/70">{t("form.optional")}</p><button className="btn btn-primary" type="submit"><Search size={19} aria-hidden="true"/>{t("form.search")}</button></div>
    </form>
  );
}
function Field({label,htmlFor,hint,error,children,className=""}){return <div className={className}><label className="mb-2 block text-sm font-semibold" htmlFor={htmlFor}>{label}</label>{children}{hint&&<p className="mt-1 text-xs text-ink/60">{hint}</p>}{error&&<p className="mt-1 text-sm text-brick" role="alert">{error}</p>}</div>;}
