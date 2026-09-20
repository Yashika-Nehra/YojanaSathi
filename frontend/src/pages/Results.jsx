import { useCallback,useEffect,useMemo,useState } from "react";
import { Link,useSearchParams } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { searchSchemes } from "../api";
import SchemeCard from "../components/SchemeCard";
import { LoadingState,WakeState } from "../components/LoadState";
import { setPageSeo } from "../seo";

const tabs=["scholarship","internship","job","welfare"];

export default function Results(){
  const {t,i18n}=useTranslation();
  const [params,setParams]=useSearchParams();
  const [profile,setProfile]=useState(null),[data,setData]=useState(null),[mode,setMode]=useState(params.get("area")||"all"),[active,setActive]=useState(params.get("type")||"scholarship"),[loading,setLoading]=useState(true),[waking,setWaking]=useState(false),[error,setError]=useState("");
  useEffect(()=>{setPageSeo({title:t("seo.resultsTitle"),description:t("seo.resultsDescription"),path:"/results",lang:i18n.language==="en"?"en-IN":`${i18n.language}-IN`});try{const raw=sessionStorage.getItem("ys_profile");setProfile(raw?JSON.parse(raw):null);}catch{setProfile(null);}},[t,i18n.language]);
  const runSearch=useCallback(async(p)=>{if(!p){setLoading(false);return;}setLoading(true);setWaking(false);setError("");try{setData(await searchSchemes({...p,lang:i18n.language}));}catch(e){if(e.message==="SERVER_UNREACHABLE"||e.status===503)setWaking(true);else setError(e.message);}finally{setLoading(false);}},[i18n.language]);
  useEffect(()=>{runSearch(profile);},[runSearch,profile]);
  const filtered=useMemo(()=>{const items=data?.groups?.[active]||[];return mode==="all"?items:items.filter(s=>s.area==="both"||s.area===mode);},[data,active,mode]);
  if(!profile)return <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8"><div className="border border-line bg-surface p-8"><h1 className="font-serif text-3xl font-bold">{t("empty.noProfile")}</h1><p className="mt-2 text-ink/70">{t("empty.noProfileBody")}</p><Link className="btn btn-primary mt-5 w-fit" to="/">{t("empty.start")}</Link></div></section>;
  const selectTab=type=>{setActive(type);setParams({type,area:mode});},selectMode=next=>{setMode(next);setParams({type:active,area:next});};
  return <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
    <div className="results-hero mb-7 flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-end lg:justify-between"><div><div className="card-label">{t("results.label")}</div><h1 className="mt-2 font-serif text-4xl font-bold">{t("results.heading")}</h1><p className="mt-2 text-ink/70">{t("results.total",{count:data?.total??0})}</p></div><Link to="/" className="btn btn-outline w-fit"><RotateCcw size={17} aria-hidden="true"/>{t("results.edit")}</Link></div>
    <div className="mb-6 flex flex-col gap-4"><div className="flex flex-wrap border border-line bg-surface shadow-sm" role="tablist" aria-label={t("results.tabsLabel")}>{tabs.map(type=><button key={type} className={`tab-btn ${active===type?"tab-active":""}`} role="tab" aria-selected={active===type} onClick={()=>selectTab(type)}>{t(`types.${type}`)} <span className="ml-1 text-xs">({data?.counts?.[type]??0})</span></button>)}</div><div className="flex items-center gap-2" aria-label={t("results.areaLabel")}>{["all","rural","urban"].map(v=><button key={v} type="button" className={`filter-btn ${mode===v?"filter-active":""}`} onClick={()=>selectMode(v)}>{v==="all"?t("results.allAreas"):v==="rural"?t("form.rural"):t("form.urban")}</button>)}</div></div>
    {loading&&<LoadingState/>}{!loading&&waking&&<WakeState onRetry={()=>runSearch(profile)}/>}{!loading&&!waking&&error&&<div className="border border-brick bg-surface p-6 text-brick" role="alert">{error}</div>}
    {!loading&&!waking&&!error&&<>{filtered.length===0?<EmptyResults type={active}/>:<div className="grid gap-5">{filtered.map(s=><SchemeCard key={s.id} scheme={s}/>)}</div>}<div className="mt-8 border border-line bg-surface p-4 text-sm text-ink/70">{t("results.officialCheck")}</div>{data?.ranked_by_model&&<p className="mt-3 text-xs text-ink/55">{t("results.rankedNote")}</p>}</>}
  </section>;
}
function EmptyResults({type}){const {t}=useTranslation();return <div className="border border-line bg-surface p-8"><h2 className="font-serif text-2xl font-bold">{t("empty.title",{type:t(`types.${type}`)})}</h2><p className="mt-2 max-w-xl text-ink/70">{t("empty.body")}</p><Link className="btn btn-outline mt-5 w-fit" to="/">{t("empty.change")}</Link></div>;}