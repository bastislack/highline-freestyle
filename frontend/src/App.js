import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Home from './components/Home';
import ComboHome from './components/ComboHome';
import Create from './components/Create';
import ComboGenerator from './components/ComboGenerator';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import TrickDetails from './components/TrickDetails';
import ComboDetails from './components/ComboDetails';
import RandomCombo from './components/RandomCombo';
import FloatingActionButton from './components/FloatingActionButton'

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="content">
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route path="/tricks/:id">
              <TrickDetails />
            </Route>
            <Route path="/combos/:id">
              <ComboDetails />
            </Route>
            <Route path="/create">
              <Create />
            </Route>
            <Route path="/generator">
              <ComboGenerator />
            </Route>
            <Route path="/combos">
              <ComboHome />
            </Route>
            <Route path="/random-combo">
              <RandomCombo />
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
