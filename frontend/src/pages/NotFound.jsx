import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { setPageSeo } from "../seo";
export default function NotFound(){const {t,i18n}=useTranslation();useEffect(()=>setPageSeo({title:t("seo.notFoundTitle"),description:t("seo.notFoundDescription"),path:"/404",lang:i18n.language==="en"?"en-IN":`${i18n.language}-IN`}),[t,i18n.language]);return <section className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8"><div className="card-label">404</div><h1 className="mt-3 font-serif text-5xl font-bold">{t("notFound.title")}</h1><p className="mx-auto mt-3 max-w-xl text-ink/70">{t("notFound.body")}</p><Link to="/" className="btn btn-primary mt-7">{t("notFound.home")}</Link></section>;}