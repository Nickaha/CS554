import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import noImage from '../img/download.jpeg';
import { Link } from 'react-router-dom';
import Search from './Search';
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  makeStyles
} from '@material-ui/core';

import '../App.css';
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
function SeriesList(props) {
  const [serieData, SetSerieData] = useState('');
  const [loading, setLoading] = useState(true);
  const classes = useStyles();
  const [pagenum, setPagenum] = useState(0);
  const [searchData, setSearchData] = useState(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  let preVisible = true;
  let neVisible = true;
  let card = null;
  const regex = /(<([^>]+)>)/gi;

  useEffect(() => {
    console.log('on load useeffect');
    async function fetchData() {
      try {
        const md5 = require('blueimp-md5');
        const publickey = 'f4282b123688c00a216a437ea9b0c2b3';
        const privatekey = 'ad853a5b1a8ae184aac90d3a9e57723d5c1b72e0';
        const ts = new Date().getTime();
        const stringToHash = ts + privatekey + publickey;
        const hash = md5(stringToHash);
        const baseUrl = 'https://gateway.marvel.com:443/v1/public/series';
        const url = baseUrl + '?ts=' + ts + '&apikey=' + publickey + '&hash=' + hash + '&offset=' + props.match.params.pagenum * 20;
        const { data } = await axios.get(url);
        setPagenum(Number(props.match.params.pagenum));
        SetSerieData(data.data.results);
        setLoading(false);
      } catch (e) {
        console.log(e);
      }
    }
    fetchData();
  }, [props.match.params.pagenum]);

  useEffect(() => {
    console.log('search useEffect fired');
    async function fetchData() {
      try {
        console.log(`in fetch searchTerm: ${searchTerm}`);
        const md5 = require('blueimp-md5');
        const publickey = 'f4282b123688c00a216a437ea9b0c2b3';
        const privatekey = 'ad853a5b1a8ae184aac90d3a9e57723d5c1b72e0';
        const ts = new Date().getTime();
        const stringToHash = ts + privatekey + publickey;
        const hash = md5(stringToHash);
        const baseUrl = 'https://gateway.marvel.com:443/v1/public/series';
        const url = baseUrl + '?ts=' + ts + '&apikey=' + publickey + '&hash=' + hash + '&titleStartsWith=' + searchTerm;
        const { data } = await axios.get(url);
        setSearchData(data.data.results);
        setLoading(false);
      } catch (e) {
        console.log(e);
      }
    }
    if (searchTerm) {
      console.log('searchTerm is set');
      fetchData();
    }
  }, [searchTerm]);

  const searchValue = async (value) => {
    setSearchTerm(value);
  };

  const buildCard = (serie, portraitImg) => {
    return (
      <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={serie.id}>
        <Card className={classes.card} variant="outlined">
          <CardActionArea>
            <Link to={`/series/${serie.id}`}>
              <CardMedia
                className={classes.media}
                component="img"
                image={
                  serie.thumbnail && portraitImg
                    ? portraitImg
                    : noImage
                }
                title="show image"
              />

              <CardContent>
                <Typography
                  className={classes.titleHead}
                  gutterBottom
                  variant="h6"
                  component="h3"
                >
                  {serie.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                  {serie.description
                    ? serie.description.replace(regex, '').substring(0, 139) + '...'
                    : 'No description'}
                </Typography>
              </CardContent>
            </Link>
          </CardActionArea>
        </Card>
      </Grid>
    );
  };

  if (searchTerm) {
    card =
      searchData &&
      searchData.map((serie) => {
        return buildCard(serie);
      });
  } else {
  card =
    serieData &&
    serieData.map((serie) => {
      let portraitImg = `${serie.thumbnail.path}/portrait_xlarge.${serie.thumbnail.extension}`;
      return buildCard(serie, portraitImg);
    });
  }

  if (Number(props.match.params.pagenum) > 610 || Number(props.match.params.pagenum) % 1 !== 0) {
    return (
      <div>
        <h2>Status: 404</h2>
        <h2>The page is not exist!</h2>
      </div>
    );
  } else if (Number(props.match.params.pagenum) === 0) {
    preVisible = false;
    neVisible = true;
  } else if (Number(props.match.params.pagenum) === 610) {
    preVisible = true;
    neVisible = false;
  } else {
    preVisible = true;
    neVisible = true;
  }

  if (loading) {
    return (
      <div>
        <h2>Loading....</h2>
      </div>
    );
  } else {
    return (
      <div>
        <h2><Search searchValue={searchValue} /></h2>
        <br />
        <br />
        <div id="change_page">
          {preVisible ? <Link className="previous" onClick={() => {
            setPagenum(Number(pagenum) - 1);
            console.log('pagenum:' + pagenum)
          }}
            to={`/series/page/${pagenum - 1}`}>
            Previous page
          </Link> : null}
          <span>|</span>
          {neVisible ? <Link onClick={() => {
            setPagenum(Number(pagenum) + 1);
            console.log('pagenum:' + pagenum)
          }}
            to={`/series/page/${pagenum + 1}`}>
            Next page
          </Link> : null}
        </div>
        <br />
        <br />
        <Grid container className={classes.grid} spacing={5}>
          {card}
        </Grid>
      </div>
    );
  }
};

export default SeriesList;
