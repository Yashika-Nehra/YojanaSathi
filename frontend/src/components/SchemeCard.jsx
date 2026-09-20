import { ExternalLink, Volume2 } from "lucide-react";
import { useTranslation } from "react-i18next";

function speak(text, lang) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = ({en:"en-IN",hi:"hi-IN",bn:"bn-IN",ta:"ta-IN",te:"te-IN",mr:"mr-IN",gu:"gu-IN"})[lang] || "en-IN";
  window.speechSynthesis.speak(u);
}
export default function SchemeCard({ scheme }) {
  const { t, i18n } = useTranslation();
  const text = [scheme.name, scheme.benefits, ...scheme.documents, ...scheme.matched_reasons, scheme.deadline ? `${t("card.deadline")}: ${scheme.deadline}` : ""].filter(Boolean).join(". ");
  return (
    <article className={`scheme-card scheme-${scheme.type}`}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div><div className="card-label">{t(`types.${scheme.type}`)}</div><h3 className="mt-1 font-serif text-2xl font-bold leading-tight">{scheme.name}</h3></div>
        <button className="btn btn-outline !min-h-[40px] !px-3 !py-2 text-sm" type="button" onClick={() => speak(text, i18n.language)}><Volume2 size={16} aria-hidden="true" />{t("card.readAloud")}</button>
      </div>
      <div className="mb-4 flex flex-wrap gap-2 text-xs"><span className="chip">{scheme.level}</span><span className="chip">{scheme.state === "all" ? t("card.allIndia") : scheme.state}</span><span className="chip">{scheme.area}</span></div>
      <section className="mb-4"><h4 className="text-sm font-bold">{t("card.why")}</h4><ul className="reason-list mt-2 space-y-1 text-sm text-ink/80">{scheme.matched_reasons?.map((r,i)=><li key={i}>• {r}</li>)}</ul></section>
      <div className="grid gap-4 border-t border-line pt-4 text-sm md:grid-cols-2">
        <div><h4 className="font-bold">{t("card.benefits")}</h4><p className="mt-1 text-ink/80">{scheme.benefits}</p></div>
        <div><h4 className="font-bold">{t("card.documents")}</h4><ul className="mt-1 space-y-1 text-ink/80">{scheme.documents?.map((d,i)=><li key={i}>• {d}</li>)}</ul></div>
      </div>
      <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4 text-sm md:flex-row md:items-center md:justify-between">
        <div className="space-y-1 text-ink/60">
          <p><strong>{t("card.deadline")}:</strong> {scheme.deadline || t("card.deadlineUnknown")}</p>
          {scheme.last_verified && <p><strong>{t("card.verified")}:</strong> {scheme.last_verified}</p>}
        </div>
        <a className="btn btn-primary w-full md:w-auto" href={scheme.apply_url} target="_blank" rel="noreferrer noopener">{t("card.apply")} <ExternalLink size={16} aria-hidden="true" /></a>
      </div>
    </article>
  );
}