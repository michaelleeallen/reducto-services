const _ = require('lodash');
const replaceStringTokens = require('./lib/replace-string-tokens');
const callService = require('./lib/service-call');
const mapHeaders = require('./lib/map-headers');

const NON_REQUEST_CONFIG_KEYS = ['dataKey', 'dataPath', 'context'];

module.exports = (config) => (req, res, next) => {
    var requestConfig = _.omit(config, NON_REQUEST_CONFIG_KEYS);
    var context = _.has(config, 'context') ? config.context : _.merge({}, req.body, req.query, req.params, res.locals);
    var uri = replaceStringTokens(requestConfig.uri, context);
    var headers = mapHeaders(requestConfig, req);
    var method = _.get(requestConfig, 'method', 'get');
    var body = req.body;
    var requestConfigOverrides = _.omitBy({method, uri, headers, body}, _.isUndefined);

    _.merge(requestConfig, requestConfigOverrides);

    return callService(requestConfig)
      .then(data => (config.dataPath) ? _.get(data, config.dataPath, {}) : data)
      .then(data => {
        if (_.has(config, 'dataKey')) {
          var dataValue = res.locals[config.dataKey];
          if (_.isArray(dataValue)) {
            res.locals[config.dataKey].push(data);
          } else if (!_.isEmpty(dataValue)) {
            _.merge(res.locals[config.dataKey], data);
          } else {
            res.locals[config.dataKey] = data;
          }
        } else {
          _.merge(res.locals, data);
        }

        next();
      })
      .catch((error) => {
        error.serviceInfo = {
          name: config.name,
          uri: requestConfig.uri,
          method: requestConfig.method
        };

        next(error);
      });
};
