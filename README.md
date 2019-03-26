# egg-rmq

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-rmq.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-rmq
[travis-image]: https://img.shields.io/travis/eggjs/egg-rmq.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-rmq
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-rmq.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-rmq?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-rmq.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-rmq
[snyk-image]: https://snyk.io/test/npm/egg-rmq/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-rmq
[download-image]: https://img.shields.io/npm/dm/egg-rmq.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-rmq

egg plugin for RabbitMQ

## Install

```bash
$ npm i egg-rmq --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.rmq = {
  enable: true,
  package: 'egg-rmq',
};
```

## Configuration

##### Single Server

```js
// {app_root}/config/config.default.js
exports.rmq = {
    host: 'amqp://localhost',
};
```

##### Multiple Server

```js
// {app_root}/config/config.default.js
exports.rmq = {
    servers: {
      test: {
        host: 'amqp://localhost',
      },
    },
  };
```

```js
// {app_root}/config/config.default.js
// If not set name then this config like Single Server, use app.rmq.conn
exports.rmq = {
    servers: [
      {
        host: 'amqp://localhost',
      },
      {
        name: 'test',
        host: 'amqp://localhost2',
      },
    ],
  };
```

##### Route queue

> use rmq.route to set Single Server channel
>
> use rmq[server name].route to set Multiple Server channel

```js
// {app_root}/router.js
module.exports = app => {
  const { router, controller, rmq } = app;
  rmq.route('hello', rmq.controller.listener.test); // hello is queue
};
```

##### Controller

> use ctx.req.ch to get Channel 
>
> use ctx.req.queue to get Queue
>
> use app.rmq.conn to get Single Server connect
>
> use app.rmq[server name].conn to get Multiple Server connect

```js
// {app_root}/rmq/controller/hello.js
module.exports = app => {
  return class TestController extends app.Controller {
    async test() {
      const { ctx } = this;
      await ctx.req.ch.assertQueue(ctx.req.queue, { durable: false });
      ctx.req.ch.consume(ctx.req.queue, msg => {
        console.log(' [x] Received %s', msg.content.toString());
        console.log(msg.properties.headers, '#hello headers');
      }, { noAck: true });
      ctx.req.ch.sendToQueue(ctx.req.queue, Buffer.from('Nodejs'), { headers: { user: 'user test' } });
    }
  };
};
```



see [config/config.default.js](config/config.default.js) for more detail.

## Questions & Suggestions

Please open an issue [here](https://github.com/Dess-Li/egg/issues).

## License

[MIT](LICENSE)
