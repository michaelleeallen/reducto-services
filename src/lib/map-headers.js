const REQ_HEADER_VALUE = 'FROM_REQUEST';

module.exports = function (config, req) {
  if (config.headers) {
    return Object.keys(config.headers)
      .reduce((result, key) => {
        if (config.headers[key] === REQ_HEADER_VALUE) {
          if (!req.headers || !req.headers[key]) {
            throw new TypeError(`Missing required request header: ${key}.`);
          } else {
            result[key] = req.headers[key];
          }
        } else {
          result[key] = config.headers[key];
        }
        return result;
      }, {});
  }
};
