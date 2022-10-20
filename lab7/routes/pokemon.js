const express = require('express');
const router = express.Router();
const axios = require('axios');
const redis = require('redis');
const client = redis.createClient();
const bluebird = require('bluebird');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

router.get('/page/:pagenum', async (req,res) =>{
    const offset = 20;
    const limit = 20;
    let pageExist = await client.hexistsAsync("pokemonPage", req.params.pagenum);
    if (pageExist !== 0) {
        let pokemonPageRedis = await client.hgetAsync("pokemonPage", req.params.pagenum);
        let pokemonJson = JSON.parse(pokemonPageRedis);
        res.status(200).json(pokemonJson);
    } else{
        try{
            const {data} = await axios.get(`https://pokeapi.co/api/v2/pokemon?offset=${offset*req.params.pagenum}&limit=${limit}`);
            //console.log(data);
            if(!data || data.results.length === 0){
                res.status(404).send({error: "No more data"});
            } else{
                await client.hsetAsync("pokemonPage", req.params.pagenum, JSON.stringify(data));
                res.json(data);
            }
        } catch(e){
            res.status(500).send();
        }
    }
});

router.get('/:id', async (req,res) =>{
    let pokemonExist = await client.hexistsAsync("pokemon", req.params.id);
    if(pokemonExist !== 0){
        let pokemonString = await client.hgetAsync("pokemon", req.params.id);
        let pokemonJson = JSON.parse(pokemonString);
        res.status(200).json(pokemonJson);
    } else{   
        try{
            const {data} = await axios.get(`https://pokeapi.co/api/v2/pokemon/${req.params.id}/`);
            if(!data){
                res.status(404).send({error: "No more data"});
            } else{
                await client.hsetAsync("pokemon", req.params.id,JSON.stringify(data));
                res.json(data);
            }
        } catch(e){
            res.status(500).send();
        }
    }
});

module.exports = router;