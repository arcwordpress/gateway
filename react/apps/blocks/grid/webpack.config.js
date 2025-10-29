const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

module.exports = {
  ...defaultConfig,
  externals: {
    '@wordpress/blocks': 'wp.blocks',
    '@wordpress/block-editor': 'wp.blockEditor',
    '@wordpress/components': 'wp.components',
    '@wordpress/data': 'wp.data',
    '@wordpress/core-data': 'wp.coreData',
    '@wordpress/element': 'wp.element',
    '@wordpress/i18n': 'wp.i18n',
    '@wordpress/icons': 'wp.icons',
    '@wordpress/server-side-render': 'wp.serverSideRender',
  },
  resolve: {
    ...defaultConfig.resolve,
    alias: {
      ...defaultConfig.resolve.alias,
      '@gateway/grid': path.resolve(__dirname, '../../../packages/grid/src'),
    },
  },
};
