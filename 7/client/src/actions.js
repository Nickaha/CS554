const changeSelected = (id) => ({
    type: 'CHANGE_SELECTED',
    payload: {
        id: id,
    }
});

const catchPokemon = (id,url) => ({
    type: 'CATCH_POKEMON',
    payload: {
        id: id,
        url:url
    }
});
const releasePokemon = (id,url) => ({
    type: 'RELEASE_POKEMON',
    payload: {
        id:id,
        url: url,
    }
});

const addTrainer = (name) => ({
    type: 'CREATE_TRAINER',
    payload: {
        name: name,
    }
});

const deleteTrainer = (id) => ({
    type: 'DELETE_TRAINER',
    payload: { id: id }
});

module.exports = {
    changeSelected,
    addTrainer,
    deleteTrainer,
    catchPokemon,
    releasePokemon
};