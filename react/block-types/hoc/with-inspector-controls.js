/**
 * Higher Order Component for adding inspector controls to blocks that opt-in
 *
 * Blocks can opt-in by adding to their block.json:
 * "supports": {
 *   "gtsInspectorControls": {
 *     "gap": true
 *   }
 * }
 *
 * The HOC transparently adds the controls and applies styles without requiring
 * any changes to the block implementation.
 */

import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, RangeControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { createHigherOrderComponent } from '@wordpress/compose';

/**
 * Check if a block has opted into GTS inspector controls
 *
 * @param {string} blockName - The block name
 * @returns {Object|null} - The inspector controls config or null
 */
const getInspectorControlsConfig = (blockName) => {
	const settings = wp.blocks.getBlockType(blockName);
	if (!settings?.supports?.gtsInspectorControls) {
		return null;
	}
	return settings.supports.gtsInspectorControls;
};

/**
 * Higher Order Component that adds inspector controls
 * This only adds the UI controls - style application is handled by filters in index.js
 */
const withInspectorControls = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		const { name: blockName, attributes, setAttributes } = props;
		const config = getInspectorControlsConfig(blockName);

		// If block hasn't opted in, return original component
		if (!config) {
			return <BlockEdit {...props} />;
		}

		// Get current style attribute or initialize empty object
		const currentStyle = attributes.style || {};
		const currentSpacing = currentStyle.spacing || {};
		const currentGap = currentSpacing.blockGap || '';

		/**
		 * Update the gap value in the style attribute
		 */
		const setGap = (value) => {
			const newStyle = {
				...currentStyle,
				spacing: {
					...currentSpacing,
					blockGap: value
				}
			};

			// Clean up empty objects
			if (!newStyle.spacing.blockGap) {
				delete newStyle.spacing.blockGap;
			}
			if (Object.keys(newStyle.spacing || {}).length === 0) {
				delete newStyle.spacing;
			}

			setAttributes({
				style: Object.keys(newStyle).length > 0 ? newStyle : undefined
			});
		};

		/**
		 * Parse gap value to number (assumes px unit)
		 */
		const parseGapValue = (gap) => {
			if (!gap) return 0;
			const match = gap.match(/^(\d+)px$/);
			return match ? parseInt(match[1], 10) : 0;
		};

		/**
		 * Format number to gap string
		 */
		const formatGapValue = (num) => {
			return num > 0 ? `${num}px` : '';
		};

		const gapValue = parseGapValue(currentGap);

		return (
			<>
				<BlockEdit {...props} />
				{config.gap && (
					<InspectorControls>
						<PanelBody
							title={__('GTS Layout Controls', 'gateway')}
							initialOpen={false}
						>
							<RangeControl
								label={__('Gap', 'gateway')}
								help={__('Set the gap between child elements (CSS gap property)', 'gateway')}
								value={gapValue}
								onChange={(value) => setGap(formatGapValue(value))}
								min={0}
								max={100}
								step={1}
								allowReset
								resetFallbackValue={0}
							/>
							{gapValue > 0 && (
								<div style={{ marginTop: '8px', fontSize: '12px', color: '#757575' }}>
									{__('Current value:', 'gateway')} <code>{currentGap}</code>
								</div>
							)}
						</PanelBody>
					</InspectorControls>
				)}
			</>
		);
	};
}, 'withInspectorControls');

export default withInspectorControls;
