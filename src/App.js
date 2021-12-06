import Navbar from './components/layout/Navbar';
import BottomNav from './components/layout/BottomNav';
import TrickList from './components/tricks/TrickList';
import ComboList from './components/combos/ComboList';
import PostTrick from './components/tricks/PostTrick';
import PostCombo from './components/combos/PostCombo';
import ComboGenerator from './components/generator/ComboGenerator';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
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
          <Switch>
            <Route exact path="/">
              <TrickList sortingSchemes={trickSortingSchemes} sortOpt={sortOpt}/>
            </Route>
            <Route path="/tricks/:id">
              <TrickDetails stickFrequencies={stickFrequencies}/>
            </Route>
            <Route path="/combos/:id">
              <ComboDetails stickFrequencies={stickFrequencies}/>
            </Route>
            <Route path="/posttrick">
              <ScrollToTop>
                <PostTrick stickFrequencies={stickFrequencies} positions={positions}/>
              </ScrollToTop>
            </Route>
            <Route path="/postcombo">
              <PostCombo stickFrequencies={stickFrequencies}/>
            </Route>
            <Route path="/generator">
              <ComboGenerator difficultyRangeMax={difficultyRangeMax} randomCombo={randomCombo} setRandomCombo={setRandomCombo}/>
            </Route>
            <Route path="/combos">
              <ComboList sortingSchemes={comboSortingSchemes} sortOpt={sortOpt}/>
            </Route>
            <Route>
              <NotFoundPage/>
            </Route>
          </Switch>
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
