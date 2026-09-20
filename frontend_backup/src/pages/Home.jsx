import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import ProfileForm from "../components/ProfileForm";
import { setPageSeo } from "../seo";

export default function Home(){
  const {t,i18n}=useTranslation();
  useEffect(()=>setPageSeo({title:t("seo.homeTitle"),description:t("seo.homeDescription"),path:"/",lang:i18n.language==="en"?"en-IN":`${i18n.language}-IN`}),[t,i18n.language]);
  return <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-16">
    <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="pt-2 lg:sticky lg:top-8">
        <div className="card-label">01 · {t("home.label")}</div>
        <h1 className="mt-3 max-w-2xl font-serif text-4xl font-bold leading-tight sm:text-6xl">{t("home.heading")}</h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-ink/75">{t("home.subheading")}</p>
        <div className="mt-8 border-l-4 border-accent bg-surface p-5"><p className="font-semibold">{t("home.noteTitle")}</p><p className="mt-1 text-sm text-ink/70">{t("home.noteBody")}</p></div>
      </div>
      <ProfileForm/>
    </div>
  </section>;
}