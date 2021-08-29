import Navbar from './Navbar';
import BottomNav from './BottomNav';
import Home from './Home';
import ComboHome from './ComboHome';
import Create from './Create';
import ComboGenerator from './ComboGenerator';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import TrickDetails from './TrickDetails';
import ComboDetails from './ComboDetails';
import RandomCombo from './RandomCombo';

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
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
