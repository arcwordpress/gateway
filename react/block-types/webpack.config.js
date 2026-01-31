const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');
const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const blocksDir = path.resolve(__dirname, 'blocks');

// Get all block directories that have a src/index.js
const blocks = fs.readdirSync(blocksDir).filter(file => {
    const blockPath = path.join(blocksDir, file);
    return fs.statSync(blockPath).isDirectory() &&
           fs.existsSync(path.join(blockPath, 'src/index.js'));
});

// Build entry points for each block
const entries = blocks.reduce((acc, block) => {
    // Main editor script
    acc[`${block}/build/index`] = path.join(blocksDir, block, 'src/index.js');

    // Build view.js if it exists (for Interactivity API blocks)
    const viewPath = path.join(blocksDir, block, 'src/view.js');
    if (fs.existsSync(viewPath)) {
        acc[`${block}/build/view`] = viewPath;
    }

    return acc;
}, {});

module.exports = {
    ...defaultConfig,
    entry: entries,
    output: {
        ...defaultConfig.output,
        path: path.resolve(__dirname, 'blocks'),
        filename: '[name].js',
        clean: false, // Don't clean the output directory - preserves block.json, render.php, etc.
    },
    plugins: [
        ...defaultConfig.plugins.filter(
            plugin => !(plugin instanceof MiniCssExtractPlugin)
        ),
        new MiniCssExtractPlugin({
            filename: '[name].css',
        }),
    ],
};
