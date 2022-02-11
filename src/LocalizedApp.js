import { useState, useEffect } from 'react';
import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { getLocale, setAppLanguage } from './i18n'
import App from './App';


function LocalizedApp() {
  // i18n setup
  useEffect(() => {
        setAppLanguage(getLocale());
    }, []);

  return (
    <I18nProvider i18n={i18n}>
      <App />
    </I18nProvider>
  );
}

export default LocalizedApp;
