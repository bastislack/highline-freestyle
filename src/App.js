import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import TrickList from './components/TrickList';
import ComboList from './components/ComboList';
import CreateTrick from './components/CreateTrick';
import CreateCombo from './components/CreateCombo';
import ComboGenerator from './components/ComboGenerator';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import TrickDetails from './components/TrickDetails';
import ComboDetails from './components/ComboDetails';
import FloatingActionButton from './components/FloatingActionButton'


function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="content">
          <Switch>
            <Route exact path="/">
              <TrickList />
            </Route>
            <Route path="/tricks/:id">
              <TrickDetails />
            </Route>
            <Route path="/combos/:id">
              <ComboDetails />
            </Route>
            <Route path="/createtrick">
              <CreateTrick/>
            </Route>
            <Route path="/createcombo">
              <CreateCombo/>
            </Route>
            <Route path="/generator">
              <ComboGenerator />
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
