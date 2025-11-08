<?php
/**
 * Render callback for Gateway Field Blocks
 *
 * These blocks are designed to work within a Granular Form Block (future implementation)
 * and will be rendered dynamically on the frontend.
 *
 * @package Gateway
 */

// Block attributes
$block_attributes = $attributes ?? [];
$block_content = $content ?? '';

// For now, field blocks don't render anything on the frontend
// They will be rendered by the parent Granular Form Block in the future
return '';
