import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import hi from "./locales/hi.json";
import bn from "./locales/bn.json";
import ta from "./locales/ta.json";
import te from "./locales/te.json";
import mr from "./locales/mr.json";
import gu from "./locales/gu.json";

export const LANGS=[
  {code:"en",tag:"en-IN",label:"English"},{code:"hi",tag:"hi-IN",label:"हिन्दी"},{code:"bn",tag:"bn-IN",label:"বাংলা"},
  {code:"ta",tag:"ta-IN",label:"தமிழ்"},{code:"te",tag:"te-IN",label:"తెలుగు"},{code:"mr",tag:"mr-IN",label:"मराठी"},{code:"gu",tag:"gu-IN",label:"ગુજરાતી"}
];
const saved=localStorage.getItem("ys_lang");
const initial=LANGS.some(l=>l.code===saved)?saved:"en";
i18n.use(initReactI18next).init({resources:{en:{translation:en},hi:{translation:hi},bn:{translation:bn},ta:{translation:ta},te:{translation:te},mr:{translation:mr},gu:{translation:gu}},lng:initial,fallbackLng:"en",interpolation:{escapeValue:false}});
function applyLang(lng){localStorage.setItem("ys_lang",lng);const l=LANGS.find(x=>x.code===lng);document.documentElement.lang=l?l.tag:lng;}
i18n.on("languageChanged",applyLang);applyLang(initial);
export default i18n;
