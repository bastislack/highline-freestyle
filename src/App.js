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
import { useState } from 'react';
import Visibility from './components/containers/Visibility';
import ScrollToTop from './components/containers/ScrollToTop';
import About from './components/pages/About';
import NotFoundPage from './components/pages/NotFoundPage';
import FloatingActionButton from './components/buttons/FloatingActionButton';


function App() {

  // Sorting Options for the tricklist
  const [sortOpt, setSortOpt] = useState(0);
  // Randomly generated combo shown on the generator screen
  const [randomCombo, setRandomCombo] = useState(null);
  // Boolean to check if About page should be rendered
  const [showAboutPage, setShowAboutPage] = useState(false);

  const [trickListScrollPosition, setTrickListScrollPosition] = useState(0);
  const [comboListScrollPosition, setComboListScrollPosition] = useState(0);

  return (
    <Router>
      <div className="App">
        <div className="container-fluid">
          <div className="row flex-nowrap">
            <LeftNav sortOpt={sortOpt} setSortOpt={setSortOpt} setShowAboutPage={setShowAboutPage} />
            <div className="main-column">
              <TopNav sortOpt={sortOpt} setSortOpt={setSortOpt} setShowAboutPage={setShowAboutPage} />
              <div className="main-column-content-wrapper">
               <div className="main-column-content">
                  <Routes>
                    <Route path="/" element={<TrickList sortOpt={sortOpt} scrollPosition={trickListScrollPosition} setScrollPosition={setTrickListScrollPosition} />} />
                    <Route path="/tricks/:id" element={<TrickDetails />} />
                    <Route path="/combos/:id" element={<ComboDetails />} />
                    <Route path="/posttrick" element={
                      <ScrollToTop>
                        <PostTrick />
                      </ScrollToTop>
                    } />
                    <Route path="/postcombo" element={<PostCombo />} />
                    <Route path="/generator" element={<ComboGenerator difficultyRangeMax={difficultyRangeMax} randomCombo={randomCombo} setRandomCombo={setRandomCombo}/>} />
                    <Route path="/combos" element={<ComboList sortOpt={sortOpt} scrollPosition={comboListScrollPosition} setScrollPosition={setComboListScrollPosition} />} />
                    <Route path="/*" element={<NotFoundPage/>} />
                  </Routes>
                </div>
                <Visibility visiblePages={[pages.TRICKLIST, pages.COMBOLIST]}>
                  <FloatingActionButton setTrickListScrollPosition={setTrickListScrollPosition} setComboListScrollPosition={setComboListScrollPosition} />
                </Visibility>
              </div>
              <BottomNav />
              {showAboutPage && <About showAboutPage={showAboutPage} setShowAboutPage={setShowAboutPage}/>}
            </div>
          </div>
       </div>
      </div>
    </Router>
  );
}

export default App;
