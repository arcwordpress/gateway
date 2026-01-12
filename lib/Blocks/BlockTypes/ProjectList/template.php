<?php
/**
 * @var array    $attributes Block attributes
 * @var string   $content    Block content
 * @var WP_Block $block      Block instance
 */

?>
<div
    data-wp-interactive="gateway/projects"
    class="gateway-project-list"
>
    <div class="gateway-project-list-filter">
        <input 
            type="text" 
            placeholder="Search projects..."
            data-wp-on--input="actions.updateSearch"
        />
    </div>

    <div
        data-wp-bind--hidden="state.hasRecords"
        class="gateway-project-list-loading"
    >
        Loading...
    </div>

    <div
        data-wp-bind--hidden="state.hasRecords"
        class="gateway-project-list-empty"
    >
        No projects found
    </div>

    <ul data-wp-bind--hidden="!state.hasRecords">
        <template data-wp-each--record="state.filteredRecords">
            <li>
                <strong data-wp-text="context.record.title"></strong>
                &nbsp;—&nbsp;
                <em data-wp-text="context.record.slug"></em>
            </li>
        </template>
    </ul>

    <button data-wp-on--click="actions.updateSearch">
        Test Click
    </button>

</div>