<?php

namespace Gateway\Blocks\BlockTypes\Button;

class Button extends \Gateway\Block {

	protected static string $title = 'GTY Button';

	public static function getName(): string {
		return 'gateway/gty-button';
	}

	public static function getRegistrationType(): string {
		return 'code';
	}

	public static function getBlockArgs(): array {
		return [
			'render_callback' => [ new static(), 'renderCallback' ],
			'category' => 'gateway',
			'style' => 'gateway-button',
			'editor_style' => 'gateway-button-editor',
			'supports' => [
				'align' => true,
				'anchor' => true,
				'className' => true,
			],
			'attributes' => [
				'buttonType' => [
					'type' => 'string',
					'default' => 'a',
				],
				'href' => [
					'type' => 'string',
					'default' => '#',
				],
				'target' => [
					'type' => 'string',
					'default' => '',
				],
				'rel' => [
					'type' => 'string',
					'default' => '',
				],
				'title' => [
					'type' => 'string',
					'default' => '',
				],
			],
		];
	}

	public static function get_stylesheet_url(): string {
		return GATEWAY_URL . 'css/blocks/button/default.css';
	}

	public function render( array $attributes, string $content, $block ): string {
		$button_type = $attributes['buttonType'] ?? 'a';
		$href = $attributes['href'] ?? '#';
		$target = $attributes['target'] ?? '';
		$rel = $attributes['rel'] ?? '';
		$title = $attributes['title'] ?? '';

		$wrapper_attributes = get_block_wrapper_attributes( [ 'class' => 'gty-button' ] );

		if ( $button_type === 'button' ) {
			return '<div ' . $wrapper_attributes . '><button class="gty-button__element">' . $content . '</button></div>';
		}

		$link_attributes = 'href="' . esc_url( $href ) . '"';
		if ( ! empty( $target ) ) {
			$link_attributes .= ' target="' . esc_attr( $target ) . '"';
		}
		if ( ! empty( $rel ) ) {
			$link_attributes .= ' rel="' . esc_attr( $rel ) . '"';
		}
		if ( ! empty( $title ) ) {
			$link_attributes .= ' title="' . esc_attr( $title ) . '"';
		}

		return '<div ' . $wrapper_attributes . '><a ' . $link_attributes . ' class="gty-button__element">' . $content . '</a></div>';
	}
}
