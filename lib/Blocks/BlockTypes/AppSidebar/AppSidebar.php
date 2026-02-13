<?php

namespace Gateway\Blocks\BlockTypes\AppSidebar;

class AppSidebar extends \Gateway\Block {

	protected static string $title = 'App Sidebar';

	public static function getName(): string {
		return 'gateway/app-sidebar';
	}

	public static function getRegistrationType(): string {
		return 'code';
	}

	public static function getBlockArgs(): array {
		return [
			'render_callback' => [ new static(), 'renderCallback' ],
			'category' => 'gateway',
			'parent' => [ 'gateway/app-main' ],
			'style' => 'gateway-app-sidebar',
			'editor_style' => 'gateway-app-sidebar-editor',
			'supports' => [
				'align' => true,
				'anchor' => true,
				'className' => true,
			],
		];
	}

	public function render( array $attributes, string $content, $block ): string {
		return '<aside ' . get_block_wrapper_attributes() . '><InnerBlocks /></aside>';
	}
}
