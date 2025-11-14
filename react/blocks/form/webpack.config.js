const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

module.exports = {
  ...defaultConfig,
  resolve: {
    ...defaultConfig.resolve,
    alias: {
      ...defaultConfig.resolve.alias,
      '@arcwp/gateway-forms': path.resolve(__dirname, '../../packages/forms/dist'),
    },
  },
};
