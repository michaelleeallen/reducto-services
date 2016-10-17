const batch = require('../src/batch');
const assert = require('assert');
const td = require('testdouble');
const nock = require('nock');

describe('batch', function () {
  it('should call a list of services', function (done) {
    const config = {
      services: [
        {
          uri: 'http://localhost/resource/1',
          json: true
        },
        {
          uri: 'http://localhost/resource/2',
          json: true
        },
        {
          uri: 'http://localhost/resource/3',
          json: true
        }
      ]
    };

    const req = {};
    const next = td.function();
    var res = {locals: {}};
    var scope1 = nock('http://localhost').get('/resource/1').reply(200, {one: '1'});
    var scope2 = nock('http://localhost').get('/resource/2').reply(200, {two: '2'});
    var scope3 = nock('http://localhost').get('/resource/3').reply(200, {three: '3'});

    batch(config)(req, res, next);

    setTimeout(() => {
      scope1.done();
      scope2.done();
      scope3.done();
      assert.deepEqual(res.locals, {
        one: '1',
        two: '2',
        three: '3'
      });
      done();
    }, 300);
  });
});
