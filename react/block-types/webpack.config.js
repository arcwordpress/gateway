const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

module.exports = {
	...defaultConfig,
	entry: {
		'blocks/router/index': './src/blocks/router/index.js',
		'blocks/router/view':  './src/blocks/router/view.js',
		'blocks/route/index':  './src/blocks/route/index.js',
	},
};
