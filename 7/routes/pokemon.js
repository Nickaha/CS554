const express = require('express');
const router = express.Router();
const data = require('../data');
const pokemonData = data.pokemons;
const redis = require('redis');
const bluebird = require('bluebird');
const client = redis.createClient();


bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

router.get('/page/:page', async (req, res) => {
  let pageId = req.params.page;
  let doesIdExist = await client.hexistsAsync("pokemonPage", req.params.page);
  if (doesIdExist === 1) {
    let showFromRedis = await client.hgetAsync("pokemonPage", req.params.page);
    showFromRedisToJson = JSON.parse(showFromRedis);
    res.status(200).send(showFromRedisToJson);
} else{
    try {
      if (!req.params.page) throw 'You must specify an ID to query';
      const listedPokemonInfo = await pokemonData.getPokemonListByPageId(pageId);
      if(listedPokemonInfo.results.length===0)  res.status(404).json('404');
      else{ 
        await client.hmsetAsync('pokemonPage', pageId, JSON.stringify(listedPokemonInfo));
        res.json(listedPokemonInfo);
      }
    } catch (e) {
      res.status(404).json({ message: e });
    }
  }
 
});

router.get('/:id', async (req, res) => {
  let pokemonid = req.params.id;
  let doesIdExist = await client.hexistsAsync("pokemonDetailPage", req.params.id);
  if (doesIdExist === 1) {
    let showFromRedis = await client.hgetAsync("pokemonDetailPage", req.params.id);
    showFromRedisToJson = JSON.parse(showFromRedis);
    res.status(200).send(showFromRedisToJson);
} else{
  try {
    if (!req.params.id) throw 'You must specify an ID to query';
    const detailedPokemonInfo = await pokemonData.getPokemonDetailByPokemonId(pokemonid);
    await client.hmsetAsync('pokemonDetailPage', pokemonid, JSON.stringify(detailedPokemonInfo));
    res.json(detailedPokemonInfo);
  } catch (e) {
    res.status(404).json({ message: e });
  }
}
});









module.exports = router;