import React, { useState, useEffect } from 'react';
//import img_notfound from '../img/download.jpeg';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, CardActionArea, CardContent, CardMedia, Grid, Typography, makeStyles } from '@material-ui/core';
import '../App.css';
import { useDispatch } from 'react-redux';
import actions from '../actions';
import { useSelector } from 'react-redux';

const useStyles = makeStyles({
	card: {
		maxWidth: 250,
		height: 'auto',
		marginLeft: 'auto',
		marginRight: 'auto',
		borderRadius: 5,
		border: '1px solid #1e8678',
		boxShadow: '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);'
	},
	titleHead: {
		borderBottom: '1px solid #1e8678',
		fontWeight: 'bold',
		color: '#178577'
	},
	grid: {
		flexGrow: 1,
		flexDirection: 'row'
	},
	media: {
		height: '100%',
		width: '100%'
	},
	button: {
		color: '#1e8678',
		fontWeight: 'bold',
		fontSize: 12
	}
});
const CharacterList = (props) => {
	const classes = useStyles();
	const [loading, setLoading] = useState(true);
	const [notFound, setnotFound] = useState(true);
	//const [nullPage, setnullPage] = useState(false);
	const [charactersData, setCharactersData] = useState(undefined);
	const [pageNumber, setPageNumber] = useState(0);
	const dispatch = useDispatch();
   
	const selectedTrainers = useSelector((state) => state.selected);

    const allTrainers = useSelector((state) => state.trainers);
	let targetTrainer=null;
    for(let i=0;i<allTrainers.length;i++){
     if(selectedTrainers===allTrainers[i].id)  targetTrainer = allTrainers[i];
    }


	let card = null;
	let preBtnVisible = true;
	let nextBtnVisible = true;

	const catchPokemon = (id,url) => {
		console.log(url);
		dispatch(actions.catchPokemon(id,url));
	};
	const releasePokemon = (id,url) => {
		console.log(url);
		dispatch(actions.releasePokemon(id,url));
	};
	

	const goToNextPage = async () => {
		setPageNumber(pageNumber + 1);

	}
	const goToPrePage = async () => {
		setPageNumber(pageNumber - 1);

	}
	let previousBtn;
	let nextBtn;

	useEffect(() => {
		async function fetchData() {
			try {
				
				const { data } = await axios.get(`http://localhost:4000/pokemon/page/${parseInt(props.match.params.pagenum)}`);
				console.log(data);
				// if (data.data.results.length !== 0 && data_nextpage.data.results.length === 0) {
				// 	setlastPage(true);
				// }
				// if (data.data.results.length === 0 && data_nextpage.data.results.length === 0) {
				// 	setnullPage(true);
				// }
			
				setPageNumber(parseInt(props.match.params.pagenum));
				setCharactersData(data);
				setLoading(false);
				setnotFound(false);
			} catch (e) {
				setLoading(false);
				console.log(e);
			}
		}
		fetchData();
	}, [props.match.params.pagenum]);

	
	const buildCard = (character) => {
		const imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${character.url.replace(/[^0-9]/ig,"").slice(1)}.png`;
		let btn_toggle = <button onClick={()=>catchPokemon(selectedTrainers,imgUrl)}>Catch</button>;
		if(targetTrainer !==null){
			if(targetTrainer.pokemons.length===6) {
				btn_toggle = <button > Party full</button>
				for(let i=0;i<targetTrainer.pokemons.length;i++){
					if(targetTrainer.pokemons[i] ===imgUrl){
					 btn_toggle = <button onClick={()=>releasePokemon(selectedTrainers,imgUrl)}>Release</button>
					}
				 }
			}else{
				for(let i=0;i<targetTrainer.pokemons.length;i++){
					if(targetTrainer.pokemons[i] ===imgUrl){
					 btn_toggle = <button onClick={()=>releasePokemon(selectedTrainers,imgUrl)}>Release</button>
					}
				 }
			}
		}
		// async function fetchData() {
		//    const { data } = await axios.get(`http://localhost:4000/pokemon/${character.url.replace(/[^0-9]/ig,"").slice(1)}`);
		//    //data_out =  data.sprites.other['official-artwork'].front_default
		// }
		// fetchData();

        //console.log(character.url.replace(/[^0-9]/ig,"").slice(1));
		
		//image={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${character.url.replace(/[^0-9]/ig,"").slice(1)}.png`}
		return (
			<Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={character.name}>
				<Card className={classes.card} variant='outlined'>
					<CardActionArea>
						<Link to={`/pokemon/${character.url.replace(/[^0-9]/ig,"").slice(1)}`}>
							<CardMedia
								className={classes.media}
								component='img'
								image={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${character.url.replace(/[^0-9]/ig,"").slice(1)}.png`}
								title='character image'
							/>
							<CardContent>
								<Typography className={classes.titleHead} gutterBottom variant='h6' component='h2'>
									{character.name}
								</Typography>
							</CardContent>
						</Link>
						
					</CardActionArea>
					{btn_toggle}
					{/* <button onClick={()=>catchPokemon(selectedTrainers,imgUrl)}>Catch</button> */}
				</Card>
			</Grid>
		);
	};


	if (parseInt(props.match.params.pagenum) === 0) {
		preBtnVisible = false;
		nextBtnVisible = true;
		previousBtn = preBtnVisible ? <Link className='pagecontrol' to={`/pokemon/page/${pageNumber - 1}`} onClick={goToPrePage}>Previous</Link> : <p></p>;
		nextBtn = nextBtnVisible ? <Link className='pagecontrol' to={`/pokemon/page/${pageNumber + 1}`} onClick={goToNextPage}>Next</Link> : <p></p>;
	} 
	else if (parseInt(props.match.params.pagenum)>55) {
		preBtnVisible = true;
		nextBtnVisible = false;
		previousBtn = preBtnVisible ? <Link className='pagecontrol' to={`/pokemon/page/${pageNumber - 1}`} onClick={goToPrePage}>Previous</Link> : <p></p>;
		nextBtn = nextBtnVisible ? <Link className='pagecontrol' to={`/pokemon/page/${pageNumber + 1}`} onClick={goToNextPage}>Next</Link> : <p></p>;
	} else {
		preBtnVisible = true;
		nextBtnVisible = true;
		previousBtn = preBtnVisible ? <Link className='pagecontrol' to={`/pokemon/page/${pageNumber - 1}`} onClick={goToPrePage}>Previous</Link> : <p></p>;
		nextBtn = nextBtnVisible ? <Link className='pagecontrol' to={`/pokemon/page/${pageNumber + 1}`} onClick={goToNextPage}>Next</Link> : <p></p>;
	}


		card =
			charactersData &&
			charactersData.results.map((show) => {
				return buildCard(show);
			});


	if (loading) {
		return (
			<div>
				<h2>Loading....</h2>
			</div>
		);
	}
	else if(notFound){
		return (
			<div>
				<h2>404 not found</h2>
			</div>
		);
	} else {
		return (
			<div>
				<br />
				{previousBtn}
				{nextBtn}
				<br />
				<br />
				<br />

				<Grid container className={classes.grid} spacing={5}>
					{card}
				</Grid>
			</div>
		);
	}
};

export default CharacterList;
