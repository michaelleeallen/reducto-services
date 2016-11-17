# @reducto/services
A collection of higher-order, express middleware that handle calling web APIs. These middlewares make it simple to create [BFF's](http://samnewman.io/patterns/architectural/bff/), [aggregation](http://www.enterpriseintegrationpatterns.com/patterns/messaging/Aggregator.html) and orchestration services.

## Usage
Create reusable middleware functions by calling the configuration functions provided by `@reducto/services`.
### service
Make a single web API call utilizing [request](https://www.npmjs.com/package/request) module:
```js
const app = require('express')();
const { service } = require('@reducto/services');
const getResource = service({
  uri: 'http://example.com/api/myresource',
  method: 'GET',
  json: true
});

app.get('/simple/return', getResource, (req, res) => res.json(res.locals));
app.get('/do/something/interesting', getResource, (req, res) => {
  // do something interesting with response data
  // NOTE: all response data is stored at res.locals
});

// more express stuff here
```
### batch
Make multiple, asynchronous `service` calls:
```js
const app = require('express')();
const { batch } = require('@reducto/services');
const getAllResources = batch({
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
});

app.get('/someurl', getAllResources, (req, res) => res.json(res.locals));

// more express stuff here
```
### iterator
Make `batch` service calls based on a list of context objects. These lists can be the result of other service calls, or anything located in `res.locals`:
```js
const app = require('express')();
const { iterator, service } = require('@reducto/services');
const getResourceIds = service({
  // lets pretend this API returns a list of "myresource" id's as {"ids": [...]}
  uri: 'http://example.com/api/myresources',
  method: 'GET',
  json: true
});
const getResourceDetails = iterator({
  key: 'ids',
  service: {
    uri: 'http://example.com/api/myresources/{id}',
    json: true
  }
});

app.get('/resources', getResourceIds, getResourceDetails, (req, res) => res.json(res.locals));

// more express stuff here
```

## API
### service
*dataPath* - the root key path of the returned data

*dataKey* - the key where service response data will be stored in `res.locals`

*context* - the data to use when building the service request parameters

**NOTE:** see [request](https://www.npmjs.com/package/request) module for HTTP request options.

### batch
*services* - a list of `service` configurations

### iterator
*key* - the location of the list of context objects in `res.locals`

*service* - the service configuration to use for batch request(will utilize context objects specified by *key*)

## Installation
Requires node `v4` or greater.
```shell
$ npm i -S @reducto/services
```

## License
[MIT](LICENSE)
