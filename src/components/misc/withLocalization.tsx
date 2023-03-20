import React, {useEffect} from "react";
import {i18n} from "@lingui/core";
import {I18nProvider} from "@lingui/react";
import {getLocale, setAppLanguage} from "../../logic/i18n";

function withLocalization(Child: React.FC) {
  // i18n setup
  useEffect(() => {
    setAppLanguage(getLocale());
  });

  return (
    <I18nProvider i18n={i18n}>
      <Child />
    </I18nProvider>
  );
}

export default withLocalization;
