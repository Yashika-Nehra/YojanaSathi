import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UserRound } from "lucide-react";
import ProfileForm from "../components/ProfileForm";
import { useAuth } from "../auth";

export default function Profile() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();

  if (loading) {
    return <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8"><div className="auth-card p-8">{t("auth.loadingAccount")}</div></section>;
  }

  if (!user) {
    return (
      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
        <div className="auth-card p-8 text-center">
          <UserRound className="mx-auto text-primary" size={30} />
          <h1 className="mt-4 font-serif text-4xl font-bold">{t("auth.loginRequired")}</h1>
          <p className="mt-2 text-ink/70">{t("auth.loginRequiredBody")}</p>
          <Link className="btn btn-primary mt-6" to="/login">{t("auth.signIn")}</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="profile-page-head">
        <div>
          <div className="card-label">{t("auth.account")}</div>
          <h1 className="font-serif text-4xl font-bold sm:text-5xl">{t("auth.yourSavedProfile")}</h1>
          <p>{t("auth.profileIntro")}</p>
        </div>
        <div className="profile-identity"><strong>{user.name}</strong><span>{user.email}</span></div>
      </div>
      <ProfileForm accountOnly />
    </section>
  );
}
