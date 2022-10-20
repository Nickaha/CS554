import React from 'react';
import './App.css';
import logo from './img/marvel-logo.png';
import CharactersList from './components/CharactersList';
import SeriesList from './components/SeriesList';
import ComicsList from './components/ComicsList';
import Serie from './components/Serie';
import Comic from './components/Comic';
import Character from './components/Character';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

const App = () => {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">
            Welcome to the Marvel API Example
          </h1>
          <Link className="showlink" to="/">Home</Link>
          <Link className="showlink" to="/characters/page/0">
            Characters
          </Link>
          <Link className="showlink" to="/comics/page/0">
            Comics
          </Link>
          <Link className="showlink" to="/series/page/0">
            Series
          </Link>
        </header>
        <br />
        <br />
        <div className="App-body">
          <Route exact path="/characters/page/:pagenum" component={CharactersList} />
          <Route exact path="/characters/:id" component={Character} />
          <Route exact path="/comics/page/:pagenum" component={ComicsList} />
          <Route exact path="/comics/:id" component={Comic} />
          <Route exact path="/series/page/:pagenum" component={SeriesList} />
          <Route exact path="/series/:id" component={Serie} />
        </div>
      </div>
    </Router>
  );
};

export default App;
