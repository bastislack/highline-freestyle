import React from "react"
import { useLingui } from "@lingui/react"
import { setAppLanguage } from "../../i18n";
import { ButtonGroup, ToggleButton } from "react-bootstrap";
import { Trans } from '@lingui/macro'

const LanguageSelector = () => {
    const { i18n } = useLingui();

  //TODO remove this when we have the spanish version working
  return null;

    return (
      <ButtonGroup>
        <ToggleButton
          key="english"
          id="english"
          type="radio"
          name="radio"
          value="english"
          checked={i18n.locale === 'en'}
          onChange={(e) => setAppLanguage("en")}
        >
          <Trans id="languages.english">English</Trans>
        </ToggleButton>
        <ToggleButton
          key="spanish"
          id="spanish"
          type="radio"
          name="radio"
          value="spanish"
          checked={i18n.locale === 'es'}
          onChange={(e) => setAppLanguage("es")}
        >
          <Trans id="languages.spanish">Spanish</Trans>
        </ToggleButton>
      </ButtonGroup>
    );
};

export default LanguageSelector;
