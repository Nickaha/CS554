import React, { useState } from 'react';
import '../App.css';
import { useSelector } from 'react-redux';
import Trainer from './Trainer';

import { useDispatch } from 'react-redux';
import actions from '../actions';


const Home = () => {
	const dispatch = useDispatch();
	const [addBtnToggle, setBtnToggle] = useState(false);
	const [formData, setFormData] = useState('');
	const allTrainers = useSelector((state) => state.trainers);
	console.log("lalal");
	console.log(allTrainers);
	const addUser = () => {
		dispatch(actions.addTrainer(formData));
		document.getElementById('name').value = '';
	};
	const handleChange = (e) => {
		console.log(e.target.value);
		setFormData(e.target.value);

	};
	const addTrainerForm = <div>
		<label>
			Trainer Name:
			<input
				id="name"
				onChange={(e) => handleChange(e)}
				name="name"
				placeholder="Trainer Name..."
			/>
		</label>
		<br />
		<br />
		<button onClick={addUser}>Add Trainer</button>
	</div>;
	return (
		<div>
			<button className='addTrainerBtn' onClick={() => setBtnToggle(!addBtnToggle)}>Add A Trainer</button>

			{addBtnToggle && addTrainerForm}

			{allTrainers.map((trainer) => {
				return <Trainer key={trainer.id} trainer={trainer} />;
			})}
		</div>
	);
};

export default Home;
