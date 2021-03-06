if (!global._babelPolyfill) { require('babel-polyfill'); }

import feathers from 'feathers';
import rest from 'feathers-rest';
import bodyParser from 'body-parser';
import Waterline from 'waterline';
import db2Adapter from 'sails-db2';
import waterline from '../lib';

const ORM = new Waterline();
const config = {
  adapters: {
    'default': db2Adapter,
    mydb2Adapter: db2Adapter
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
const Todo = Waterline.Collection.extend({
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
const app = feathers()
  // Enable REST services
  .configure(rest())
  // Turn on JSON parser for REST services
  .use(bodyParser.json())
  // Turn on URL-encoded parser for REST services
  .use(bodyParser.urlencoded({ extended: true }));

module.exports = new Promise(function (resolve) {
  ORM.loadCollection(Todo);
  ORM.initialize(config, (error, data) => {
    if (error) {
      console.error(error);
    }

    // Create a Waterline Feathers service with a default page size of 2 items
    // and a maximum size of 4
    app.use('/todos', waterline({
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
    const server = app.listen(3030);
    server.on('listening', function () {
      console.log('Feathers Todo waterline service running on 127.0.0.1:3030');
      resolve(server);
    });
  });
});
