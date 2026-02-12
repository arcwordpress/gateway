<?php

namespace Gateway\Blocks\BlockTypes\Username;

/**
 * Username Block
 *
 * Displays the current username if the user is logged in,
 * or "Anonymous" if the user is not logged in.
 */
class Username extends \Gateway\Block {
	protected static string $title = 'Username';

	/**
	 * Get the block name.
	 *
	 * @return string Block name in format 'gateway/blockname'
	 */
	public static function getName(): string {
		return 'gateway/username';
	}

	/**
	 * Get the registration type.
	 *
	 * @return string Registration type ('code' for PHP-based blocks)
	 */
	public static function getRegistrationType(): string {
		return 'code';
	}

	/**
	 * Get block registration arguments.
	 *
	 * @return array Block registration arguments
	 */
	public static function getBlockArgs(): array {
		return [
			'render_callback' => [new static(), 'renderCallback'],
			'category'        => 'gateway',
			'style'           => 'gateway-username',
			'attributes'      => [
				'showFullName' => [
					'type'    => 'boolean',
					'default' => false,
				],
			],
			'supports'        => [
				'align'  => false,
				'html'   => false,
				'anchor' => true,
			],
		];
	}

	/**
	 * Get the stylesheet URL.
	 *
	 * @return string URL to the block's stylesheet
	 */
	public static function get_stylesheet_url(): string {
		return GATEWAY_URL . 'css/blocks/username/default.css';
	}

	/**
	 * Render the block.
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $content    Block content.
	 * @param mixed  $block      Block object.
	 * @return string Rendered block HTML.
	 */
	public function render( array $attributes, string $content, $block ): string {
		$show_full_name = $attributes['showFullName'] ?? false;

		// Check if user is logged in
		if ( is_user_logged_in() ) {
			$current_user = wp_get_current_user();

			// Get username based on attribute
			if ( $show_full_name && ! empty( $current_user->display_name ) ) {
				$username = $current_user->display_name;
			} else {
				$username = $current_user->user_login;
			}
		} else {
			$username = 'Anonymous';
		}

		// Generate wrapper attributes
		$wrapper_attributes = get_block_wrapper_attributes( [
			'class' => 'gateway-username-block',
		] );

		// Return the rendered block
		return sprintf(
			'<div %s><span class="username">%s</span></div>',
			$wrapper_attributes,
			esc_html( $username )
		);
	}
}
