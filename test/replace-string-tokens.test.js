const replaceStringTokens = require('../src/lib/replace-string-tokens');
const assert = require('assert');

describe('lib/replace-string-tokens', function () {
  it('should map Object values to corresponding string tokens', function () {
    const data = {foo: 'bar'};

    const result = replaceStringTokens('Foo {foo}.', data);

    assert.equal(result, 'Foo bar.');
  });

  it('should insert blank String for missing Object values', function () {
    const data = {};

    const result = replaceStringTokens('Hello, {name}.', data);

    assert.equal(result, 'Hello, .');
  });
});
