import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

export function LoadingState() {
  const { t } = useTranslation();
  return <div className="border border-line bg-surface p-8" role="status">{t("state.loading")}</div>;
}
export function WakeState({ onRetry }) {
  const { t } = useTranslation();
  return (
    <div className="border border-line bg-surface p-8" role="alert">
      <h3 className="font-serif text-xl font-bold">{t("state.wakingTitle")}</h3>
      <p className="mt-2 text-ink/70">{t("state.wakingBody")}</p>
      <button className="btn btn-outline mt-4" onClick={onRetry} type="button"><RefreshCw size={17} aria-hidden="true" /> {t("state.retry")}</button>
    </div>
  );
}