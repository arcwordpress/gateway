/**
 * Register the Inspector Controls HOC with WordPress filters
 *
 * This applies the HOC to all blocks in the editor.
 * Individual blocks can opt-in by configuring their block.json supports.
 *
 * Blocks call useGTSStyles() hook to receive HOC-injected styles.
 * The HOC provides inspector controls, and blocks apply the styles
 * via the hook without needing to know what specific styles are injected.
 */

import { addFilter } from '@wordpress/hooks';
import withInspectorControls from './with-inspector-controls';

console.log('[GTS HOC] Registering inspector controls HOC');
console.log('[GTS HOC] withInspectorControls:', withInspectorControls);

/**
 * Apply the HOC to all block Edit components
 * Adds the inspector controls UI
 */
addFilter(
	'editor.BlockEdit',
	'gateway/with-inspector-controls',
	withInspectorControls,
	10
);

console.log('[GTS HOC] Filter registered successfully');
