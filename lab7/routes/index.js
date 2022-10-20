const pokemonRoutes = require('./pokemon');

const constructorMethod = (app) =>{
    app.use('/pokemon',pokemonRoutes);

    app.use("*", (req, res) =>{
        res.sendStatus(404);
    });
};

module.exports = constructorMethod;