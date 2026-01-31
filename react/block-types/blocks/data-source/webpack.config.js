const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

// With --experimental-modules, wp-scripts returns array: [scriptConfig, moduleConfig]
if (Array.isArray(defaultConfig)) {
    // First config is for regular scripts (index.js)
    const scriptConfig = {
        ...defaultConfig[0],
        entry: {
            index: path.resolve(process.cwd(), 'src', 'index.js'),
        },
    };
    
    // Second config is for modules (view.js)
    const moduleConfig = {
        ...defaultConfig[1],
        entry: {
            view: path.resolve(process.cwd(), 'src', 'view.js'),
        },
    };
    
    module.exports = [scriptConfig, moduleConfig];
} else {
    // Fallback for non-experimental mode
    module.exports = {
        ...defaultConfig,
        entry: {
            index: path.resolve(process.cwd(), 'src', 'index.js'),
        },
    };
}
