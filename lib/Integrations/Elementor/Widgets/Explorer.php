<?php

namespace Gateway\Integrations\Elementor\Widgets;

if (!defined('ABSPATH')) {
    exit;
}

class Explorer extends \Elementor\Widget_Base
{
    public function get_name(): string  { return 'gateway_explorer'; }
    public function get_title(): string { return 'Gateway Explorer'; }
    public function get_icon(): string  { return 'eicon-search'; }

    public function get_categories(): array { return ['general']; }

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
            'description' => 'Collection whose records form the nav groups (e.g. doc_groups). Items are grouped by the FK in the main collection that points here.',
        ]);

        $this->add_control('set_collection', [
            'label'       => 'Set Collection',
            'type'        => \Elementor\Controls_Manager::SELECT,
            'options'     => $this->getCollectionOptions(true),
            'default'     => '',
            'description' => 'Optional. A collection one level above groups (e.g. doc_sets). Adds a dropdown at the top; switching sets filters the nav to that set\'s groups.',
        ]);

        $this->end_controls_section();
    }

    // ── Render ────────────────────────────────────────────────────────────────

    protected function render(): void
    {
        $settings       = $this->get_settings_for_display();
        $collection_key = sanitize_text_field($settings['collection']       ?? '');
        $group_coll_key = sanitize_text_field($settings['group_collection'] ?? '');
        $set_coll_key   = sanitize_text_field($settings['set_collection']   ?? '');
        $is_edit        = \Elementor\Plugin::$instance->editor->is_edit_mode();

        if (empty($collection_key)) {
            if ($is_edit) {
                echo '<div style="border:2px dashed #cbd5e1;border-radius:6px;padding:1.5rem;color:#64748b;font-family:sans-serif;">'
                    . 'Gateway Explorer: select a collection in the panel.</div>';
                $this->renderCollectionList();
            }
            return;
        }

        // Resolve collection instances from the registry.
        $mainCollection  = null;
        $groupCollection = null;
        $setCollection   = null;

        try {
            $registry = \Gateway\Plugin::getInstance()->getRegistry();
            if ($registry) {
                $mainCollection  = $registry->get($collection_key);
                if ($group_coll_key) $groupCollection = $registry->get($group_coll_key);
                if ($set_coll_key)   $setCollection   = $registry->get($set_coll_key);
            }
        } catch (\Throwable $e) {}

        // Base path for slug URLs (e.g. "/docs"). No trailing slash.
        $base_path = rtrim(parse_url(get_permalink() ?: '', PHP_URL_PATH) ?: '', '/');

        // Parse active slugs from the current request path (for SSR initial state).
        $request_path  = rtrim(strtok($_SERVER['REQUEST_URI'] ?? '', '?'), '/');
        $explorer_path = str_starts_with($request_path, $base_path)
            ? substr($request_path, strlen($base_path))
            : '';
        $segments = array_values(array_filter(explode('/', trim($explorer_path, '/'))));

        // ── Sets ──────────────────────────────────────────────────────────────

        $sets         = [];
        $set_fk_field = '';

        if ($setCollection && $groupCollection) {
            try {
                $sets         = $setCollection->newQuery()->get()->all();
                $set_fk_field = $this->discoverForeignKey($groupCollection, $setCollection);
            } catch (\Throwable $e) {}
        }

        $has_sets = !empty($sets);

        // Map set_id → set record for quick lookup when annotating groups.
        $sets_by_id = [];
        $active_set = null;
        foreach ($sets as $set) {
            $sid             = (int) ($set->id ?? 0);
            $sets_by_id[$sid] = $set;
        }

        // Determine active slugs from URL segments.
        $active_set_slug   = $has_sets ? ($segments[0] ?? null) : null;
        $active_group_slug =             $segments[$has_sets ? 1 : 0] ?? null;
        $active_item_slug  =             $segments[$has_sets ? 2 : 1] ?? null;

        if ($active_set_slug) {
            foreach ($sets as $set) {
                if (($set->slug ?? '') === $active_set_slug) {
                    $active_set = $set;
                    break;
                }
            }
        }

        // ── Groups + Items ────────────────────────────────────────────────────

        $groups         = [];
        $items_by_group = [];
        $fk_field       = '';

        if ($groupCollection && $mainCollection) {
            try {
                $fk_field = $this->discoverForeignKey($mainCollection, $groupCollection);
                $groups   = $groupCollection->newQuery()->get()->all();

                foreach ($groups as $group) {
                    $gid                  = (int) ($group->id ?? 0);
                    $items_by_group[$gid] = $mainCollection->newQuery()
                        ->where($fk_field, $gid)
                        ->get()
                        ->all();
                }
            } catch (\Throwable $e) {}
        }

        $widget_id = 'gw-explorer-' . $this->get_id();

        $this->renderWidget(
            $widget_id, $base_path,
            $collection_key, $group_coll_key, $set_coll_key,
            $sets, $sets_by_id, $set_fk_field, $active_set,
            $groups, $items_by_group, $fk_field,
            $active_set_slug, $active_group_slug, $active_item_slug,
            $has_sets, $is_edit
        );
    }

    // ── Widget shell ──────────────────────────────────────────────────────────

    private function renderWidget(
        string  $widget_id,
        string  $base_path,
        string  $collection_key,
        string  $group_coll_key,
        string  $set_coll_key,
        array   $sets,
        array   $sets_by_id,
        string  $set_fk_field,
        ?object $active_set,
        array   $groups,
        array   $items_by_group,
        string  $fk_field,
        ?string $active_set_slug,
        ?string $active_group_slug,
        ?string $active_item_slug,
        bool    $has_sets,
        bool    $is_edit
    ): void {
        $has_groups = !empty($groups);
        ?>
        <div id="<?php echo esc_attr($widget_id); ?>"
             class="gateway-explorer"
             data-gateway-explorer=""
             data-schema="<?php echo esc_attr($collection_key); ?>"
             data-group-schema="<?php echo esc_attr($group_coll_key); ?>"
             data-set-schema="<?php echo esc_attr($set_coll_key); ?>"
             data-base-path="<?php echo esc_attr($base_path); ?>"
             data-has-sets="<?php echo $has_sets ? '1' : '0'; ?>"
             style="display:flex;flex-direction:column;font-family:sans-serif;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;min-height:300px;">

            <?php if ($has_sets): ?>
            <div class="gateway-explorer-set-bar"
                 style="padding:.75rem 1rem;background:#fff;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;gap:.75rem;">
                <label style="font-size:.8rem;font-weight:600;color:#64748b;white-space:nowrap;">
                    <?php echo esc_html($this->getCollectionTitle($set_coll_key)); ?>
                </label>
                <?php $this->renderSetSelector($sets, $active_set, $base_path, $is_edit); ?>
            </div>
            <?php endif; ?>

            <div style="display:flex;flex:1;overflow:hidden;">

                <?php if ($has_groups): ?>
                <nav class="gateway-explorer-nav"
                     style="width:240px;flex-shrink:0;background:#f8fafc;border-right:1px solid #e2e8f0;padding:.5rem 0;overflow-y:auto;">

                    <?php foreach ($groups as $group):
                        $gid = (int) ($group->id ?? 0);
                        $items = $items_by_group[$gid] ?? [];

                        // Which set does this group belong to?
                        $group_set_id   = $set_fk_field ? (int) ($group->$set_fk_field ?? 0) : 0;
                        $group_set      = $group_set_id ? ($sets_by_id[$group_set_id] ?? null) : null;
                        $group_set_slug = $group_set ? ($group_set->slug ?? '') : '';

                        // SSR: hide groups whose set doesn't match the active set.
                        $hidden = $has_sets && $active_set_slug && $group_set_slug !== $active_set_slug;

                        $this->renderNavGroup(
                            $group, $group_set_slug, $items, $base_path,
                            $active_group_slug, $active_item_slug, $has_sets, $hidden, $is_edit
                        );
                    endforeach; ?>

                </nav>
                <?php endif; ?>

                <div class="gateway-explorer-content"
                     style="flex:1;padding:1.5rem;display:flex;align-items:center;justify-content:center;color:#94a3b8;">
                    <div style="text-align:center;">
                        <div style="font-size:1.25rem;font-weight:600;color:#64748b;margin-bottom:.5rem;">Gateway Explorer</div>
                        <div style="font-size:.875rem;">
                            Collection: <code><?php echo esc_html($collection_key); ?></code>
                            <?php if ($active_item_slug): ?>
                                &mdash; <code><?php echo esc_html($active_item_slug); ?></code>
                            <?php endif; ?>
                        </div>
                        <?php if ($is_edit && !$has_groups && $group_coll_key): ?>
                        <div style="margin-top:.75rem;font-size:.8rem;opacity:.7;">
                            No records found in <code><?php echo esc_html($group_coll_key); ?></code>,
                            or the collection could not be queried.
                        </div>
                        <?php endif; ?>
                    </div>
                </div>

            </div>

        </div>

        <?php $this->renderScript($widget_id, $base_path, $has_sets, $is_edit); ?>
        <?php
    }

    // ── Nav pieces ────────────────────────────────────────────────────────────

    private function renderSetSelector(array $sets, ?object $active_set, string $base_path, bool $is_edit): void
    {
        // onchange is handled by the inline script (pushState on frontend, hash on editor).
        echo '<select class="gw-explorer-set-select"'
            . ' style="font-size:.875rem;padding:.35rem .6rem;border:1px solid #cbd5e1;'
            . 'border-radius:5px;background:#fff;color:#374151;cursor:pointer;">';

        // "All" option — hash is empty, path is the base.
        $all_value    = $is_edit ? '#' : esc_attr($base_path . '/');
        $all_selected = $active_set === null ? ' selected' : '';
        echo '<option value="' . $all_value . '"' . $all_selected . '>All</option>';

        foreach ($sets as $set) {
            $slug     = $set->slug ?? '';
            $label    = $this->getRecordLabel($set);
            $value    = $is_edit
                ? '#/' . rawurlencode($slug)
                : $base_path . '/' . rawurlencode($slug) . '/';
            // Active set is always determined by JS in editor (hash is client-only).
            $selected = (!$is_edit && $active_set && ($active_set->slug ?? '') === $slug) ? ' selected' : '';

            echo '<option value="' . esc_attr($value) . '"' . $selected . '>'
                . esc_html($label) . '</option>';
        }

        echo '</select>';
    }

    private function renderNavGroup(
        object  $group,
        string  $group_set_slug,
        array   $items,
        string  $base_path,
        ?string $active_group_slug,
        ?string $active_item_slug,
        bool    $has_sets,
        bool    $hidden,
        bool    $is_edit
    ): void {
        $group_slug = $group->slug ?? '';
        $label      = $this->getRecordLabel($group);
        $display    = $hidden ? 'display:none;' : '';

        echo '<div class="gw-nav-group" data-set-slug="' . esc_attr($group_set_slug) . '" style="' . $display . '">';

        // Group label — section heading, not a link.
        echo '<div style="padding:.5rem 1rem .25rem;font-size:.7rem;font-weight:700;'
            . 'text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;">'
            . esc_html($label) . '</div>';

        if (empty($items)) {
            echo '<div style="padding:.25rem 1rem .5rem;font-size:.8rem;color:#cbd5e1;font-style:italic;">No items</div>';
        } else {
            foreach ($items as $item) {
                $item_slug  = $item->slug ?? '';
                $item_label = $this->getRecordLabel($item);
                // In editor mode use hash routing so we never navigate away.
                if ($is_edit) {
                    $href = $has_sets && $group_set_slug
                        ? '#/' . rawurlencode($group_set_slug) . '/' . rawurlencode($group_slug) . '/' . rawurlencode($item_slug)
                        : '#/' . rawurlencode($group_slug) . '/' . rawurlencode($item_slug);

                    // SSR active state is unknown in editor (hash is client-only); JS sets it.
                    $is_active = false;
                } else {
                    $href = $has_sets && $group_set_slug
                        ? $base_path . '/' . rawurlencode($group_set_slug) . '/' . rawurlencode($group_slug) . '/' . rawurlencode($item_slug) . '/'
                        : $base_path . '/' . rawurlencode($group_slug) . '/' . rawurlencode($item_slug) . '/';

                    $is_active = $active_group_slug === $group_slug && $active_item_slug === $item_slug;
                }

                $bg     = $is_active ? '#e0f2fe' : '';
                $color  = $is_active ? '#0369a1' : '#374151';
                $weight = $is_active ? '600'     : '400';
                $border = $is_active ? '#0369a1' : 'transparent';

                echo '<a href="' . esc_attr($href) . '"'
                    . ' style="display:block;padding:.375rem 1rem .375rem 1.5rem;font-size:.875rem;'
                    . 'text-decoration:none;background:' . $bg . ';color:' . $color . ';'
                    . 'font-weight:' . $weight . ';border-left:3px solid ' . $border . ';">'
                    . esc_html($item_label) . '</a>';
            }
        }

        echo '<div style="height:.5rem;"></div>';
        echo '</div>'; // .gw-nav-group
    }

    // ── Client-side router ────────────────────────────────────────────────────

    private function renderScript(string $widget_id, string $base_path, bool $has_sets, bool $is_edit): void
    {
        ?>
        <script>
        (function () {
            'use strict';

            var wrapper  = document.getElementById(<?php echo wp_json_encode($widget_id); ?>);
            var basePath = <?php echo wp_json_encode(rtrim($base_path, '/')); ?>;
            var hasSets  = <?php echo $has_sets ? 'true' : 'false'; ?>;
            var hashMode = <?php echo $is_edit  ? 'true' : 'false'; ?>; // editor uses #/slug routing

            if (!wrapper) return;

            // ── Parse slugs ───────────────────────────────────────────────────

            function parseSegments(str) {
                // Accepts a pathname ("/docs/set/group/item/") or a hash ("#/set/group/item").
                var rel = str.replace(/^#/, '');                     // strip leading #
                if (!hashMode) {
                    rel = rel.startsWith(basePath) ? rel.slice(basePath.length) : rel;
                }
                var segs = rel.replace(/^\/|\/$/g, '').split('/').filter(Boolean);
                return {
                    set:   hasSets ? (segs[0] || null) : null,
                    group: segs[hasSets ? 1 : 0] || null,
                    item:  segs[hasSets ? 2 : 1] || null,
                };
            }

            function currentSource() {
                return hashMode ? location.hash : location.pathname;
            }

            // ── Update UI ─────────────────────────────────────────────────────

            function updateUI(source) {
                var active = parseSegments(source);

                // Set selector — match option whose slug equals the active set.
                var sel = wrapper.querySelector('.gw-explorer-set-select');
                if (sel) {
                    Array.from(sel.options).forEach(function (opt) {
                        var optSegs = opt.value.replace(/^#\/|^\/?/, '').split('/').filter(Boolean);
                        var optSet  = optSegs[0] || null;
                        opt.selected = (optSet === active.set);
                    });
                }

                // Group visibility — hide groups not belonging to the active set.
                wrapper.querySelectorAll('.gw-nav-group').forEach(function (g) {
                    var gs = g.dataset.setSlug || '';
                    g.style.display = (!hasSets || !active.set || gs === active.set) ? '' : 'none';
                });

                // Active item highlight.
                wrapper.querySelectorAll('.gateway-explorer-nav a').forEach(function (a) {
                    var linkSegs = parseSegments(hashMode ? a.getAttribute('href') : a.pathname);
                    var isActive = linkSegs.set   === active.set
                                && linkSegs.group === active.group
                                && linkSegs.item  === active.item
                                && active.item    !== null;

                    a.style.background      = isActive ? '#e0f2fe' : '';
                    a.style.color           = isActive ? '#0369a1' : '#374151';
                    a.style.fontWeight      = isActive ? '600'     : '400';
                    a.style.borderLeftColor = isActive ? '#0369a1' : 'transparent';
                });
            }

            // ── Event wiring ──────────────────────────────────────────────────

            var nav = wrapper.querySelector('.gateway-explorer-nav');
            if (nav) {
                nav.addEventListener('click', function (e) {
                    var a = e.target.closest('a[href]');
                    if (!a) return;
                    e.preventDefault();
                    e.stopPropagation(); // prevent Elementor editor intercepting the click
                    if (hashMode) {
                        location.hash = a.getAttribute('href');
                    } else {
                        history.pushState(null, '', a.href);
                        updateUI(location.pathname);
                    }
                });
            }

            var sel = wrapper.querySelector('.gw-explorer-set-select');
            if (sel) {
                sel.addEventListener('change', function (e) {
                    e.stopPropagation();
                    if (hashMode) {
                        location.hash = this.value;
                    } else {
                        history.pushState(null, '', this.value);
                        updateUI(location.pathname);
                    }
                });
            }

            if (hashMode) {
                window.addEventListener('hashchange', function () { updateUI(location.hash); });
            } else {
                window.addEventListener('popstate',   function () { updateUI(location.pathname); });
            }

            // Initial paint.
            updateUI(currentSource());
        }());
        </script>
        <?php
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Find the BelongsTo FK column on $child that points to $parent.
     * Falls back to "{parent_collection_key}_id" convention.
     */
    private function discoverForeignKey(object $child, object $parent): string
    {
        $parentClass = get_class($parent);

        try {
            $methods = \Gateway\Collections\RelationDiscovery::discover($child);

            foreach ($methods as $methodName) {
                $relation = $child->$methodName();
                if (!($relation instanceof \Illuminate\Database\Eloquent\Relations\BelongsTo)) {
                    continue;
                }
                if (get_class($relation->getRelated()) !== $parentClass) {
                    continue;
                }
                return $relation->getForeignKeyName();
            }
        } catch (\Throwable $e) {}

        $key = method_exists($parent, 'getCollectionKey')
            ? $parent->getCollectionKey()
            : (property_exists($parent, 'key') ? $parent->key : '');

        return rtrim($key, 's') . '_id';
    }

    /** Best human-readable label for any record — tries common field names. */
    private function getRecordLabel(object $record): string
    {
        foreach (['title', 'name', 'label', 'slug'] as $field) {
            if (!empty($record->$field)) {
                return (string) $record->$field;
            }
        }
        return 'ID ' . ($record->id ?? '?');
    }

    private function getCollectionTitle(string $key): string
    {
        try {
            $registry = \Gateway\Plugin::getInstance()->getRegistry();
            if ($registry) {
                $col = $registry->get($key);
                if ($col && method_exists($col, 'getTitle')) return $col->getTitle();
            }
        } catch (\Throwable $e) {}
        return $key;
    }

    private function getCollectionOptions(bool $optional = false): array
    {
        $options = ['' => $optional ? '— None —' : '— Select a collection —'];

        try {
            $registry = \Gateway\Plugin::getInstance()->getRegistry();
            if (!$registry) return $options;

            foreach ($registry->getAll() as $key => $collection) {
                if (method_exists($collection, 'isHidden') && $collection->isHidden()) continue;
                $title         = method_exists($collection, 'getTitle') ? $collection->getTitle() : $key;
                $options[$key] = $title . ' (' . $key . ')';
            }
        } catch (\Throwable $e) {}

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
