// Stub for @wordpress/i18n — just pass strings through without translation
export const __ = (text) => text
export const _n = (single, plural, number) => (number === 1 ? single : plural)
export const _x = (text) => text
export const sprintf = (fmt, ...args) => fmt.replace(/%s/g, () => args.shift())
