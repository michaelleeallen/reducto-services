const _ = require('lodash');
const batch = require('./batch');

module.exports = (config) => (req, res, next) => {
  var list = _.get(res.locals, config.key, []);
  var services = list.map(obj => Object.assign({context: obj}, config.service));
  batch({services})(req, res, next);
};
