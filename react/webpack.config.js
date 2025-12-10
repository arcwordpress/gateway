const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');
const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const blocksDir = path.resolve(__dirname, 'blocks');
const blocks = fs.readdirSync(blocksDir).filter(file => {
    const blockPath = path.join(blocksDir, file);
    return fs.statSync(blockPath).isDirectory() && 
           fs.existsSync(path.join(blockPath, 'src/index.js'));
});

const entries = blocks.reduce((acc, block) => {
    acc[`${block}/build/index`] = path.join(blocksDir, block, 'src/index.js');
    return acc;
}, {});

module.exports = {
    ...defaultConfig,
    entry: entries,
    output: {
        ...defaultConfig.output,
        path: path.resolve(__dirname, 'blocks'),
        filename: '[name].js',
        clean: false, // CRITICAL: Don't clean the output directory
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