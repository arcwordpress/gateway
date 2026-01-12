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

// Separate entries for editor scripts (index.js) and view scripts (view.js)
const editorEntries = {};
const viewEntries = {};

blocks.forEach(block => {
    // Always add editor script
    editorEntries[`${block}/build/index`] = path.join(blocksDir, block, 'src/index.js');

    // Add view script if it exists (for Interactivity API blocks)
    const viewPath = path.join(blocksDir, block, 'src/view.js');
    if (fs.existsSync(viewPath)) {
        viewEntries[`${block}/build/view`] = viewPath;
    }
});

// Base configuration for editor scripts (standard IIFE output)
const editorConfig = {
    ...defaultConfig,
    entry: editorEntries,
    output: {
        ...defaultConfig.output,
        path: path.resolve(__dirname, 'blocks'),
        filename: '[name].js',
        clean: false,
        // Explicitly disable module output for editor scripts
        module: false,
    },
    experiments: {
        ...defaultConfig.experiments,
        // Ensure output modules are disabled for editor
        outputModule: false,
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

// Configuration for view scripts (ES module output for Interactivity API)
const viewConfig = {
    ...defaultConfig,
    entry: viewEntries,
    output: {
        ...defaultConfig.output,
        path: path.resolve(__dirname, 'blocks'),
        filename: '[name].js',
        clean: false,
        module: true, // Output ES modules
        chunkFormat: 'module',
        library: {
            type: 'module',
        },
    },
    experiments: {
        ...defaultConfig.experiments,
        outputModule: true, // Enable ES module output
    },
    // Remove WordPress externals for view scripts since they're loaded as modules
    externals: {},
    plugins: [
        ...defaultConfig.plugins.filter(
            plugin => !(plugin instanceof MiniCssExtractPlugin)
        ),
    ],
};

// Only export view config if there are view entries
const configs = [editorConfig];
if (Object.keys(viewEntries).length > 0) {
    configs.push(viewConfig);
}

module.exports = configs;