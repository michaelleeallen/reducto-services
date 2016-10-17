const td = require('testdouble');
const assert = require('assert');
const service = require('../src/service');
const nock = require('nock');

const TEST_URI = 'http://localhost/test/resource';

describe('service', function () {
  afterEach(function () {
    nock.cleanAll();
  });

  it('should use a supplied context', function (done) {
    const config = {
      uri: 'http://localhost/test/{boo}',
      method: 'put',
      context: {
        boo: 'baz'
      }
    };

    const res = {
      params: {
        boo: 'bar'
      }
    };

    var scope = nock('http://localhost').put('/test/baz').reply(200, {});

    service(config)({}, res, td.function())
      .then(() => {
        scope.done();
        done();
      })
      .catch(done);
  });

  it('should default to a "GET" if no method is supplied', function (done) {
    const config = {
      uri: TEST_URI
    };

    var scope = nock('http://localhost').get('/test/resource').reply(200);

    service(config)({}, {}, td.function())
      .then(() => {
        scope.done();
        done();
      })
      .catch(done);
  });

  it('should transfer the request body to the service call', function (done) {
    const config = {
      uri: TEST_URI,
      method: 'put',
      json: true
    };

    const body = {foo: 'bar'};
    const req = {body};
    const scope = nock('http://localhost').put('/test/resource', body).reply(200);

    service(config)(req, {}, td.function())
      .then(() => {
        scope.done();
        done();
      })
      .catch(done);
  });

  it('should store response at "dataKey" if supplied', function (done) {
    const response = {foo: 'bar'};
    const config = {
      uri: TEST_URI,
      json: true,
      dataKey: 'test'
    };

    var res = {locals: {}}
    const scope = nock('http://localhost').get('/test/resource').reply(200, response);

    service(config)({}, res, td.function())
      .then(data => {
        assert.deepEqual(res.locals.test, response);
        scope.done();
        done();
      })
      .catch(done);
  });

  it('should accumulate data at a specified "dataKey"', function (done) {
    const config = {
      uri: TEST_URI,
      json: true,
      dataKey: 'test'
    };
    const config1 = Object.assign({}, config, {uri: `${TEST_URI}/1`});
    const config2 = Object.assign({}, config, {uri: `${TEST_URI}/2`});
    const config3 = Object.assign({}, config, {uri: `${TEST_URI}/3`});

    var res = {locals: {}}
    nock('http://localhost').get('/test/resource/1').reply(200, {one: '1'});
    nock('http://localhost').get('/test/resource/2').reply(200, {two: '2'});
    nock('http://localhost').get('/test/resource/3').reply(200, {three: '3'});

    Promise.all([
      service(config1)({}, res, td.function()),
      service(config2)({}, res, td.function()),
      service(config3)({}, res, td.function())
    ])
      .then(() => {
        assert.deepEqual(res.locals.test, {
          one: '1',
          two: '2',
          three: '3'
        });
        done();
      })
      .catch(done);
  });

  it('should populate an Array at a specified "dataKey"', function (done) {
    const config = {
      uri: TEST_URI,
      json: true,
      dataKey: 'test'
    };
    const config1 = Object.assign({}, config, {uri: `${TEST_URI}/1`});
    const config2 = Object.assign({}, config, {uri: `${TEST_URI}/2`});
    const config3 = Object.assign({}, config, {uri: `${TEST_URI}/3`});

    var res = {locals: {
      test: []
    }}
    nock('http://localhost').get('/test/resource/1').reply(200, '1');
    nock('http://localhost').get('/test/resource/2').reply(200, '2');
    nock('http://localhost').get('/test/resource/3').reply(200, '3');

    Promise.all([
      service(config1)({}, res, td.function()),
      service(config2)({}, res, td.function()),
      service(config3)({}, res, td.function())
    ])
      .then(() => {
        assert.deepEqual(res.locals.test, ['1', '2', '3']);
        done();
      })
      .catch(done);
  });

  it('should map response data from a provided "dataPath"', function (done) {
    const config = {
      uri: TEST_URI,
      json: true,
      dataKey: 'test',
      dataPath: 'dataContent.foo'
    };

    var res = {locals: {}}
    const next = td.function();

    var scope = nock('http://localhost').get('/test/resource').reply(200, {
      dataContent: {
        foo: 'bar'
      }
    });

    service(config)({}, res, next)
      .then(() => {
        assert.equal(res.locals.test, 'bar');
        scope.done();
        done();
      })
      .catch(done);
  });

  it('should provide service info if an Error is encountered', function (done) {
    const config = {
      uri: TEST_URI,
      json: true
    };

    var res = {locals: {}}
    const next = td.function();

    nock('http://localhost').get('/test/resource').reply(500, 'An error');

    service(config)({}, res, next);
    setTimeout(() => {
      td.verify(next(td.matchers.contains({
        statusCode: 500,
        message: 'An error',
        serviceInfo: {
          uri: TEST_URI,
          method: 'get'
        }
      })));
      done();
    }, 100);
  });
});
