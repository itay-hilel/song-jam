import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Session from './components/Session';
import SongLine from './components/SongLine';
import Collaboration from './components/Collaboration';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={Session} />
        <Route path="/songline" component={SongLine} />
        <Route path="/collaboration" component={Collaboration} />
      </Switch>
    </Router>
  );
};

export default App;