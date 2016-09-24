'use strict';

var _feathers = require('feathers');

var _feathers2 = _interopRequireDefault(_feathers);

var _feathersRest = require('feathers-rest');

var _feathersRest2 = _interopRequireDefault(_feathersRest);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _waterline = require('waterline');

var _waterline2 = _interopRequireDefault(_waterline);

var _sailsDb = require('sails-db2');

var _sailsDb2 = _interopRequireDefault(_sailsDb);

var _lib = require('../lib');

var _lib2 = _interopRequireDefault(_lib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (!global._babelPolyfill) {
  require('babel-polyfill');
}

var ORM = new _waterline2.default();
var config = {
  adapters: {
    'default': _sailsDb2.default,
    mydb2Adapter: _sailsDb2.default
  },
  connections: {
    myDb2Connection: {
      adapter: 'mydb2Adapter',
      host: 'localhost',
      port: 50001,
      user: 'ddubon',
      password: 'FAJARDO2indig',
      database: 'Indigo',
      schemaDB2: 'Indigo'
    }
  },
  defaults: {
    migrate: 'alter'
  }
};
var Todo = _waterline2.default.Collection.extend({
  identity: 'todo',
  schema: true,
  connection: 'myDb2Connection',
  attributes: {
    text: {
      type: 'string',
      required: true
    },

    complete: {
      type: 'boolean'
    }
  }
});

// Create a feathers instance.
var app = (0, _feathers2.default)()
// Enable REST services
.configure((0, _feathersRest2.default)())
// Turn on JSON parser for REST services
.use(_bodyParser2.default.json())
// Turn on URL-encoded parser for REST services
.use(_bodyParser2.default.urlencoded({ extended: true }));

module.exports = new Promise(function (resolve) {
  ORM.loadCollection(Todo);
  ORM.initialize(config, function (error, data) {
    if (error) {
      console.error(error);
    }

    // Create a Waterline Feathers service with a default page size of 2 items
    // and a maximum size of 4
    app.use('/todos', (0, _lib2.default)({
      Model: data.collections.todo,
      paginate: {
        default: 2,
        max: 4
      }
    }));

    app.use(function (error, req, res, next) {
      res.json(error);
    });

    // Start the server
    var server = app.listen(3030);
    server.on('listening', function () {
      console.log('Feathers Todo waterline service running on 127.0.0.1:3030');
      resolve(server);
    });
  });
});
