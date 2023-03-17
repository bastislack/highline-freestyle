import TopNav from './components/layout/TopNav';
import BottomNav from './components/layout/BottomNav';
import LeftNav from './components/layout/LeftNav';
import TrickList from './components/tricks/TrickList';
import ComboList from './components/combos/ComboList';
import PostTrick from './components/tricks/PostTrick';
import PostCombo from './components/combos/PostCombo';
import ComboGenerator from './components/generator/ComboGenerator';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TrickDetails from './components/tricks/TrickDetails';
import ComboDetails from './components/combos/ComboDetails';
import { pages, difficultyRangeMax} from './services/enums';
import { useState, useEffect } from 'react';
import Visibility from './components/containers/Visibility';
import ScrollToTop from './components/containers/ScrollToTop';
import About from './components/pages/About';
import NotFoundPage from './components/pages/NotFoundPage';
import ResetWarning from './components/pop-ups/ResetWarning';
import FloatingActionButton from './components/buttons/FloatingActionButton';
import Div100vh from 'react-div-100vh';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './components/pages/ErrorFallback';


function App() {
  // Randomly generated combo shown on the generator screen
  const [randomCombo, setRandomCombo] = useState(null);
  // Boolean to check if About page should be rendered
  const [showAboutPage, setShowAboutPage] = useState(false);
  const [showResetWarning, setShowResetWarning] = useState(false);
  // User made combo in postCombo screen
  const [userCombo, setUserCombo] = useState(null);

  const [trickListScrollPosition, setTrickListScrollPosition] = useState(0);
  const [comboListScrollPosition, setComboListScrollPosition] = useState(0);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Router>
        <div className="App">
          <div className="container-fluid">
            <div className="row flex-nowrap">
              <LeftNav setShowAboutPage={setShowAboutPage} />
              <Div100vh className="main-column">
                <TopNav setShowAboutPage={setShowAboutPage} setShowResetWarning={setShowResetWarning} />
                <div className="main-column-content-wrapper">
                 <div id="content" className="main-column-content">
                    <Routes>
                      <Route path="/" element={
                        <TrickList
                          scrollPosition={trickListScrollPosition}
                          setScrollPosition={setTrickListScrollPosition}
                          userCombo={userCombo}
                          setUserCombo={setUserCombo}
                        />
                      } />
                      <Route path="/tricks/:id" element={<TrickDetails />} />
                      <Route path="/combos/:id" element={<ComboDetails setUserCombo={setUserCombo} />} />
                      <Route path="/posttrick" element={
                        <ScrollToTop>
                          <PostTrick />
                        </ScrollToTop>
                      } />
                      <Route path="/postcombo" element={<PostCombo userCombo={userCombo} setUserCombo={setUserCombo}/>} />
                      <Route path="/generator" element={
                        <ComboGenerator
                          difficultyRangeMax={difficultyRangeMax}
                          randomCombo={randomCombo}
                          setRandomCombo={setRandomCombo}
                        />
                      } />
                      <Route path="/combos" element={
                        <ComboList
                          scrollPosition={comboListScrollPosition}
                          setScrollPosition={setComboListScrollPosition}
                          />
                      } />
                      <Route path="/*" element={<NotFoundPage/>} />
                    </Routes>
                  </div>
                  <Visibility visiblePages={[pages.TRICKLIST, pages.COMBOLIST]}>
                    <FloatingActionButton setTrickListScrollPosition={setTrickListScrollPosition} setComboListScrollPosition={setComboListScrollPosition} setUserCombo={setUserCombo}/>
                  </Visibility>
                </div>
                <BottomNav />
                {showAboutPage && <About showAboutPage={showAboutPage} setShowAboutPage={setShowAboutPage}/>}
                {showResetWarning && <ResetWarning showResetWarning={showResetWarning} setShowResetWarning={setShowResetWarning}/>}
              </Div100vh>
            </div>
          </div>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
