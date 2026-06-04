function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
// INTERNAL USE ONLY: These API helpers are not exported from the main package API.
// Consumers should use the Gateway Data Package (@arcwp/gateway-data) directly for data access.
import { collectionApi, getApiClient } from "../../data";

/**
 * Get all collections
 */
export var getCollections = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* () {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var config = {};
    if (options.auth) {
      config.auth = options.auth;
    }
    return collectionApi.fetchCollections({}, config);
  });
  return function getCollections() {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Get a single collection by key
 */
export var getCollection = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(function* (key) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var config = {};
    if (options.auth) {
      config.auth = options.auth;
    }
    return collectionApi.fetchCollection(key, config);
  });
  return function getCollection(_x) {
    return _ref2.apply(this, arguments);
  };
}();

/**
 * Get a single record by ID
 */
export var getRecord = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator(function* (endpoint, id) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var client = getApiClient();
    var config = {};
    if (options.auth) {
      config.auth = options.auth;
    }
    var response = yield client.get("".concat(endpoint, "/").concat(id), config);
    return response.data;
  });
  return function getRecord(_x2, _x3) {
    return _ref3.apply(this, arguments);
  };
}();

/**
 * Create a new record using the collection endpoint
 */
export var createRecord = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator(function* (endpoint, data) {
    var _response$data;
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var client = getApiClient();
    var config = {};
    if (options.auth) {
      config.auth = options.auth;
    }
    var response = yield client.post(endpoint, data, config);
    return ((_response$data = response.data) === null || _response$data === void 0 ? void 0 : _response$data.data) || response.data;
  });
  return function createRecord(_x4, _x5) {
    return _ref4.apply(this, arguments);
  };
}();

/**
 * Update an existing record
 */
export var updateRecord = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator(function* (endpoint, id, data) {
    var _response$data2;
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    var client = getApiClient();
    var config = {};
    if (options.auth) {
      config.auth = options.auth;
    }
    var response = yield client.put("".concat(endpoint, "/").concat(id), data, config);
    return ((_response$data2 = response.data) === null || _response$data2 === void 0 ? void 0 : _response$data2.data) || response.data;
  });
  return function updateRecord(_x6, _x7, _x8) {
    return _ref5.apply(this, arguments);
  };
}();