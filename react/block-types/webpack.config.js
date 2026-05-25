const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

module.exports = {
	...defaultConfig,
	entry: {
		'blocks/app/index':    './src/blocks/app/index.js',
		'blocks/data/index':   './src/blocks/data/index.js',
		'blocks/router/index': './src/blocks/router/index.js',
		'blocks/router/view':  './src/blocks/router/view.js',
		'blocks/route/index':  './src/blocks/route/index.js',
	},
};
