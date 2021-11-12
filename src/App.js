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
import {stickFrequencies, positions, difficultyRangeMax} from './services/enums';
import {sortingSchemes} from './services/sortingSchemes';
import BackButton from "./components/buttons/BackButton";
import Logo from './components/layout/Logo';
import Settings from './components/layout/Settings';
import { useState } from "react";


function App() {

  // Sorting Options for the tricklist
  const [sortOpt, setSortOpt] = useState(0);

  return (
    <Router>
      <div className="App">
        <Navbar>
          <BackButton/>
          <Logo/>
          <Settings sortingSchemes={sortingSchemes} sortOpt={sortOpt} setSortOpt={setSortOpt}/>
        </Navbar>
        <div className="content">
          <Switch>
            <Route exact path="/">
              <TrickList sortingSchemes={sortingSchemes} sortOpt={sortOpt}/>
            </Route>
            <Route path="/tricks/:id">
              <TrickDetails stickFrequencies={stickFrequencies}/>
            </Route>
            <Route path="/combos/:id">
              <ComboDetails stickFrequencies={stickFrequencies}/>
            </Route>
            <Route path="/posttrick">
              <PostTrick stickFrequencies={stickFrequencies} positions={positions}/>
            </Route>
            <Route path="/postcombo">
              <PostCombo stickFrequencies={stickFrequencies}/>
            </Route>
            <Route path="/generator">
              <ComboGenerator difficultyRangeMax={difficultyRangeMax} />
            </Route>
            <Route path="/combos">
              <ComboList />
            </Route>
          </Switch>
        </div>
        <FloatingActionButton />
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
