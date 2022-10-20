const axios = require('axios');

let exportedMethods = {

  async getPokemonListByPageId(pageId) {
    
    if (!pageId || pageId == null || pageId == "") throw 'pageId should be supplied';
    const {data} = await axios.get(`https://pokeapi.co/api/v2/pokemon?offset=${pageId*20}&limit=20`);
   
    return data;
  },

  async getPokemonDetailByPokemonId(id) {
    
    if (!id || id == null || id == "") throw 'Username should be supplied';
    const {data} = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
    return data;
  },


};

module.exports = exportedMethods;