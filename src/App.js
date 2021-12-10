import Navbar from './components/layout/Navbar';
import BottomNav from './components/layout/BottomNav';
import TrickList from './components/tricks/TrickList';
import ComboList from './components/combos/ComboList';
import PostTrick from './components/tricks/PostTrick';
import PostCombo from './components/combos/PostCombo';
import ComboGenerator from './components/generator/ComboGenerator';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TrickDetails from './components/tricks/TrickDetails';
import ComboDetails from './components/combos/ComboDetails';
import FloatingActionButton from './components/buttons/FloatingActionButton';
import {stickFrequencies, positions, pages, difficultyRangeMax} from './services/enums';
import {trickSortingSchemes, comboSortingSchemes} from './services/sortingSchemes';
import BackButton from "./components/buttons/BackButton";
import InstallButton from "./components/buttons/InstallButton";
import Logo from './components/layout/Logo';
import Settings from './components/layout/Settings';
import { useState } from 'react';
import Visibility from './components/containers/Visibility';
import ScrollToTop from './components/containers/ScrollToTop';
import About from './components/pages/About';
import NotFoundPage from './components/pages/NotFoundPage';


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
        <Navbar>
          <div style={{display: "flex", alignItems: "center", width: "100%"}}>
            <div style={{width: "50px", height: "40px"}}>
              <Visibility visiblePages={[pages.TRICKDETAILS, pages.COMBODETAILS, pages.POSTTRICK, pages.POSTCOMBO]} elseContent="&nbsp;">
                <BackButton/>
              </Visibility>
              <Visibility visiblePages={[pages.TRICKLIST, pages.COMBOLIST]} elseContent="&nbsp;">
                <InstallButton/>
              </Visibility>
            </div>
            <div style={{flexGrow: "1", textAlign: "center"}}>
              <Logo/>
            </div>
            <div style={{width: "50px", height: "40px"}}>
              <Visibility visiblePages={[pages.TRICKLIST, pages.COMBOLIST]} elseContent="&nbsp;">
                <Settings sortingSchemes={[trickSortingSchemes, comboSortingSchemes]} sortOpt={sortOpt} setSortOpt={setSortOpt} setShowAboutPage={setShowAboutPage}/>
              </Visibility>
            </div>
          </div>
        </Navbar>
        <div className="content">
          <Routes>
            <Route path="/" element={<TrickList sortingSchemes={trickSortingSchemes} sortOpt={sortOpt} scrollPosition={trickListScrollPosition} setScrollPosition={setTrickListScrollPosition}/>} />
            <Route path="/tricks/:id" element={<TrickDetails stickFrequencies={stickFrequencies}/>} />
            <Route path="/combos/:id" element={<ComboDetails stickFrequencies={stickFrequencies}/>} />
            <Route path="/posttrick" element={
              <ScrollToTop>
                <PostTrick stickFrequencies={stickFrequencies} positions={positions}/>
              </ScrollToTop>
            } />
            <Route path="/postcombo" element={<PostCombo stickFrequencies={stickFrequencies}/>} />
            <Route path="/generator" element={<ComboGenerator difficultyRangeMax={difficultyRangeMax} randomCombo={randomCombo} setRandomCombo={setRandomCombo} positions={positions}/>} />
            <Route path="/combos" element={<ComboList sortingSchemes={comboSortingSchemes} sortOpt={sortOpt} scrollPosition={comboListScrollPosition} setScrollPosition={setComboListScrollPosition}/>} />
            <Route path="/*" element={<NotFoundPage/>} />
          </Routes>
          {showAboutPage && <About showAboutPage={showAboutPage} setShowAboutPage={setShowAboutPage}/>}
        </div>
        <Visibility visiblePages={[pages.TRICKLIST, pages.COMBOLIST]}>
          <FloatingActionButton />
        </Visibility>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
