export var __ = text => text;
export var _n = (single, plural, n) => n === 1 ? single : plural;
export var _x = text => text;
export var sprintf = function sprintf(fmt) {
  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }
  return fmt.replace(/%s/g, () => args.shift());
};