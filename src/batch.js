const service = require('./service');
const nextStub = () => {};

module.exports = (config) => (req, res, next) => {
  var serviceCalls = config.services.map(c => service(c)(req, res, nextStub));
  Promise.all(serviceCalls)
    .then(() => next())
    .catch(e => next(e));
};
