<?php

namespace Gateway\Blocks\BlockTypes\SVG;

class SVG extends \Gateway\Block {

	protected static string $title = 'GTY SVG';

	public static function getName(): string {
		return 'gateway/gty-svg';
	}

	public static function getRegistrationType(): string {
		return 'code';
	}

	public static function getBlockArgs(): array {
		return [
			'render_callback' => [ new static(), 'renderCallback' ],
			'category' => 'gateway',
			'style' => 'gateway-svg',
			'editor_style' => 'gateway-svg-editor',
			'supports' => [
				'align' => true,
				'anchor' => true,
				'className' => true,
			],
		];
	}

	public static function get_stylesheet_url(): string {
		return GATEWAY_URL . 'css/blocks/svg/default.css';
	}

	public function render( array $attributes, string $content, $block ): string {
		$svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
			<circle cx="50" cy="50" r="40" fill="#007bff" />
			<text x="50" y="55" text-anchor="middle" fill="white" font-size="24" font-weight="bold">SVG</text>
		</svg>';
		return '<div ' . get_block_wrapper_attributes( [ 'class' => 'gty-svg' ] ) . '>' . $svg . '</div>';
	}
}
