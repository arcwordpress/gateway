function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
import { useState, useEffect } from 'react';

/**
 * Factory that wraps an async fetcher with a singleton cache and returns
 * a store object paired with a React hook.
 *
 * Designed for "load once, share everywhere" data — e.g. fetching all
 * records needed for navigation or routing at app boot.
 *
 * const { store, useStore } = createStore(async () => {
 *   const res = await api.get('items');
 *   return res.data.data.items;
 * });
 *
 * store.fetch()      — call imperatively; deduplicates concurrent calls
 * store.clearCache() — force a refetch on the next fetch() / useStore() call
 * useStore()         — React hook: { data, loading, error }
 */
export function createStore(fetcher) {
  var cachedData = null;
  var pending = false;
  var listeners = [];
  var store = {
    fetch() {
      return _asyncToGenerator(function* () {
        if (cachedData) return cachedData;
        if (pending) {
          return new Promise(resolve => listeners.push(resolve));
        }
        pending = true;
        try {
          cachedData = yield fetcher();
          listeners.forEach(resolve => resolve(cachedData));
          listeners = [];
          return cachedData;
        } finally {
          pending = false;
        }
      })();
    },
    clearCache() {
      cachedData = null;
    }
  };
  function useStore() {
    var _useState = useState(cachedData),
      _useState2 = _slicedToArray(_useState, 2),
      data = _useState2[0],
      setData = _useState2[1];
    var _useState3 = useState(!cachedData),
      _useState4 = _slicedToArray(_useState3, 2),
      isLoading = _useState4[0],
      setIsLoading = _useState4[1];
    var _useState5 = useState(null),
      _useState6 = _slicedToArray(_useState5, 2),
      error = _useState6[0],
      setError = _useState6[1];
    useEffect(() => {
      if (cachedData) {
        setData(cachedData);
        setIsLoading(false);
        return;
      }
      store.fetch().then(fetchedData => {
        setData(fetchedData);
        setError(null);
      }).catch(err => {
        setError(err.message);
      }).finally(() => {
        setIsLoading(false);
      });
    }, []);
    return {
      data,
      loading: isLoading,
      error
    };
  }
  return {
    store,
    useStore
  };
}