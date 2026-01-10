<?php
/**
 * @var array    $attributes Block attributes
 * @var string   $content    Block content
 * @var WP_Block $block      Block instance
 */
?>
<div class="gateway-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
    <?php for ($i = 1; $i <= 4; $i++): ?>
        <div class="gateway-grid-item" style="background: #f0f0f0; padding: 24px; border-radius: 4px; display: flex; align-items: center; justify-content: center; min-height: 100px;">
            <span style="font-size: 24px; font-weight: bold; color: #333;"><?php echo $i; ?></span>
        </div>
    <?php endfor; ?>
</div>
