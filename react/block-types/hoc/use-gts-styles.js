/**
 * Hook for blocks to receive HOC-injected styles
 *
 * Blocks can call this hook to get styles that the HOC system provides.
 * The block doesn't need to know what styles are being injected - it just
 * applies them to its wrapper.
 *
 * Usage in a block:
 * ```js
 * import { useGTSStyles } from './path/to/use-gts-styles';
 *
 * const gtsStyles = useGTSStyles(blockName, attributes);
 * const blockProps = useBlockProps({
 *   style: {
 *     ...yourStyles,
 *     ...gtsStyles
 *   }
 * });
 * ```
 */

/**
 * Check if a block has opted into GTS inspector controls
 */
const hasGapSupport = (blockName) => {
	const settings = wp.blocks.getBlockType(blockName);
	return settings?.supports?.gtsInspectorControls?.gap === true;
};

/**
 * Get HOC-injected styles for a block
 *
 * @param {string} blockName - The block name (e.g., 'gateway/gty-section')
 * @param {Object} attributes - The block attributes
 * @returns {Object} - Style object to spread into block wrapper
 */
export const useGTSStyles = (blockName, attributes) => {
	const styles = {};

	// Add gap if block supports it
	if (hasGapSupport(blockName)) {
		const gap = attributes?.style?.spacing?.blockGap;
		if (gap) {
			styles.gap = gap;
		}
	}

	// Future: Add more HOC-injected styles here
	// e.g., padding, margin, other layout properties

	return styles;
};
