// Import all blocks dynamically
const requireBlock = require.context('../blocks', true, /src\/index\.js$/);
requireBlock.keys().forEach(requireBlock);