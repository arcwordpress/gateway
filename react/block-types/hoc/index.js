/**
 * Register the Inspector Controls HOC with WordPress filters
 *
 * This applies the HOC to all blocks in the editor.
 * Individual blocks can opt-in by configuring their block.json supports.
 */

import { addFilter } from '@wordpress/hooks';
import withInspectorControls from './with-inspector-controls';

/**
 * Apply the HOC to all block Edit components
 *
 * Uses the editor.BlockEdit filter which is called when rendering
 * the Edit component of any block in the editor.
 */
addFilter(
	'editor.BlockEdit',
	'gateway/with-inspector-controls',
	withInspectorControls,
	10
);
