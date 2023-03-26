import TopNav from "./components/layout/TopNav";
import BottomNav from "./components/layout/BottomNav";
import LeftNav from "./components/layout/LeftNav";
import TrickList from "./components/tricks/TrickList";
import ComboList from "./components/combos/ComboList";
import PostTrick from "./components/tricks/PostTrick";
import PostCombo from "./components/combos/PostCombo";
import ComboGenerator from "./components/generator/ComboGenerator";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import TrickDetails from "./components/tricks/TrickDetails";
import ComboDetails from "./components/combos/ComboDetails";
import {useState, useEffect} from "react";
import Visibility from "./components/containers/Visibility";
import ScrollToTop from "./components/containers/ScrollToTop";
import About from "./components/pages/About";
import NotFoundPage from "./components/pages/NotFoundPage";
import ResetWarning from "./components/pop-ups/ResetWarning";
import FloatingActionButton from "./components/buttons/FloatingActionButton";
import Div100vh from "react-div-100vh";
import {ErrorBoundary} from "react-error-boundary";
import ErrorFallback from "./components/pages/ErrorFallback";
import withLocalization from "./components/misc/withLocalization";
import React from "react";

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

function App() {
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

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Router>
        <div className="App">
          <div className="container-fluid">
            <div className="row flex-nowrap">
              <LeftNav rootContext={CtxMemo} />
              <Div100vh className="main-column">
                <TopNav rootContext={CtxMemo} />
                <div className="main-column-content-wrapper">
                  <div id="content" className="main-column-content">
                    <Routes>
                      <Route path="/" element={<TrickList rootContext={CtxMemo} />} />
                      <Route path="/tricks/:id" element={<TrickDetails />} />
                      <Route path="/combos/:id" element={<ComboDetails rootContext={CtxMemo} />} />
                      <Route
                        path="/posttrick"
                        element={
                          <ScrollToTop>
                            <PostTrick />
                          </ScrollToTop>
                        }
                      />
                      <Route
                        path="/postcombo"
                        element={<PostCombo userCombo={CtxMemo.userCombo} setUserCombo={CtxMemo.setUserCombo} />}
                      />
                      <Route
                        path="/generator"
                        element={
                          <ComboGenerator
                            difficultyRangeMax={11}
                            randomCombo={randomCombo}
                            setRandomCombo={setRandomCombo}
                          />
                        }
                      />
                      <Route
                        path="/combos"
                        element={
                          <ComboList
                            sortOpt={sortingOption}
                            scrollPosition={comboListScrollPosition}
                            setScrollPosition={setComboListScrollPosition}
                          />
                        }
                      />
                      <Route path="/*" element={<NotFoundPage />} />
                    </Routes>
                  </div>
                  <Visibility visiblePages={["TrickList", "ComboList"]}>
                    <FloatingActionButton
                      setTrickListScrollPosition={setTrickListScrollPosition}
                      setComboListScrollPosition={setComboListScrollPosition}
                      setUserCombo={setUserCombo as any} // TODO
                    />
                  </Visibility>
                </div>
                <BottomNav />
                {showAboutPage && <About showAboutPage={showAboutPage} setShowAboutPage={setShowAboutPage} />}
                {showResetWarning && <ResetWarning rootContext={CtxMemo} />}
              </Div100vh>
            </div>
          </div>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

//export default withLocalization(App);
export default App;
