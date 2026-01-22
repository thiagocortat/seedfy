import 'intl-pluralrules';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import ptBR from './locales/pt-BR.json';
import es from './locales/es.json';

const resources = {
  en: { translation: en },
  'pt-BR': { translation: ptBR },
  es: { translation: es },
};

const initI18n = async () => {
  let savedLanguage = await AsyncStorage.getItem('language');

  if (!savedLanguage) {
    savedLanguage = Localization.getLocales()[0].languageTag;
  }

  i18n.use(initReactI18next).init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    react: {
      useSuspense: false,
    },
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v3',
  });
};

initI18n();

export default i18n;
