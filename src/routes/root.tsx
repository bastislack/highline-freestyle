//import { i18n } from "@lingui/core";
//import { I18nProvider } from "@lingui/react";
import React, {useEffect} from "react";
import {useState} from "react";
import Div100vh from "react-div-100vh";
import {Outlet, RouteObject, useRouteError} from "react-router-dom";
import LeftNav from "../components/layout/LeftNav";
import TopNav from "../components/layout/TopNav";
import {getLocale, setAppLanguage} from "../logic/i18n";

export interface RootContextData {
  sortingOption: number; // TODO,
  setSortingOption: (value: number) => void;
  randomCombo: string | null;
  setRandomCombo: (value: string | null) => void;
  showAboutPage: boolean;
  setShowAboutPage: (show: boolean) => void;
  showResetWarning: boolean;
  setShowResetWarning: (show: boolean) => void;
  userCombo: any | null;
  setUserCombo: (combo: any | null) => void;
  trickListScrollPosition: number;
  setTrickListScrollPosition: (position: number) => void;
  comboListScrollPosition: number;
  setComboListScrollPosition: (position: number) => void;
}

export function Root() {
  // BIG TODO: Figure out types, possibly create enums!
  const [sortingOption, setSortingOption] = useState(0);
  const [randomCombo, setRandomCombo] = useState<string | null>(null);
  const [showAboutPage, setShowAboutPage] = useState(false);
  const [showResetWarning, setShowResetWarning] = useState(false);
  const [userCombo, setUserCombo] = useState(null);
  const [trickListScrollPosition, setTrickListScrollPosition] = useState(0);
  const [comboListScrollPosition, setComboListScrollPosition] = useState(0);

  // prettier-ignore
  const CtxMemo = React.useMemo<RootContextData>(function(){
    return {
      // getter, setter
      sortingOption, setSortingOption,
      randomCombo, setRandomCombo,
      showAboutPage, setShowAboutPage,
      showResetWarning, setShowResetWarning,
      userCombo, setUserCombo,
      trickListScrollPosition, setTrickListScrollPosition,
      comboListScrollPosition, setComboListScrollPosition,
    }
  }, [
    sortingOption,
    randomCombo,
    showAboutPage,
    showResetWarning,
    userCombo,
    trickListScrollPosition,
    comboListScrollPosition,
  ]);

  useEffect(() => {
    //setAppLanguage(getLocale())
  });

  // RootContext.Provider allows to useContext(RootContext) inside the children
  // so we do not have to pass getters and setters all over the place.
  return (
    //<I18nProvider i18n={i18n}>
    <div className="App">
      <div className="container-fluid">
        <div className="row flex-nowrap">
          <LeftNav rootContext={CtxMemo} />
          <Div100vh className="main-column">
            <TopNav rootContext={CtxMemo} />
            <Outlet context={CtxMemo} />
          </Div100vh>
        </div>
      </div>
    </div>
    //</I18nProvider>
  );
}

export function RootErrorBoundary(): JSX.Element {
  const error = useRouteError();

  let errorName: string | undefined = undefined;
  let errorMessage = "No Error Message attached";

  if (error && typeof error === "object") {
    if (typeof (error as any).name === "string") {
      errorName = (error as any).name;
    }
    if (typeof (error as any).message === "string") {
      errorMessage = (error as any).message;
    }
  }

  return (
    <div role="alert">
      <h2>Something went wrong</h2>
      {errorName === "DatabaseClosedError" && (
        <p> Unfortunatly this App does not work in incognito mode, try to disable it </p>
      )}
      <p>
        If this is an unexpected error, please write an issue on{" "}
        <a href="https://github.com/bastislack/highline-freestyle/issues">Github</a>, containing what you did to produce
        this error and the following error msg:
      </p>
      <pre>{errorMessage}</pre>
    </div>
  );
}
