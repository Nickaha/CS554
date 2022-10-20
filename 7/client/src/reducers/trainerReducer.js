import { v4 as uuid } from 'uuid';

const initalState = [
  {
    id: uuid(),
    name: 'Red',
    pokemons: ['https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/2.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png']
  },
  {
    id: uuid(),
    name: 'Blue',
    pokemons: []
  },

];

let copyState = null;
let index = 0;

const trainerReducer = (state = initalState, action) => {
  const { type, payload } = action;

  switch (type) {
    case 'CREATE_TRAINER':
      console.log('payload', payload);
      return [
        ...state,
        { id: uuid(), name: payload.name, pokemons: [] }
      ];
    case 'DELETE_TRAINER':
      copyState = [...state];
      index = copyState.findIndex((x) => x.id === payload.id);
      copyState.splice(index, 1);
      return [...copyState];
    case 'RELEASE_POKEMON':
      copyState = [...state];
      index = copyState.findIndex((x) => x.id === payload.id);
      for(let i=0;i<copyState[index].pokemons.length;i++){
        if(copyState[index].pokemons[i]===payload.url) copyState[index].pokemons.splice(i,1);
      }
      return [...copyState];
    case 'CATCH_POKEMON':
      copyState = [...state];
      index = copyState.findIndex((x) => x.id === payload.id);
      //在这加入被捕捉的神奇宝贝
      //console.log("啦啦啦我是");
      //console.log(copyState[index].pokemons);
      try {
        copyState[index].pokemons.push(payload.url);
      } catch (error) {
        alert("you should select a trainer first");
      }

      return [...copyState];

    default:
      return state;
  }
};

export default trainerReducer;