const mapHeaders = require('../src/lib/map-headers');
const assert = require('assert');

describe('lib/map-headers', function () {
  it('should return undefined if headers are not configured', function () {
    const result = mapHeaders({});

    assert.equal(result, undefined);
  });

  it('should map headers from request', function () {
    const req = {
      headers: {
        authorization: 'Basic adsf;dlskjd;lkjlkj'
      }
    };

    const config = {
      headers: {
        authorization: 'FROM_REQUEST'
      }
    };

    const result = mapHeaders(config, req);
    assert.deepEqual(result, { authorization: req.headers.authorization });
  });

  it('should throw TypeError if required request header is missing.', function () {
    const config = {
      headers: {
        authorization: 'FROM_REQUEST'
      }
    };

    assert.throws(mapHeaders.bind(null, config, {}), TypeError);
  });

  it('should map headers from config', function () {
    const config = {
      headers: {
        'X-Foo': 'bar'
      }
    };

    const result = mapHeaders(config, {});
    assert.deepEqual(result, config.headers);
  });
});
