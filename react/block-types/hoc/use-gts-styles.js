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

const hasDisplaySupport = (blockName) => {
	const settings = wp.blocks.getBlockType(blockName);
	return settings?.supports?.gtsInspectorControls?.display === true;
};

/**
 * Get HOC-injected styles for a block
 *
 * @param {string} blockName - The block name (e.g., 'gateway/gty-section')
 * @param {Object} attributes - The block attributes
 * @returns {Object} - Style object to spread into block wrapper
 */
export const useGTSStyles = (blockName, attributes) => {
	console.log('[GTS useGTSStyles] Called for:', blockName);
	console.log('[GTS useGTSStyles] Attributes:', attributes);

	const styles = {};

	// Add gap if block supports it
	const supportsGap = hasGapSupport(blockName);
	console.log('[GTS useGTSStyles] Supports gap:', supportsGap);

	if (supportsGap) {
		const gap = attributes?.style?.spacing?.blockGap;
		console.log('[GTS useGTSStyles] Gap value:', gap);
		if (gap) {
			styles.gap = gap;
		}
	}

	// Add display if block supports it
	const supportsDisplay = hasDisplaySupport(blockName);
	console.log('[GTS useGTSStyles] Supports display:', supportsDisplay);

	if (supportsDisplay) {
		const display = attributes?.style?.display;
		console.log('[GTS useGTSStyles] Display value:', display);
		if (display) {
			styles.display = display;
		}
	}

	console.log('[GTS useGTSStyles] Returning styles:', styles);

	// Future: Add more HOC-injected styles here
	// e.g., padding, margin, other layout properties

	return styles;
};
