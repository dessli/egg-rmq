'use strict';

const mock = require('egg-mock');

describe('test/rmq.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/rmq-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect('hi, rmq')
      .expect(200);
  });
});
