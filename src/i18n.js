import i18n from "i18next";
import detector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import ICU from "i18next-icu";

import en from "./translations/en.json";
import it from "./translations/it.json";
import itCards from "./translations/it.cards.json";

const resources = {
  it: { translation: { ...it, ...itCards } },
  en: { translation: { ...en } },
};

i18n
  .use(ICU)
  .use(detector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en", // use en if detected lng is not available
    keySeparator: false, // we do not use keys in form messages.welcome
    interpolation: { escapeValue: false },
  });

export default i18n;
