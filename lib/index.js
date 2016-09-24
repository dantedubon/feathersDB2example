'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = init;

var _lodash = require('lodash.omit');

var _lodash2 = _interopRequireDefault(_lodash);

var _uberproto = require('uberproto');

var _uberproto2 = _interopRequireDefault(_uberproto);

var _feathersQueryFilters = require('feathers-query-filters');

var _feathersQueryFilters2 = _interopRequireDefault(_feathersQueryFilters);

var _feathersErrors = require('feathers-errors');

var _feathersErrors2 = _interopRequireDefault(_feathersErrors);

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Service = function () {
  function Service(options) {
    _classCallCheck(this, Service);

    this.paginate = options.paginate || {};
    this.Model = options.Model;
    this.id = options.id || 'id';
  }

  _createClass(Service, [{
    key: 'extend',
    value: function extend(obj) {
      return _uberproto2.default.extend(obj, this);
    }
  }, {
    key: '_find',
    value: function _find(params, count) {
      var getFilter = arguments.length <= 2 || arguments[2] === undefined ? _feathersQueryFilters2.default : arguments[2];

      var _getFilter = getFilter(params.query || {});

      var filters = _getFilter.filters;
      var query = _getFilter.query;

      var where = utils.getWhere(query);
      var order = utils.getOrder(filters.$sort);
      var options = filters.$select ? { select: Array.from(filters.$select) } : {};
      var counter = this.Model.count().where(where);
      var q = this.Model.find(where, options);

      if (order) {
        q.sort(order);
      }

      if (filters.$skip) {
        q.skip(filters.$skip);
      }

      if (filters.$limit) {
        q.limit(filters.$limit);
      }

      var performQuery = function performQuery(total) {
        return q.then(function (data) {
          return {
            total: total,
            limit: filters.$limit,
            skip: filters.$skip || 0,
            data: data
          };
        });
      };

      if (count) {
        return counter.then(performQuery);
      }

      return performQuery();
    }
  }, {
    key: 'find',
    value: function find(params) {
      var paginate = params && typeof params.paginate !== 'undefined' ? params.paginate : this.paginate;
      var result = this._find(params, !!paginate.default, function (query) {
        return (0, _feathersQueryFilters2.default)(query, paginate);
      });

      if (!paginate.default) {
        return result.then(function (page) {
          return page.data;
        });
      }

      return result;
    }
  }, {
    key: '_get',
    value: function _get(id) {
      return this.Model.findOne({ id: id }).then(function (instance) {
        if (!instance) {
          throw new _feathersErrors2.default.NotFound('No record found for id \'' + id + '\'');
        }

        return instance;
      }).catch(utils.errorHandler);
    }
  }, {
    key: 'get',
    value: function get() {
      return this._get.apply(this, arguments);
    }
  }, {
    key: '_findOrGet',
    value: function _findOrGet(id, params) {
      if (id === null) {
        return this._find(params).then(function (page) {
          return page.data;
        });
      }

      return this._get(id);
    }
  }, {
    key: 'create',
    value: function create(data) {
      return this.Model.create(data).catch(utils.errorHandler);
    }
  }, {
    key: '_patch',
    value: function _patch(id, data, params) {
      var _this = this;

      var where = _extends({}, params.query);

      if (id !== null) {
        where[this.id] = id;
      }

      return this.Model.update({ where: where }, (0, _lodash2.default)(data, this.id)).then(function () {
        return _this._findOrGet(id, params);
      }).catch(utils.errorHandler);
    }
  }, {
    key: 'patch',
    value: function patch() {
      return this._patch.apply(this, arguments);
    }
  }, {
    key: 'update',
    value: function update(id, data) {
      var _this2 = this;

      if (Array.isArray(data)) {
        return Promise.reject('Not replacing multiple records. Did you mean `patch`?');
      }

      return this.Model.findOne({ id: id }).then(function (instance) {
        if (!instance) {
          throw new _feathersErrors2.default.NotFound('No record found for id \'' + id + '\'');
        }

        var copy = {};
        Object.keys(instance.toJSON()).forEach(function (key) {

          // NOTE (EK): Make sure that we don't waterline created fields to null
          // just because a user didn't pass them in.
          if ((key === 'createdAt' || key === 'updatedAt') && typeof data[key] === 'undefined') {
            return;
          }

          if (typeof data[key] === 'undefined') {
            copy[key] = null;
          } else {
            copy[key] = data[key];
          }
        });

        return _this2._patch(id, copy, {});
      }).catch(utils.errorHandler);
    }
  }, {
    key: 'remove',
    value: function remove(id, params) {
      var _this3 = this;

      return this._findOrGet(id, params).then(function (data) {
        var where = _extends({}, params.query);

        if (id !== null) {
          where.id = id;
        }

        return _this3.Model.destroy({ where: where }).then(function () {
          return data;
        });
      }).catch(utils.errorHandler);
    }
  }]);

  return Service;
}();

function init(Model) {
  return new Service(Model);
}

init.Service = Service;
module.exports = exports['default'];