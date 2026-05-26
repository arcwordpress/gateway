export const __ = (text) => text
export const _n = (single, plural, n) => n === 1 ? single : plural
export const _x = (text) => text
export const sprintf = (fmt, ...args) => fmt.replace(/%s/g, () => args.shift())
