import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="footer-shell mt-16">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-9 text-sm text-ink/70 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="footer-disclaimer leading-6">{t("footer.disclaimer")}</p>
        <div className="flex flex-wrap gap-4">
          <Link className="underline-offset-2 hover:underline" to="/how-it-works">{t("nav.howItWorks")}</Link>
          <Link className="underline-offset-2 hover:underline" to="/terms">{t("nav.terms")}</Link>
          <Link className="underline-offset-2 hover:underline" to="/privacy">{t("nav.privacy")}</Link>
        </div>
      </div>
    </footer>
  );
}