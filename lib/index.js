'use strict';

const loader = require('./loader');
const http = require('http');
const amqp = require('amqplib');
const RMQRouterConfigSymbol = Symbol.for('EGG-RMQ#ROUTERCONFIG');

module.exports = app => {
  loader(app);
  const config = app.config.rmq;
  // console.log(config, '#config');
  app.beforeStart(async () => {
    Object.prototype.toString.call(config.servers);
    if (Object.prototype.toString.call(config.servers) === '[object Object]') {
      for (const sv in config.servers) {
        app.rmq[sv].conn = await amqp.connect(config.servers[sv].host);
        for (const [ event, handler ] of app.rmq[sv][RMQRouterConfigSymbol].entries()) {
          console.log(event, '#createChannel multiple server');
          createServerChannels(app.rmq[sv], event, handler);
        }
      }
    } else if (Object.prototype.toString.call(config.servers) === '[object Array]') {
      for (const it of config.servers) {
        if (!it.name) {
          app.rmq.conn = await amqp.connect(it.host);
          for (const [ event, handler ] of app.rmq[RMQRouterConfigSymbol].entries()) {
            console.log(event, '#createChannel multiple server');
            createServerChannels(app.rmq, event, handler);
          }
          continue;
        }
        const sv = it.name;
        app.rmq[sv].conn = await amqp.connect(it.host);
        for (const [ event, handler ] of app.rmq[sv][RMQRouterConfigSymbol].entries()) {
          console.log(event, '#createChannel multiple server');
          createServerChannels(app.rmq[sv], event, handler);
        }
      }
    } else {
      app.rmq.conn = await amqp.connect(config.host);
      for (const [ event, handler ] of app.rmq[RMQRouterConfigSymbol].entries()) {
        console.log(event, '#createChannel single server');
        createServerChannels(app.rmq, event, handler);
      }
    }
  });

  async function createServerChannels(rmq, event, handler) {
    const ch = await rmq.conn.createChannel();
    const ctx = app.createContext({
      ch,
      queue: event,
    }, new http.ServerResponse({}));
    ctx.ip = '127.0.0.1';
    handler.call(ctx);
    if (!rmq.channel) {
      rmq.channel = {
        [event]: ch,
      };
      return;
    }
    rmq.channel[event] = ch;
  }
};
