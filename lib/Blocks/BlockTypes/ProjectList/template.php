<?php
/**
 * @var array    $attributes Block attributes
 * @var string   $content    Block content
 * @var WP_Block $block      Block instance
 */

use Gateway\Collections\GatewayProject;

// Prepare the interactivity store for projects (editor + frontend)
GatewayProject::prepareStore('gateway/projects');
?>
<div
    data-wp-interactive="gateway/projects"
    <?php echo wp_interactivity_data_wp_context(['initialized' => false]); ?>
    class="gateway-project-list"
>
    <div
        data-wp-bind--hidden="!state.loading"
        class="gateway-project-list-loading"
    >
        Loading...
    </div>

    <div
        data-wp-bind--hidden="state.loading || state.records.length > 0"
        class="gateway-project-list-empty"
    >
        No projects found
    </div>

    <ul data-wp-bind--hidden="state.loading || state.records.length === 0">
        <template data-wp-each--project="state.records">
            <li data-wp-each-child>
                <strong data-wp-text="context.project.title"></strong>
                &nbsp;—&nbsp;
                <em data-wp-text="context.project.slug"></em>
            </li>
        </template>
    </ul>
</div>
