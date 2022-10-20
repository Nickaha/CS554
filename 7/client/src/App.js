import React from 'react';
import './App.css';
import CharactersList from './components/CharactersList';
import Character from './components/Character';
import Home from './components/Home';
import Intro from './components/Intro';

import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

const App = () => {
	return (
		<Router>
			<div className='App'>
				<header className='App-header'>
					<h1 className='App-title'>Welcome to the world of Pokemon</h1>
					<Link className='showlink' to='/'>
						Home
					</Link>
					<Link className='showlink' to='/trainers'>
						Pokemon Trainers
					</Link>
					<Link className='showlink' to='/pokemon/page/0'>
						Pokemon
					</Link>
					
				</header>
				<br />
				<br />
				<div className='App-body'>
				    <Route exact path='/' component={Intro} />
					<Route exact path='/trainers' component={Home} />
					<Route exact path='/pokemon/page/:pagenum' component={CharactersList} />
					<Route exact path='/pokemon/:id' component={Character} />
				</div>
			</div>
		
		</Router>
	);
};

export default App;
