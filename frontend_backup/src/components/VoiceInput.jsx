import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { parseProfile } from "../api";
import { useTranslation } from "react-i18next";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function VoiceInput({ lang, onParsed, onStatus }) {
  const { t } = useTranslation();
  const ref = useRef(null);
  const [listening, setListening] = useState(false);
  useEffect(() => () => ref.current?.abort(), []);
  if (!SpeechRecognition) {
    return <div className="border border-line bg-surface p-3 text-sm text-ink/70" role="status">{t("voice.unsupported")}</div>;
  }
  const start = () => {
    if (listening) { ref.current?.stop(); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = ({en:"en-IN",hi:"hi-IN",bn:"bn-IN",ta:"ta-IN",te:"te-IN",mr:"mr-IN",gu:"gu-IN"})[lang] || "en-IN";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onstart = () => { setListening(true); onStatus?.("listening"); };
    recognition.onresult = async (event) => {
      const text = event.results[event.results.length - 1][0]?.transcript || "";
      onStatus?.("transcript");
      try {
        const result = await parseProfile(text, lang);
        onParsed?.({ text, result });
        onStatus?.("parsed");
      } catch (error) {
        onParsed?.({ text, result: null, error });
        onStatus?.("error");
      }
    };
    recognition.onerror = () => { setListening(false); onStatus?.("error"); };
    recognition.onend = () => setListening(false);
    ref.current = recognition;
    recognition.start();
  };
  return (
    <button type="button" className={`btn ${listening ? "btn-outline" : "btn-primary"} w-full sm:w-auto`} onClick={start} aria-label={listening ? t("voice.stop") : t("voice.speak")} aria-pressed={listening}>
      {listening ? <MicOff size={19} aria-hidden="true" /> : <Mic size={19} aria-hidden="true" />}
      {listening ? t("voice.stop") : t("voice.speak")}
    </button>
  );
}