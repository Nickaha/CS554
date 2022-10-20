const blogRoutes = require('./blogs');


const constructorMethod = (app) =>{
    app.use('/blog',blogRoutes);

    app.use("*", (req, res) =>{
        res.sendStatus(404);
    });
};

module.exports = constructorMethod;