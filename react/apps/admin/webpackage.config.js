const defaultConfig = require('@wordpress/scripts/config/webpack.config');

module.exports = {
  ...defaultConfig,
  externals: {
    ...(defaultConfig.externals || {}),
    react: 'React',
    'react-dom': 'ReactDOM',
  }
};