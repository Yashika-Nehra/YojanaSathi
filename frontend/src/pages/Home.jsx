import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Compass,
  GraduationCap,
  Landmark,
  ShieldCheck,
  Sprout,
  Sparkles,
} from "lucide-react";
import ProfileForm from "../components/ProfileForm";
import { setPageSeo } from "../seo";

const categoryItems = [
  { key: "scholarship", icon: GraduationCap },
  { key: "internship", icon: BriefcaseBusiness },
  { key: "job", icon: Landmark },
  { key: "welfare", icon: Sprout },
];

export default function Home() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    setPageSeo({
      title: t("seo.homeTitle"),
      description: t("seo.homeDescription"),
      path: "/",
      lang: i18n.language === "en" ? "en-IN" : `${i18n.language}-IN`,
    });
  }, [t, i18n.language]);

  return (
    <section className="home-shell mx-auto max-w-[1480px] px-4 pb-12 pt-4 sm:px-7 sm:pb-16 lg:px-10 lg:pb-20">
      <div className="home-layout">
        <div className="hero-story">
          <div className="hero-crest" aria-hidden="true">
            <div className="crest-ring"><Compass size={24} /></div>
            <span className="crest-line" />
            <span className="crest-word">YojanaSathi</span>
          </div>

          <h1 className="hero-heading font-serif">{t("home.heading")}</h1>
          <p className="hero-copy">{t("home.subheading")}</p>

          <div className="codex-visual" aria-hidden="true">
            <div className="codex-card">
              <div className="codex-card-top">
                <div>
                  <span className="codex-caption">YojanaSathi</span>
                  <strong>{t("home.noteTitle")}</strong>
                </div>
                <span className="codex-seal"><ShieldCheck size={17} /></span>
              </div>
              <div className="codex-grid">
                {categoryItems.map(({ key, icon: Icon }, index) => (
                  <div className={`codex-tile codex-tile-${index + 1}`} key={key}>
                    <span className="codex-icon"><Icon size={19} /></span>
                    <span>{t(`types.${key}`)}</span>
                    <ArrowUpRight size={15} />
                  </div>
                ))}
              </div>
              <div className="codex-footer">
                <span className="codex-rule" />
                <span>{t("home.noteBody")}</span>
              </div>
            </div>

            <div className="ornament-column">
              <span className="ornament-dot" />
              <span className="ornament-line" />
              <span className="ornament-star"><Sparkles size={15} /></span>
              <span className="ornament-line" />
              <span className="ornament-dot" />
            </div>
          </div>
        </div>

        <ProfileForm />
      </div>
    </section>
  );
}
