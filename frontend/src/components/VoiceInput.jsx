import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Radio } from "lucide-react";
import { parseProfile } from "../api";
import { useTranslation } from "react-i18next";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SPEECH_LANGS = { en: "en-IN", hi: "hi-IN", bn: "bn-IN", ta: "ta-IN", te: "te-IN", mr: "mr-IN", gu: "gu-IN" };

export default function VoiceInput({ lang, onParsed, onStatus }) {
  const { t } = useTranslation();
  const ref = useRef(null);
  const [listening, setListening] = useState(false);
  const [liveText, setLiveText] = useState("");

  useEffect(() => () => ref.current?.abort(), []);

  if (!SpeechRecognition) {
    return (
      <div className="voice-unavailable" role="status">
        <MicOff size={17} aria-hidden="true" />
        <span>{t("voice.unsupported")}</span>
      </div>
    );
  }

  const start = () => {
    if (listening) {
      ref.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = SPEECH_LANGS[lang] || "en-IN";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setLiveText("");
      onStatus?.("listening");
    };

    recognition.onresult = async (event) => {
      const resultIndex = event.resultIndex ?? 0;
      const transcript = event.results[resultIndex]?.[0]?.transcript?.trim() || "";
      setLiveText(transcript);
      if (!event.results[resultIndex]?.isFinal || !transcript) return;
      onStatus?.("transcript");
      try {
        const result = await parseProfile(transcript, lang);
        onParsed?.({ text: transcript, result });
        onStatus?.("parsed");
      } catch (error) {
        onParsed?.({ text: transcript, result: null, error });
        onStatus?.("error");
      }
    };

    recognition.onerror = () => {
      setListening(false);
      onStatus?.("error");
    };
    recognition.onend = () => setListening(false);
    ref.current = recognition;
    recognition.start();
  };

  return (
    <div className={`voice-box ${listening ? "voice-listening" : ""}`}>
      <div className="voice-copy">
        <div className="voice-icon" aria-hidden="true"><Radio size={16} /></div>
        <div>
          <strong>{listening ? t("voice.listening") : t("voice.speak")}</strong>
          {liveText && <span>{liveText}</span>}
        </div>
      </div>
      <button type="button" className="voice-button" onClick={start} aria-label={listening ? t("voice.stop") : t("voice.speak")} aria-pressed={listening}>
        {listening ? <MicOff size={19} aria-hidden="true" /> : <Mic size={19} aria-hidden="true" />}
        <span>{listening ? t("voice.stop") : t("voice.speak")}</span>
      </button>
    </div>
  );
}
