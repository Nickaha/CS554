import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { makeStyles, Card, CardContent, CardMedia, Typography, CardHeader } from '@material-ui/core';
import '../App.css';
import { useDispatch } from 'react-redux';
import actions from '../actions';
import { useSelector } from 'react-redux';

const useStyles = makeStyles({
    card: {
        maxWidth: 550,
        height: 'auto',
        marginLeft: 'auto',
        marginRight: 'auto',
        borderRadius: 5,
        border: '1px solid #1e8678',
        boxShadow: '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);'
    },
    titleHead: {
        borderBottom: '1px solid #1e8678',
        fontWeight: 'bold'
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

const Character = (props) => {
    const [characterData, setcharacterData] = useState(undefined);
    const [loading, setLoading] = useState(true);

    const [notFound, setnotFound] = useState(true);

    const classes = useStyles();
    const dispatch = useDispatch();

    const selectedTrainers = useSelector((state) => state.selected);

    const allTrainers = useSelector((state) => state.trainers);
    let targetTrainer = null;
    for (let i = 0; i < allTrainers.length; i++) {
        if (selectedTrainers === allTrainers[i].id) targetTrainer = allTrainers[i];
    }

    const catchPokemon = (id, url) => {
        console.log(url);
        dispatch(actions.catchPokemon(id, url));
    };

    const releasePokemon = (id, url) => {
        console.log(url);
        dispatch(actions.releasePokemon(id, url));
    };

    useEffect(
        () => {
            console.log("useEffect fired")
            async function fetchData() {
                try {

                    const { data } = await axios.get(`http://localhost:4000/pokemon/${parseInt(props.match.params.id)}`);
                    console.log(data);
                    setcharacterData(data);
                    setLoading(false);
                    setnotFound(false);
                } catch (e) {
                    setLoading(false);
                    console.log(e);
                }
            }
            fetchData();
        },
        [props.match.params.id]
    );



    if (loading) {
        return (
            <div>
                <h2>Loading....</h2>
            </div>
        );
    }
    else if (notFound) {
        return (
            <div>
                <h2>404 not found</h2>
            </div>
        );
    } else {
        let btn_toggle = <button onClick={() => catchPokemon(selectedTrainers, characterData.sprites.other['official-artwork'].front_default)}>Catch</button>;
        if (targetTrainer !== null) {
            if (targetTrainer.pokemons.length >= 6) {
                btn_toggle = <button >Full party</button>
            } else {
                for (let i = 0; i < targetTrainer.pokemons.length; i++) {
                    if (targetTrainer.pokemons[i] === characterData.sprites.other['official-artwork'].front_default) {
                        btn_toggle = <button onClick={() => releasePokemon(selectedTrainers, characterData.sprites.other['official-artwork'].front_default)} >Release</button>
                    }
                }
            }
        }
        return (
            <Card className={classes.card} variant='outlined'>
                <CardHeader className={classes.titleHead} title={characterData.name} />
                <CardMedia
                    className={classes.media}
                    component='img'
                    image={characterData.sprites.other['official-artwork'].front_default}
                    title='show image'
                />

                <CardContent>
                    <Typography variant='body2' color='textSecondary' component='span'>
                        <dl>

                            <p>
                                <dt className='title'>Type of this Pokemon:</dt>
                                {characterData && characterData.types.length > 0 ? (
                                    <span>
                                        {characterData.types.map((each_type, index) => {
                                            return <li key={index}>{each_type.type.name}</li>
                                        })}
                                    </span>
                                ) : <dd>N/A</dd>
                                }
                            </p>


                        </dl>
                        {btn_toggle}
                    </Typography>
                </CardContent>
            </Card>
        );
    }
};

export default Character;
