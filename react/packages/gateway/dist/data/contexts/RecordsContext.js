function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
import { createContext } from 'react';

/**
 * Context for collection records without metadata
 * Lightweight provider for public/read-only access
 */
export var RecordsContext = /*#__PURE__*/createContext({
  // Records data
  records: [],
  loading: false,
  error: null,
  // Operations
  refresh: function () {
    var _refresh = _asyncToGenerator(function* () {});
    function refresh() {
      return _refresh.apply(this, arguments);
    }
    return refresh;
  }(),
  createRecord: function () {
    var _createRecord = _asyncToGenerator(function* () {});
    function createRecord() {
      return _createRecord.apply(this, arguments);
    }
    return createRecord;
  }(),
  // Utility
  getRecordById: () => null
});
export default RecordsContext;