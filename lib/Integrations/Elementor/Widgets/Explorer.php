<?php

namespace Gateway\Integrations\Elementor\Widgets;

if (!defined('ABSPATH')) {
    exit;
}

class Explorer extends \Elementor\Widget_Base
{
    public function get_name(): string
    {
        return 'gateway_explorer';
    }

    public function get_title(): string
    {
        return 'Gateway Explorer';
    }

    public function get_icon(): string
    {
        return 'eicon-search';
    }

    public function get_categories(): array
    {
        return ['general'];
    }

    public function get_keywords(): array
    {
        return ['gateway', 'explorer', 'collection', 'search', 'browse', 'data'];
    }

    protected function _register_controls(): void
    {
        $this->start_controls_section('content_section', [
            'label' => 'Explorer',
            'tab'   => \Elementor\Controls_Manager::TAB_CONTENT,
        ]);

        $this->add_control('collection', [
            'label'       => 'Collection',
            'type'        => \Elementor\Controls_Manager::SELECT,
            'options'     => $this->getCollectionOptions(),
            'default'     => '',
            'description' => 'The main collection to browse (e.g. docs).',
        ]);

        $this->add_control('group_collection', [
            'label'       => 'Group Collection',
            'type'        => \Elementor\Controls_Manager::SELECT,
            'options'     => $this->getCollectionOptions(),
            'default'     => '',
            'description' => 'Collection whose records form the navigation groups (e.g. doc_groups). Items are grouped by a foreign-key field in the main collection that references this collection\'s ID.',
        ]);

        $this->end_controls_section();
    }

    protected function render(): void
    {
        $settings         = $this->get_settings_for_display();
        $collection_key   = sanitize_text_field($settings['collection']       ?? '');
        $group_coll_key   = sanitize_text_field($settings['group_collection'] ?? '');
        $is_edit          = \Elementor\Plugin::$instance->editor->is_edit_mode();

        if (empty($collection_key)) {
            if ($is_edit) {
                echo '<div class="gateway-explorer-placeholder" style="border:2px dashed #cbd5e1;border-radius:6px;padding:1.5rem;color:#64748b;font-family:sans-serif;">Gateway Explorer: select a collection in the panel.</div>';
                $this->renderCollectionList();
            }
            return;
        }

        // Resolve collection instances from the registry.
        $registry       = null;
        $mainCollection = null;
        $groupCollection = null;

        try {
            $registry = \Gateway\Plugin::getInstance()->getRegistry();
            if ($registry) {
                $mainCollection  = $registry->get($collection_key);
                if (!empty($group_coll_key)) {
                    $groupCollection = $registry->get($group_coll_key);
                }
            }
        } catch (\Throwable $e) {
            // Registry not ready.
        }

        // Fetch groups, then items grouped under each.
        $groups         = [];
        $items_by_group = [];
        $fkField        = '';

        if ($groupCollection && $mainCollection) {
            try {
                $fkField = $this->discoverForeignKey($mainCollection, $groupCollection);
                $groups  = $groupCollection->newQuery()->get()->all();

                foreach ($groups as $group) {
                    $gid                   = (int) ($group->id ?? 0);
                    $items_by_group[$gid]  = $mainCollection->newQuery()
                        ->where($fkField, $gid)
                        ->get()
                        ->all();
                }
            } catch (\Throwable $e) {
                // Leave nav empty; render without groups.
            }
        }

        $active_item_id = isset($_GET['explorer_item'])
            ? (int) $_GET['explorer_item']
            : null;

        $this->renderExplorer($collection_key, $group_coll_key, $groups, $items_by_group, $fkField, $active_item_id, $is_edit);
    }

    // ── Rendering ─────────────────────────────────────────────────────────────

    private function renderExplorer(
        string $collection_key,
        string $group_coll_key,
        array  $groups,
        array  $items_by_group,
        string $fkField,
        ?int   $active_item_id,
        bool   $is_edit
    ): void {
        $has_groups = !empty($groups);
        ?>
        <div class="gateway-explorer"
             data-gateway-explorer=""
             data-schema="<?php echo esc_attr($collection_key); ?>"
             data-group-schema="<?php echo esc_attr($group_coll_key); ?>"
             data-fk-field="<?php echo esc_attr($fkField); ?>"
             style="display:flex;gap:0;font-family:sans-serif;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;min-height:300px;">

            <?php if ($has_groups): ?>
            <nav class="gateway-explorer-nav"
                 style="width:240px;flex-shrink:0;background:#f8fafc;border-right:1px solid #e2e8f0;padding:.5rem 0;overflow-y:auto;">

                <?php foreach ($groups as $group):
                    $gid   = (int) ($group->id ?? 0);
                    $items = $items_by_group[$gid] ?? [];
                    $this->renderNavGroup($group, $items, $active_item_id, $is_edit);
                endforeach; ?>

            </nav>
            <?php endif; ?>

            <div class="gateway-explorer-content"
                 style="flex:1;padding:1.5rem;display:flex;align-items:center;justify-content:center;color:#94a3b8;">
                <div style="text-align:center;">
                    <div style="font-size:1.25rem;font-weight:600;color:#64748b;margin-bottom:.5rem;">Gateway Explorer</div>
                    <div style="font-size:.875rem;">
                        Collection: <code><?php echo esc_html($collection_key); ?></code>
                        <?php if ($active_item_id): ?>
                            &mdash; item&nbsp;<code><?php echo esc_html($active_item_id); ?></code>
                        <?php endif; ?>
                    </div>
                    <?php if ($is_edit && !$has_groups && !empty($group_coll_key)): ?>
                        <div style="margin-top:.75rem;font-size:.8rem;opacity:.7;">
                            No records found in <code><?php echo esc_html($group_coll_key); ?></code>,
                            or the collection could not be queried.
                        </div>
                    <?php endif; ?>
                </div>
            </div>

        </div>
        <?php
    }

    private function renderNavGroup(object $group, array $items, ?int $active_item_id, bool $is_edit): void
    {
        $label = $this->getGroupLabel($group);

        // Group heading — not clickable, acts as a section label.
        echo '<div style="padding:.5rem 1rem .25rem;font-size:.7rem;font-weight:700;'
            . 'text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;">'
            . esc_html($label)
            . '</div>';

        if (empty($items)) {
            echo '<div style="padding:.25rem 1rem .5rem;font-size:.8rem;color:#cbd5e1;font-style:italic;">No items</div>';
            return;
        }

        foreach ($items as $item) {
            $id        = (int) ($item->id ?? 0);
            $itemLabel = $this->getGroupLabel($item);
            $is_active = ($active_item_id === $id);

            $href   = $is_edit ? '#' : esc_url($this->itemUrl($id));
            $bg     = $is_active ? '#e0f2fe' : 'transparent';
            $color  = $is_active ? '#0369a1' : '#374151';
            $weight = $is_active ? '600' : '400';

            echo '<a href="' . $href . '"'
                . ' style="display:block;padding:.375rem 1rem .375rem 1.5rem;font-size:.875rem;'
                . 'text-decoration:none;background:' . $bg . ';color:' . $color . ';font-weight:' . $weight . ';'
                . 'border-left:3px solid ' . ($is_active ? '#0369a1' : 'transparent') . ';">'
                . esc_html($itemLabel)
                . '</a>';
        }

        echo '<div style="height:.5rem;"></div>';
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Try to find the BelongsTo foreign-key column on $mainCollection that
     * references $groupCollection. Falls back to "{group_key}_id".
     */
    private function discoverForeignKey(object $mainCollection, object $groupCollection): string
    {
        $groupClass = get_class($groupCollection);

        try {
            $methods = \Gateway\Collections\RelationDiscovery::discover($mainCollection);

            foreach ($methods as $methodName) {
                $relation = $mainCollection->$methodName();
                if (!($relation instanceof \Illuminate\Database\Eloquent\Relations\BelongsTo)) {
                    continue;
                }
                if (get_class($relation->getRelated()) !== $groupClass) {
                    continue;
                }
                return $relation->getForeignKeyName();
            }
        } catch (\Throwable $e) {
            // Fall through to convention-based default.
        }

        // Convention: strip trailing "s" only when it produces a plausible key.
        $key = method_exists($groupCollection, 'getCollectionKey')
            ? $groupCollection->getCollectionKey()
            : (property_exists($groupCollection, 'key') ? $groupCollection->key : '');

        return rtrim($key, 's') . '_id';
    }

    /**
     * Return the best human-readable label for a group record.
     * Checks common title/name/label field names, falls back to ID.
     */
    private function getGroupLabel(object $group): string
    {
        foreach (['title', 'name', 'label', 'slug'] as $field) {
            if (!empty($group->$field)) {
                return (string) $group->$field;
            }
        }
        return 'ID ' . ($group->id ?? '?');
    }

    /**
     * Build a URL for the given item, preserving existing query params.
     */
    private function itemUrl(int $id): string
    {
        $base   = strtok($_SERVER['REQUEST_URI'] ?? '', '?');
        $params = $_GET;
        $params['explorer_item'] = $id;
        return $base . '?' . http_build_query($params);
    }

    private function getCollectionOptions(): array
    {
        $options = ['' => '— Select a collection —'];

        try {
            $registry = \Gateway\Plugin::getInstance()->getRegistry();
            if (!$registry) return $options;

            foreach ($registry->getAll() as $key => $collection) {
                if (method_exists($collection, 'isHidden') && $collection->isHidden()) {
                    continue;
                }
                $title         = method_exists($collection, 'getTitle') ? $collection->getTitle() : $key;
                $options[$key] = $title . ' (' . $key . ')';
            }
        } catch (\Throwable $e) {
            // Registry not ready — return blank options.
        }

        return $options;
    }

    private function renderCollectionList(): void
    {
        try {
            $registry    = \Gateway\Plugin::getInstance()->getRegistry();
            $collections = $registry ? $registry->getAll() : [];
            $visible     = array_filter($collections, fn($c) => !method_exists($c, 'isHidden') || !$c->isHidden());
        } catch (\Throwable $e) {
            $visible = [];
        }

        if (empty($visible)) return;

        echo '<ul style="margin:.5em 0 0;padding-left:1.2em;font-size:.85em;opacity:.7">';
        foreach ($visible as $key => $col) {
            $title = method_exists($col, 'getTitle') ? $col->getTitle() : $key;
            echo '<li><code>' . esc_html($key) . '</code> — ' . esc_html($title) . '</li>';
        }
        echo '</ul>';
    }
}
