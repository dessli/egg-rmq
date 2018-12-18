'use strict';

const loader = require('./loader');
const http = require('http');
const amqp = require('amqplib');
const RMQRouterConfigSymbol = Symbol.for('EGG-RMQ#ROUTERCONFIG');

module.exports = app => {
  loader(app);
  const config = app.config.rmq;
  console.log(config, '#config');
  app.beforeStart(async () => {
    if (Object.prototype.toString.call(config.servers) === '[object Object]') {
      for (const sv in config.servers) {
        app.rmq[sv].conn = await amqp.connect(config.servers[sv].host);
        for (const [ event, handler ] of app.rmq[sv][RMQRouterConfigSymbol].entries()) {
          const ch = await app.rmq[sv].conn.createChannel();
          console.log(event, '#createChannel multiple server');
          const ctx = app.createContext({
            ch,
            queue: event,
          }, new http.ServerResponse({}));
          handler.call(ctx);
        }
      }
    } else {
      app.rmq.conn = await amqp.connect(config.host);
      for (const [ event, handler ] of app.rmq[RMQRouterConfigSymbol].entries()) {
        const ch = await app.rmq.conn.createChannel();
        console.log(event, '#createChannel single server');
        const ctx = app.createContext({
          ch,
          queue: event,
        }, new http.ServerResponse({}));
        handler.call(ctx);
      }
    }
  });
};
