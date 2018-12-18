'use strict';
const RMQSymbol = Symbol.for('EGG-RMQ#MQ');
const RMQRouterConfigSymbol = Symbol.for('EGG-RMQ#ROUTERCONFIG');

module.exports = {
  get rmq() {
    if (!this[RMQSymbol]) {
      if (Object.prototype.toString.call(this.config.rmq.servers) === '[object Object]') {
        this[RMQSymbol] = {};
        for (const sv in this.config.rmq.servers) {
          const routeMap = new Map();
          this[RMQSymbol][sv] = {};
          this[RMQSymbol][sv].route = (queue, handler) => {
            if (!routeMap.has(queue)) {
              routeMap.set(queue, handler);
            }
          };
          this[RMQSymbol][sv][RMQRouterConfigSymbol] = routeMap;
        }
      } else {
        const routeMap = new Map();
        this[RMQSymbol] = {
          route: (queue, handler) => {
            if (!routeMap.has(queue)) {
              routeMap.set(queue, handler);
            }
          },
          [RMQRouterConfigSymbol]: routeMap,
        };
      }
    }
    return this[RMQSymbol];
  },
};
