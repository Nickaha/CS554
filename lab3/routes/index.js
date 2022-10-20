const searchRoutes = require('./search');
const showRoutes = require('./shows');
const popularRoutes = require('./popular');
const path = require('path');

const constructorMethod = (app) => {
  app.use('/', searchRoutes);
  app.use('/show', showRoutes);
  app.use('/popularsearches',popularRoutes);


  app.use('*', (req, res) => {
    res.sendStatus(404);
  });
};

module.exports = constructorMethod;