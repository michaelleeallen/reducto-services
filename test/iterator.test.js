const iterator = require('../src/iterator');
const td = require('testdouble');
const assert = require('assert');
const nock = require('nock');

describe('iterator', function () {
  it('should use iterables from a list as context for batch service calls', function (done) {
    const config = {
      key: 'ids',
      service: {
        uri: 'http://localhost/ids/{id}',
        json: true
      }
    };

    const req = {};
    const next = td.function();
    var res = {
      locals: {
        ids: [{id: 1}, {id: 2}, {id: 3}]
      }
    }

    const scope1 = nock('http://localhost').get('/ids/1').reply(200);
    const scope2 = nock('http://localhost').get('/ids/2').reply(200);
    const scope3 = nock('http://localhost').get('/ids/3').reply(200);

    iterator(config)(req, res, next);

    setTimeout(() => {
      scope1.done();
      scope2.done();
      scope3.done();
      done();
    }, 300);
  });
});
