const request = require('request');

module.exports = function (config) {
  return new Promise((resolve, reject) => {
    request(config, (error, res, body) => {
      if (error) return reject(error);
      if (res.statusCode >= 400) return reject({statusCode: res.statusCode, message: body});
      resolve(body);
    });
  });
};
