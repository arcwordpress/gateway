const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

// Check if we're building the library or standalone version
const isLibrary = process.env.npm_lifecycle_script &&
                  process.env.npm_lifecycle_script.includes('src/lib.js');

module.exports = {
  ...defaultConfig,
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    '@wordpress/element': 'wp.element'
  },
  output: {
    ...defaultConfig.output,
    // For library builds, output as a proper module
    ...(isLibrary && {
      library: {
        name: '@gateway/grid',
        type: 'umd'
      },
      globalObject: 'this'
    })
  }
};
