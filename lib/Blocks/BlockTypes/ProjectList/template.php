<?php
/**
 * @var array    $attributes Block attributes
 * @var string   $content    Block content
 * @var WP_Block $block      Block instance
 */

use Gateway\Collections\GatewayProject;

// Prepare the interactivity store for projects (editor + frontend)
GatewayProject::prepareStore('gateway/projects');

// Fetch records for server-side rendering
$records = GatewayProject::query()->get()->toArray();
?>
<div class="gateway-project-list">
    <?php if (empty($records)) : ?>
        <div class="gateway-project-list-empty">No projects found</div>
    <?php else: ?>
        <ul>
            <?php foreach ($records as $rec): ?>
                <li>
                    <strong><?php echo esc_html($rec['title'] ?? ''); ?></strong>
                    &nbsp;—&nbsp;
                    <em><?php echo esc_html($rec['slug'] ?? ''); ?></em>
                </li>
            <?php endforeach; ?>
        </ul>
    <?php endif; ?>
</div>
