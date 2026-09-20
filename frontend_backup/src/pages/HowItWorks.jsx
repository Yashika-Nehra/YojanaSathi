import { useEffect,useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchModelInfo } from "../api";
import { LoadingState,WakeState } from "../components/LoadState";
import { setPageSeo } from "../seo";

export default function HowItWorks(){
  const {t,i18n}=useTranslation();const [info,setInfo]=useState(null),[failed,setFailed]=useState(false);
  const load=()=>{setFailed(false);fetchModelInfo().then(setInfo).catch(()=>setFailed(true));};
  useEffect(()=>{setPageSeo({title:t("seo.howTitle"),description:t("seo.howDescription"),path:"/how-it-works",lang:i18n.language==="en"?"en-IN":`${i18n.language}-IN`});load();},[i18n.language,t]);
  return <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-16"><div className="card-label">03 · {t("how.label")}</div><h1 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">{t("how.heading")}</h1><p className="mt-4 max-w-3xl text-lg text-ink/75">{t("how.intro")}</p>
    <div className="mt-10 grid gap-5">{[["1",t("how.ruleTitle"),t("how.ruleBody")],["2",t("how.mlTitle"),t("how.mlBody")],["3",t("how.llmTitle"),t("how.llmBody")]].map(([n,title,body])=><section key={n} className="border border-line bg-surface p-6 sm:p-8"><div className="flex gap-5"><div className="flex h-10 w-10 shrink-0 items-center justify-center border border-primary font-serif font-bold text-primary">{n}</div><div><h2 className="font-serif text-2xl font-bold">{title}</h2><p className="mt-2 text-ink/70">{body}</p></div></div></section>)}</div>
    <div className="mt-10"><h2 className="font-serif text-2xl font-bold">{t("how.modelInfo")}</h2>{failed?<WakeState onRetry={load}/>:!info?<LoadingState/>:<div className="mt-4 border border-line bg-surface p-6">{info.trained?<dl className="grid gap-5 sm:grid-cols-3"><Metric label={t("how.trainSize")} value={info.train_size??t("how.notReported")}/><Metric label={t("how.accuracy")} value={typeof info.accuracy==="number"?`${(info.accuracy*100).toFixed(1)}%`:t("how.notReported")}/><Metric label={t("how.classes")} value={Array.isArray(info.classes)?info.classes.join(", "):t("how.notReported")}/></dl>:<p className="text-ink/70">{info.note||t("how.notReported")}</p>}</div>}</div>
  </section>;
}
function Metric({label,value}){return <div><dt className="text-xs font-semibold uppercase tracking-wide text-primary">{label}</dt><dd className="mt-1 font-serif text-3xl font-bold">{value}</dd></div>;}