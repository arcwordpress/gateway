<?php

namespace Gateway\Blocks\BlockTypes\AppFooter;

class AppFooter extends \Gateway\Block {

	protected static string $title = 'GTY App Footer';

	public static function getName(): string {
		return 'gateway/gty-app-footer';
	}

	public function render( array $attributes, string $content, $block ): string {
		return '<footer ' . get_block_wrapper_attributes( [ 'class' => 'app-footer' ] ) . '><InnerBlocks /></footer>';
	}
}
