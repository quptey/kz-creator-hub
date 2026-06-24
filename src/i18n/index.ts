import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import ru from "./locales/ru.json";
import kk from "./locales/kk.json";

export const SUPPORTED_LOCALES = ["en", "ru", "kk"] as const;
export type Locale = typeof SUPPORTED_LOCALES[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
  kk: "Қазақша",
};

if (!i18n.isInitialized) {
  const isBrowser = typeof window !== "undefined";
  const chain = isBrowser ? i18n.use(LanguageDetector) : i18n;
  chain.use(initReactI18next).init({
    resources: { en: { translation: en }, ru: { translation: ru }, kk: { translation: kk } },
    fallbackLng: "en",
    lng: isBrowser ? undefined : "en",
    supportedLngs: ["en", "ru", "kk"],
    interpolation: { escapeValue: false },
    detection: { order: ["localStorage", "navigator"], caches: ["localStorage"], lookupLocalStorage: "lng" },
    react: { useSuspense: false },
  });
}

export default i18n;