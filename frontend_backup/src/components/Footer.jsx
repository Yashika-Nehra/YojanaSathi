import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="mt-16 border-t border-line bg-paper">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-ink/70 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>{t("footer.disclaimer")}</p>
        <div className="flex flex-wrap gap-4">
          <Link className="underline-offset-2 hover:underline" to="/how-it-works">{t("nav.howItWorks")}</Link>
          <Link className="underline-offset-2 hover:underline" to="/terms">{t("nav.terms")}</Link>
          <Link className="underline-offset-2 hover:underline" to="/privacy">{t("nav.privacy")}</Link>
        </div>
      </div>
    </footer>
  );
}