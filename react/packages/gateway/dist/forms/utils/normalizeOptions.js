function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
/**
 * Normalize a field's `options` config value to an array.
 *
 * Options can arrive in several formats depending on how they were stored:
 *   - Array of strings:  ["Yes", "No"]
 *   - Array of objects:  [{ value: "yes", label: "Yes" }, ...]
 *   - Newline-delimited string (from textarea input): "Yes\nNo"
 *   - Plain object (key → label map): { yes: "Yes", no: "No" }
 *   - null / undefined / anything else → treated as empty
 *
 * Returns an array of strings or { value, label } objects that the field
 * type components can iterate over safely.
 */
export function normalizeOptions(options) {
  if (Array.isArray(options)) return options;
  if (typeof options === 'string') {
    return options.split('\n').map(o => o.trim()).filter(Boolean);
  }
  if (options && typeof options === 'object') {
    return Object.entries(options).map(_ref => {
      var _ref2 = _slicedToArray(_ref, 2),
        value = _ref2[0],
        label = _ref2[1];
      return {
        value,
        label
      };
    });
  }
  return [];
}