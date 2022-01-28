import { useState, useEffect } from 'react';
import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { messages as enMessages } from './locales/en/messages'
import { messages as esMessages } from './locales/es/messages'
import { getLocale, setAppLanguage } from './i18n'
import App from './App';


function LocalizedApp() {
  // i18n setup
  useEffect(() => {
        setAppLanguage(getLocale());
    }, []);  i18n.load({
    en: enMessages,
    es: esMessages,
  })
  i18n.activate('en')

  return (
    <I18nProvider i18n={i18n}>
      <App />
    </I18nProvider>
  );
}

export default LocalizedApp;
