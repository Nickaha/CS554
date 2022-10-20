const express = require('express');
const router = express.Router();
const axios = require('axios');
const redis = require('redis');
const flat = require('flat');
const unflat = flat.unflat;
const client = redis.createClient();
const bluebird = require('bluebird');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

router.get('/',async (req,res)=>{
    // check if the page exists
    let checkExists = await client.existsAsync('mainpage');
    if (checkExists === 1){
        let pageFromRedis = await client.getAsync('mainpage');
        res.send(pageFromRedis);
    } else{
        try{
            const url='http://api.tvmaze.com/shows';
            const {data} = await axios.get(url);
            let hasNoShow=false;
            if(data.length==0){
                hasNoShow=true;
            }
            // let shows = [];
            // if (data.length>21){
            //     shows = data.slice(0,20);
            // } else{
            //     shows = data;
            // }
            // console.log(shows);
            res.render('shows/index',{title:"Shows", shows:data, hasNoShow:hasNoShow},async function (err,html){
                await client.setAsync('mainpage',html);
                res.send(html);
            });
        } catch(e){
            console.log(e);
            res.status(500).json({ error: e });
        }
    }
});
router.post('/search',async (req, res) => {
    let search = req.body;
    let errors = "";

    if(!search.searchTerm){
        errors='no searching term';
    }
    if(search.searchTerm.trim().length===0 && search.searchTerm.length>0){
        errors=`search only has spaces`;
    }
    if (errors.length > 0) {
        res.status(400).render('shows/errors', {
            errors: errors,
            hasErrors: true,
            title:"Errors"
        });
        return;
    }         
    let setexists = await client.existsAsync('searchset');
    if (setexists === 0){
        await client.zaddAsync("searchset",1,search.searchTerm);
    }else{
        let ifexist = await client.zrankAsync("searchset",search.searchTerm);
        if(ifexist){
            await client.zincrbyAsync('searchset',1,search.searchTerm);
        } else{
            await client.zaddAsync('searchset',1,search.searchTerm);
        }
    }

    let checkExists = await client.existsAsync(search.searchTerm);
    if (checkExists === 1){
        let pageFromRedis = await client.getAsync(search.searchTerm);
        res.send(pageFromRedis);
    } else{
        try{
            const url = 'http://api.tvmaze.com/search/shows?q='+search.searchTerm;
            const {data} = await axios.get(url);
            //console.log(data);
            let hasNoShow=false;
            if(data.length==0){
                hasNoShow=true;
            }
            res.render('shows/result',{title:"Show Found", shows:data, searchTerm:search.searchTerm, hasNoShow:hasNoShow},async function (err, html){
                await client.setAsync(search.searchTerm,html);
                res.send(html);
            });
        } catch(e){
            console.log(e);
            res.status(500).json({ error: e });
        }
    }
});
module.exports = router;