const serviceCall = require('../src/lib/service-call');
const assert = require('assert');
const nock = require('nock');

describe('lib/service-call', function () {
  afterEach(function () {
    nock.cleanAll();
  });
  
  it('should make web service calls and return a Promise', function (done) {
    const resource = {foo: 'bar'};

    nock('http://localhost')
      .get('/api/resource')
      .reply(200, resource);

    const resourceCall = serviceCall({
      uri: 'http://localhost/api/resource',
      method: 'get',
      json: true
    }).then(result => {
      assert.deepEqual(result, resource);
      assert(resourceCall instanceof Promise);
      done();
    }).catch(done);
  });

  it('should reject if request returns an error', function (done) {
    nock('http://localhost')
      .get('/api/resource')
      .reply(500);

    const resourceCall = serviceCall({
      uri: '!~~~~****',
      method: 'get',
      json: true
    }).then(result => {
      done(new Error('Request error was not caught.'));
    }).catch(e => {
      assert(e instanceof Error);
      done();
    });
  });

  it('should reject if response has an error status code', function () {
    nock('http://localhost')
      .get('/api/resource')
      .reply(500);

    const resourceCall = serviceCall({
      uri: 'http://localhost/api/resource',
      method: 'get',
      json: true
    }).then(result => {
      done(new Error('Request error was not caught.'));
    }).catch(e => {
      assert.equal(e.statusCode, 500);
      done();
    });
  });
});
