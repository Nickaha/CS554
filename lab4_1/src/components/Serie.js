import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import noImage from '../img/download.jpeg';
import {
    makeStyles,
    Card,
    CardContent,
    CardMedia,
    Typography,
    CardHeader
} from '@material-ui/core';
import '../App.css';
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

const Serie = (props) => {
    const [serieData, setSerieData] = useState('');
    const [loading, setLoading] = useState(true);
    const [pageNotExist, setPageNotExist] = useState(false);
    const classes = useStyles();
    const regex = /(<([^>]+)>)/gi;
    useEffect(() => {
        console.log('useEffect fired');
        async function fetchData() {
            try {
                const md5 = require('blueimp-md5');
                const publickey = 'f4282b123688c00a216a437ea9b0c2b3';
                const privatekey = 'ad853a5b1a8ae184aac90d3a9e57723d5c1b72e0';
                const ts = new Date().getTime();
                const stringToHash = ts + privatekey + publickey;
                const hash = md5(stringToHash);
                const baseUrl = 'https://gateway.marvel.com:443/v1/public/series';
                const url = baseUrl + '?ts=' + ts + '&apikey=' + publickey + '&hash=' + hash + '&id';
                const { data } = await axios.get(`${url}=${props.match.params.id}`);
                setSerieData(data.data.results[0]);
                setPageNotExist(false);
                setLoading(false);
            } catch (e) {
                console.log(e);
                setPageNotExist(true);
            }
        }
        fetchData();
    }, [props.match.params.id]);
    if (pageNotExist) {
        return (
            <div>
                <h2>Status: 404</h2>
                <h2>The page is not exist!</h2>
            </div>
        );
    }
    if (loading) {
        return (
            <div>
                <h2>Loading....</h2>
            </div>
        );
    } else {
        var portraitImg = serieData.thumbnail.path + '/portrait_xlarge.' + serieData.thumbnail.extension;
        return (
            <Card className={classes.card} variant="outlined">
                <CardHeader className={classes.titleHead} title={serieData.title} />
                <CardMedia
                    className={classes.media}
                    component="img"
                    image={
                        portraitImg
                            ? portraitImg
                            : noImage
                    }
                    title="show image"
                />

                <CardContent>
                    <Typography variant="body2" color="textSecondary" component="span">
                        <p>
                            <dt className="title">Description:</dt>
                            {serieData && serieData.description ? (
                                <dd>{serieData.description.replace(regex, '')}</dd>
                            ) : (
                                <dd>No description</dd>
                            )}
                        </p>

                        <p>
                            <dt className="title">StartYear:</dt>
                            {serieData && serieData.startYear ? (
                                <dd>{serieData.startYear}</dd>
                            ) : (
                                <dd>N/A</dd>
                            )}
                        </p>

                        <p>
                            <dt className="title">EndYear:</dt>
                            {serieData && serieData.endYear ? (
                                <dd>{serieData.endYear}</dd>
                            ) : (
                                <dd>N/A</dd>
                            )}
                        </p>

                        <p>
                            <dt className="title">Type:</dt>
                            {serieData && serieData.type ? (
                                <dd>{serieData.type}</dd>
                            ) : (
                                <dd>N/A</dd>
                            )}
                        </p>

                        <p>
                            <dt className="title">Rating:</dt>
                            {serieData && serieData.rating ? (
                                <dd>{serieData.rating}</dd>
                            ) : (
                                <dd>N/A</dd>
                            )}
                        </p>

                        <p>
                            <dt className="title">Creators:</dt>
                            {serieData && serieData.creators && serieData.creators.items.length >= 1 ? (
                                <span>
                                    {serieData.creators.items.map((creator) => {
                                        if (serieData.creators.items.length > 1)
                                            return <dd key={creator.name}>{creator.name},</dd>;
                                        return <dd key={creator.name}>{creator.name}</dd>;
                                    })}
                                </span>
                            ) : (
                                <dd>N/A</dd>
                            )}
                        </p>

                        <p>
                            <dt className="title">Characters:</dt>
                            {serieData && serieData.characters && serieData.characters.items.length >= 1 ? (
                                <span>
                                        {serieData.characters.items.map((child) => {
                                            var number = child.resourceURI.split("/")[6];
                                            return <li key={number}><Link key={number} className="showlink" to={`/characters/${number}`}>{child.name}</Link></li>
                                        })}
                                </span>
                            ) : (
                                <dd>N/A</dd>
                            )}
                        </p>

                        <p>
                            <dt className="title">Related Comics:</dt>
                            {serieData && serieData.comics && serieData.comics.items.length >= 1 ? (
                                <span>
                                        {serieData.comics.items.map((child) => {
                                            var number = child.resourceURI.split("/")[6];
                                            return <li key={number}><Link key={number} className="showlink" to={`/comics/${number}`}>{child.name}</Link></li>
                                        })}
                                </span>
                            ) : (
                                <dd>N/A</dd>
                            )}
                        </p>
                    </Typography>
                </CardContent>
            </Card>
        );
    }
};

export default Serie;
