'use strict';
const path = require('path');

module.exports = app => {
  const dirs = app.loader.getLoadUnits().map(unit => path.join(unit.path, 'app', 'rmq', 'controller'));
  app.rmq.controller = app.rmq.controller || {};
  app.loader.loadController({
    directory: dirs,
    target: app.rmq.controller,
  });
};
