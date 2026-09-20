import { useEffect, useState } from "react";
import { Database, FileCheck2, Languages, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { fetchModelInfo } from "../api";
import { LoadingState, WakeState } from "../components/LoadState";
import { setPageSeo } from "../seo";

const layers = [
  { icon: FileCheck2, title: "ruleTitle", body: "ruleBody" },
  { icon: Database, title: "mlTitle", body: "mlBody" },
  { icon: Languages, title: "llmTitle", body: "llmBody" },
];

export default function HowItWorks() {
  const { t, i18n } = useTranslation();
  const [info, setInfo] = useState(null);
  const [failed, setFailed] = useState(false);

  const load = () => {
    setFailed(false);
    fetchModelInfo().then(setInfo).catch(() => setFailed(true));
  };

  useEffect(() => {
    setPageSeo({ title: t("seo.howTitle"), description: t("seo.howDescription"), path: "/how-it-works", lang: i18n.language === "en" ? "en-IN" : `${i18n.language}-IN` });
    load();
  }, [i18n.language, t]);

  return (
    <section className="content-shell mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-16">
      <div className="card-label">{t("how.label")}</div>
      <h1 className="content-title mt-3 font-serif">{t("how.heading")}</h1>
      <p className="content-intro">{t("how.intro")}</p>

      <div className="how-grid mt-10">
        {layers.map(({ icon: Icon, title, body }) => (
          <section key={title} className="how-card">
            <span className="how-icon" aria-hidden="true"><Icon size={19} /></span>
            <div>
              <h2 className="font-serif">{t(`how.${title}`)}</h2>
              <p>{t(`how.${body}`)}</p>
            </div>
          </section>
        ))}
      </div>

      <div className="model-panel mt-10">
        <div className="model-panel-heading">
          <div>
            <div className="card-label">{t("how.modelInfo")}</div>
            <h2 className="font-serif">{t("how.modelInfo")}</h2>
          </div>
          <ShieldCheck size={22} aria-hidden="true" className="text-primary" />
        </div>
        {failed ? <WakeState onRetry={load} /> : !info ? <LoadingState /> : (
          <div className="mt-6">
            {info.trained ? (
              <dl className="model-metrics">
                <Metric label={t("how.trainSize")} value={info.train_size ?? t("how.notReported")} />
                <Metric label={t("how.accuracy")} value={typeof info.accuracy === "number" ? `${(info.accuracy * 100).toFixed(1)}%` : t("how.notReported")} />
                <Metric label={t("how.classes")} value={Array.isArray(info.classes) ? info.classes.join(", ") : t("how.notReported")} />
              </dl>
            ) : <p className="text-ink/70">{info.note || t("how.notReported")}</p>}
          </div>
        )}
      </div>
    </section>
  );
}

function Metric({ label, value }) {
  return <div><dt>{label}</dt><dd>{value}</dd></div>;
}
