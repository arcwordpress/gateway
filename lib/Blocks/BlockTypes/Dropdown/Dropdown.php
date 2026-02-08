<?php

namespace Gateway\Blocks\BlockTypes\Dropdown;

class Dropdown extends \Gateway\Block {

	protected static string $title = 'GTY Dropdown';

	public static function getName(): string {
		return 'gateway/gty-dropdown';
	}

	public static function getRegistrationType(): string {
		return 'code';
	}

	public static function getBlockArgs(): array {
		return [
			'render_callback' => [ new static(), 'renderCallback' ],
			'category' => 'common',
			'style' => 'gateway-dropdown',
			'editor_style' => 'gateway-dropdown-editor',
			'view_script_module_ids' => [ 'gateway-dropdown-view' ],
			'supports' => [
				'anchor' => true,
				'className' => true,
			],
			'attributes' => [
				'label' => [
					'type' => 'string',
					'default' => 'Dropdown Menu',
				],
				'isOpen' => [
					'type' => 'boolean',
					'default' => false,
				],
			],
		];
	}

	public static function get_stylesheet_url(): string {
		return GATEWAY_URL . 'css/blocks/dropdown/default.css';
	}

	public static function get_view_script_url(): string {
		return GATEWAY_URL . 'build/blocks/dropdown/view.js';
	}

	public function render( array $attributes, string $content, $block ): string {
		$label = ! empty( $attributes['label'] ) ? esc_html( $attributes['label'] ) : 'Dropdown Menu';

		return '<div ' . get_block_wrapper_attributes( [ 'class' => 'gty-dropdown' ] ) . ' data-wp-interactive="gateway/gty-dropdown" data-wp-context=\'{"isOpen":false}\'>
			<button class="gty-dropdown-label" data-wp-on--click="actions.toggleDropdown" aria-expanded="false" data-wp-bind--aria-expanded="context.isOpen">
				' . $label . '
				<span class="gty-dropdown-icon">▼</span>
			</button>
			<div class="gty-dropdown-content" hidden data-wp-bind--hidden="!context.isOpen">
				<InnerBlocks />
			</div>
		</div>';
	}
}
