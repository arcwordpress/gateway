const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

module.exports = {
  ...defaultConfig,
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    '@wordpress/element': 'wp.element',
  },
};
