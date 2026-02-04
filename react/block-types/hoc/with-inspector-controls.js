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
import { PanelBody, RangeControl, SelectControl } from '@wordpress/components';
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
	console.log('[GTS HOC] Checking block:', blockName);
	console.log('[GTS HOC] Block settings:', settings);
	console.log('[GTS HOC] Supports:', settings?.supports);
	console.log('[GTS HOC] gtsInspectorControls:', settings?.supports?.gtsInspectorControls);

	if (!settings?.supports?.gtsInspectorControls) {
		console.log('[GTS HOC] Block did not opt-in, skipping');
		return null;
	}

	console.log('[GTS HOC] Block opted in! Config:', settings.supports.gtsInspectorControls);
	return settings.supports.gtsInspectorControls;
};

/**
 * Higher Order Component that adds inspector controls
 * This only adds the UI controls - style application is handled by filters in index.js
 */
const withInspectorControls = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		const { name: blockName, attributes, setAttributes } = props;
		console.log('[GTS HOC] withInspectorControls called for:', blockName);
		console.log('[GTS HOC] Props:', props);

		const config = getInspectorControlsConfig(blockName);

		// If block hasn't opted in, return original component
		if (!config) {
			console.log('[GTS HOC] No config, returning original BlockEdit');
			return <BlockEdit {...props} />;
		}

		console.log('[GTS HOC] Config found! Will add controls');
		console.log('[GTS HOC] Gap support:', config.gap);

		// Get current style attribute or initialize empty object
		const currentStyle = attributes.style || {};
		const currentSpacing = currentStyle.spacing || {};
		const currentGap = currentSpacing.blockGap || '';
		const currentDisplay = currentStyle.display || '';

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
		 * Update the display value in the style attribute
		 */
		const setDisplay = (value) => {
			const newStyle = {
				...currentStyle,
				display: value
			};

			// Clean up if empty
			if (!newStyle.display) {
				delete newStyle.display;
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
				{config.display && (
					<InspectorControls>
						<PanelBody
							title={__('GTS Display Controls', 'gateway')}
							initialOpen={false}
						>
							<SelectControl
								label={__('Display', 'gateway')}
								help={__('Set the CSS display property', 'gateway')}
								value={currentDisplay}
								onChange={setDisplay}
								options={[
									{ label: __('Default', 'gateway'), value: '' },
									{ label: 'block', value: 'block' },
									{ label: 'inline', value: 'inline' },
									{ label: 'inline-block', value: 'inline-block' },
									{ label: 'flex', value: 'flex' },
									{ label: 'inline-flex', value: 'inline-flex' },
									{ label: 'grid', value: 'grid' },
									{ label: 'inline-grid', value: 'inline-grid' },
									{ label: 'flow-root', value: 'flow-root' },
									{ label: 'none', value: 'none' },
									{ label: 'contents', value: 'contents' },
									{ label: 'table', value: 'table' },
									{ label: 'table-row', value: 'table-row' },
									{ label: 'table-cell', value: 'table-cell' },
								]}
							/>
							{currentDisplay && (
								<div style={{ marginTop: '8px', fontSize: '12px', color: '#757575' }}>
									{__('Current value:', 'gateway')} <code>{currentDisplay}</code>
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
