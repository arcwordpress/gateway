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
            'description' => 'Collection whose records form the nav groups (e.g. doc_groups).',
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

        // Base path for slug URLs (e.g. "/el2"). No trailing slash.
        $base_path = rtrim(parse_url(get_permalink() ?: '', PHP_URL_PATH) ?: '', '/');

        // Ensure WordPress routes deep Explorer URLs back to this page on refresh.
        if (!$is_edit && $base_path) {
            $page_id = get_queried_object_id();
            if ($page_id) {
                \Gateway\Integrations\Elementor\ElementorController::recordExplorerRoute($base_path, $page_id);
            }
        }

        // Parse active slugs from the request path (SSR initial state, frontend only).
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

        $has_sets   = !empty($sets);
        $sets_by_id = [];
        $active_set = null;

        foreach ($sets as $set) {
            $sets_by_id[(int) ($set->id ?? 0)] = $set;
        }

        $active_set_slug   = $has_sets ? ($segments[0] ?? null) : null;
        $active_group_slug =             $segments[$has_sets ? 1 : 0] ?? null;
        $active_item_slug  =             $segments[$has_sets ? 2 : 1] ?? null;

        if ($active_set_slug) {
            foreach ($sets as $set) {
                if (($set->slug ?? '') === $active_set_slug) { $active_set = $set; break; }
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

        // ── Resolve active records ────────────────────────────────────────────

        $active_group_record = null;
        $active_item_record  = null;

        if ($active_group_slug) {
            foreach ($groups as $group) {
                if (($group->slug ?? '') === $active_group_slug) {
                    $active_group_record = $group;
                    break;
                }
            }
        }

        if ($active_item_slug && $active_group_record) {
            $gid = (int) ($active_group_record->id ?? 0);
            foreach ($items_by_group[$gid] ?? [] as $item) {
                if (($item->slug ?? '') === $active_item_slug) {
                    $active_item_record = $item;
                    break;
                }
            }
        }

        // ── Records data for client-side content rendering ────────────────────

        $records_data = $this->buildRecordsData($groups, $items_by_group, $base_path, $has_sets, $sets_by_id, $set_fk_field);

        $this->renderWidget(
            'gw-explorer-' . $this->get_id(),
            $base_path,
            $collection_key, $group_coll_key, $set_coll_key,
            $sets, $sets_by_id, $set_fk_field, $active_set,
            $groups, $items_by_group, $fk_field,
            $active_set_slug, $active_group_slug, $active_item_slug,
            $active_group_record, $active_item_record,
            $records_data, $has_sets, $is_edit
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
        ?object $active_group_record,
        ?object $active_item_record,
        array   $records_data,
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
             style="display:flex;flex-direction:column;font-family:sans-serif;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;min-height:400px;">

            <?php if ($has_sets): ?>
            <div class="gateway-explorer-set-bar"
                 style="padding:.75rem 1rem;background:#fff;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;gap:.75rem;flex-shrink:0;">
                <label style="font-size:.8rem;font-weight:600;color:#64748b;white-space:nowrap;">
                    <?php echo esc_html($this->getCollectionTitle($set_coll_key)); ?>
                </label>
                <?php $this->renderSetSelector($sets, $active_set, $base_path, $is_edit); ?>
            </div>
            <?php endif; ?>

            <div style="display:flex;flex:1;min-height:0;overflow:hidden;">

                <?php if ($has_groups): ?>
                <nav class="gateway-explorer-nav"
                     style="width:240px;flex-shrink:0;background:#f8fafc;border-right:1px solid #e2e8f0;padding:.5rem 0;overflow-y:auto;">

                    <?php foreach ($groups as $group):
                        $gid = (int) ($group->id ?? 0);
                        $items = $items_by_group[$gid] ?? [];

                        $group_set_id   = $set_fk_field ? (int) ($group->$set_fk_field ?? 0) : 0;
                        $group_set      = $group_set_id ? ($sets_by_id[$group_set_id] ?? null) : null;
                        $group_set_slug = $group_set ? ($group_set->slug ?? '') : '';

                        $hidden = $has_sets && $active_set_slug && $group_set_slug !== $active_set_slug;

                        $this->renderNavGroup(
                            $group, $group_set_slug, $items, $base_path,
                            $active_group_slug, $active_item_slug, $has_sets, $hidden, $is_edit
                        );
                    endforeach; ?>

                </nav>
                <?php endif; ?>

                <div class="gateway-explorer-content"
                     style="flex:1;overflow-y:auto;min-width:0;">
                    <?php $this->renderContent($active_group_record, $active_item_record, $items_by_group, $base_path, $active_set_slug, $has_sets, $is_edit, $collection_key); ?>
                </div>

            </div>

        </div>

        <?php $this->renderScript($widget_id, $base_path, $has_sets, $is_edit, $records_data); ?>
        <?php
    }

    // ── Nav pieces ────────────────────────────────────────────────────────────

    private function renderSetSelector(array $sets, ?object $active_set, string $base_path, bool $is_edit): void
    {
        echo '<select class="gw-explorer-set-select"'
            . ' style="font-size:.875rem;padding:.35rem .6rem;border:1px solid #cbd5e1;'
            . 'border-radius:5px;background:#fff;color:#374151;cursor:pointer;">';

        $all_value    = $is_edit ? '#' : esc_attr($base_path . '/');
        $all_selected = $active_set === null ? ' selected' : '';
        echo '<option value="' . $all_value . '"' . $all_selected . '>All</option>';

        foreach ($sets as $set) {
            $slug     = $set->slug ?? '';
            $label    = $this->getRecordLabel($set);
            $value    = $is_edit ? '#/' . rawurlencode($slug) : $base_path . '/' . rawurlencode($slug) . '/';
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

        // Build the group's own link URL.
        if ($is_edit) {
            $group_href = $has_sets && $group_set_slug
                ? '#/' . rawurlencode($group_set_slug) . '/' . rawurlencode($group_slug)
                : '#/' . rawurlencode($group_slug);
        } else {
            $group_href = $has_sets && $group_set_slug
                ? $base_path . '/' . rawurlencode($group_set_slug) . '/' . rawurlencode($group_slug) . '/'
                : $base_path . '/' . rawurlencode($group_slug) . '/';
        }

        $group_active = !$is_edit && $active_group_slug === $group_slug && $active_item_slug === null;

        echo '<div class="gw-nav-group" data-set-slug="' . esc_attr($group_set_slug) . '" style="' . $display . '">';

        // Group heading is now a link.
        echo '<a href="' . esc_attr($group_href) . '"'
            . ' style="display:block;padding:.5rem 1rem .25rem;font-size:.7rem;font-weight:700;'
            . 'text-transform:uppercase;letter-spacing:.06em;text-decoration:none;'
            . 'color:' . ($group_active ? '#0369a1' : '#94a3b8') . ';"'
            . ' class="gw-group-link">'
            . esc_html($label) . '</a>';

        if (empty($items)) {
            echo '<div style="padding:.25rem 1rem .5rem;font-size:.8rem;color:#cbd5e1;font-style:italic;">No items</div>';
        } else {
            foreach ($items as $item) {
                $item_slug  = $item->slug ?? '';
                $item_label = $this->getRecordLabel($item);

                if ($is_edit) {
                    $href      = $has_sets && $group_set_slug
                        ? '#/' . rawurlencode($group_set_slug) . '/' . rawurlencode($group_slug) . '/' . rawurlencode($item_slug)
                        : '#/' . rawurlencode($group_slug) . '/' . rawurlencode($item_slug);
                    $is_active = false;
                } else {
                    $href      = $has_sets && $group_set_slug
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
        echo '</div>';
    }

    // ── Content area ──────────────────────────────────────────────────────────

    private function renderContent(
        ?object $active_group,
        ?object $active_item,
        array   $items_by_group,
        string  $base_path,
        ?string $active_set_slug,
        bool    $has_sets,
        bool    $is_edit,
        string  $collection_key
    ): void {
        // In editor mode the active state is always determined by the hash (client-only),
        // so PHP renders nothing — JS will populate on load.
        if ($is_edit) {
            echo '<div class="gw-content-inner" style="padding:2rem;"></div>';
            return;
        }

        if ($active_item) {
            $this->renderItemContent($active_item);
            return;
        }

        if ($active_group) {
            $gid   = (int) ($active_group->id ?? 0);
            $items = $items_by_group[$gid] ?? [];
            $this->renderGroupContent($active_group, $items, $base_path, $active_set_slug, $has_sets);
            return;
        }

        // Nothing selected yet.
        echo '<div class="gw-content-inner" style="padding:2rem;display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;">'
            . '<div style="text-align:center;">'
            . '<div style="font-size:1.1rem;font-weight:600;color:#64748b;margin-bottom:.4rem;">Gateway Explorer</div>'
            . '<div style="font-size:.875rem;">Select an item from the navigation.</div>'
            . '</div></div>';
    }

    private function renderItemContent(object $item): void
    {
        $title   = esc_html($this->getRecordLabel($item));
        $content = $this->getRecordContent($item);

        echo '<div class="gw-content-inner" style="padding:2rem;max-width:800px;">';
        echo '<h1 style="margin:0 0 1.25rem;font-size:1.6rem;font-weight:700;color:#0f172a;line-height:1.25;">' . $title . '</h1>';
        if ($content) {
            echo '<div class="gw-doc-body" style="color:#334155;line-height:1.7;font-size:.9375rem;">' . wp_kses_post($content) . '</div>';
        }
        echo '</div>';
    }

    private function renderGroupContent(object $group, array $items, string $base_path, ?string $active_set_slug, bool $has_sets): void
    {
        $title   = esc_html($this->getRecordLabel($group));
        $content = $this->getRecordContent($group);

        echo '<div class="gw-content-inner" style="padding:2rem;max-width:800px;">';
        echo '<h1 style="margin:0 0 1.25rem;font-size:1.6rem;font-weight:700;color:#0f172a;line-height:1.25;">' . $title . '</h1>';

        if ($content) {
            echo '<div class="gw-doc-body" style="color:#334155;line-height:1.7;font-size:.9375rem;margin-bottom:2rem;">' . wp_kses_post($content) . '</div>';
        }

        if (!empty($items)) {
            echo '<div style="border-top:1px solid #e2e8f0;padding-top:1.5rem;">';
            echo '<h2 style="margin:0 0 1rem;font-size:1rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.05em;">In this section</h2>';
            echo '<ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.5rem;">';

            $group_slug = $group->slug ?? '';
            foreach ($items as $item) {
                $item_slug  = rawurlencode($item->slug ?? '');
                $item_label = esc_html($this->getRecordLabel($item));
                $item_desc  = esc_html($this->getRecordExcerpt($item));

                $href = $has_sets && $active_set_slug
                    ? $base_path . '/' . rawurlencode($active_set_slug) . '/' . rawurlencode($group_slug) . '/' . $item_slug . '/'
                    : $base_path . '/' . rawurlencode($group_slug) . '/' . $item_slug . '/';

                echo '<li><a href="' . esc_attr($href) . '"'
                    . ' style="display:flex;flex-direction:column;padding:.75rem 1rem;border:1px solid #e2e8f0;'
                    . 'border-radius:6px;text-decoration:none;background:#fff;transition:border-color .15s;"'
                    . ' onmouseover="this.style.borderColor=\'#94a3b8\'" onmouseout="this.style.borderColor=\'#e2e8f0\'">'
                    . '<span style="font-weight:600;color:#0f172a;font-size:.9375rem;">' . $item_label . '</span>';
                if ($item_desc) {
                    echo '<span style="font-size:.8rem;color:#64748b;margin-top:.2rem;">' . $item_desc . '</span>';
                }
                echo '</a></li>';
            }

            echo '</ul></div>';
        }

        echo '</div>';
    }

    // ── Client-side router ────────────────────────────────────────────────────

    private function renderScript(
        string $widget_id,
        string $base_path,
        bool   $has_sets,
        bool   $is_edit,
        array  $records_data
    ): void {
        ?>
        <script>
        (function () {
            'use strict';

            var wrapper  = document.getElementById(<?php echo wp_json_encode($widget_id); ?>);
            var basePath = <?php echo wp_json_encode(rtrim($base_path, '/')); ?>;
            var hasSets  = <?php echo $has_sets ? 'true' : 'false'; ?>;
            var hashMode = <?php echo $is_edit  ? 'true' : 'false'; ?>;
            var gwData   = <?php echo wp_json_encode($records_data); ?>;

            if (!wrapper) return;

            var contentEl = wrapper.querySelector('.gateway-explorer-content');

            // ── Parse slugs ───────────────────────────────────────────────────

            function parseSegments(str) {
                var rel = str.replace(/^#/, '');
                if (!hashMode) rel = rel.startsWith(basePath) ? rel.slice(basePath.length) : rel;
                var segs = rel.replace(/^\/|\/$/g, '').split('/').filter(Boolean);
                return {
                    set:   hasSets ? (segs[0] || null) : null,
                    group: segs[hasSets ? 1 : 0] || null,
                    item:  segs[hasSets ? 2 : 1] || null,
                };
            }

            function buildHref(set, group, item) {
                var segs = [];
                if (hasSets && set)  segs.push(encodeURIComponent(set));
                if (group)           segs.push(encodeURIComponent(group));
                if (item)            segs.push(encodeURIComponent(item));
                return hashMode
                    ? (segs.length ? '#/' + segs.join('/') : '#')
                    : basePath + '/' + segs.join('/') + '/';
            }

            function escHtml(s) {
                return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
            }

            // ── Content renderer ──────────────────────────────────────────────

            function renderContent(active) {
                if (!contentEl) return;
                var html = '';

                if (active.group && active.item) {
                    // ── Item view ─────────────────────────────────────────────
                    var key  = active.group + '/' + active.item;
                    var data = gwData.items[key];
                    if (data) {
                        html += '<div class="gw-content-inner" style="padding:2rem;max-width:800px;">';
                        html += '<h1 style="margin:0 0 1.25rem;font-size:1.6rem;font-weight:700;color:#0f172a;line-height:1.25;">' + escHtml(data.title) + '</h1>';
                        if (data.content) {
                            html += '<div class="gw-doc-body" style="color:#334155;line-height:1.7;font-size:.9375rem;">' + data.content + '</div>';
                        }
                        html += '</div>';
                    }

                } else if (active.group) {
                    // ── Group view ────────────────────────────────────────────
                    var gData = gwData.groups[active.group];
                    if (gData) {
                        html += '<div class="gw-content-inner" style="padding:2rem;max-width:800px;">';
                        html += '<h1 style="margin:0 0 1.25rem;font-size:1.6rem;font-weight:700;color:#0f172a;line-height:1.25;">' + escHtml(gData.title) + '</h1>';
                        if (gData.content) {
                            html += '<div class="gw-doc-body" style="color:#334155;line-height:1.7;font-size:.9375rem;margin-bottom:2rem;">' + gData.content + '</div>';
                        }
                        // Item list
                        if (gData.items && gData.items.length) {
                            html += '<div style="border-top:1px solid #e2e8f0;padding-top:1.5rem;">';
                            html += '<h2 style="margin:0 0 1rem;font-size:1rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.05em;">In this section</h2>';
                            html += '<ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.5rem;">';
                            gData.items.forEach(function (itemSlug) {
                                var iKey   = active.group + '/' + itemSlug;
                                var iData  = gwData.items[iKey] || { title: itemSlug, content: '', excerpt: '' };
                                var iHref  = buildHref(active.set, active.group, itemSlug);
                                html += '<li><a href="' + escHtml(iHref) + '"'
                                    + ' style="display:flex;flex-direction:column;padding:.75rem 1rem;border:1px solid #e2e8f0;'
                                    + 'border-radius:6px;text-decoration:none;background:#fff;">'
                                    + '<span style="font-weight:600;color:#0f172a;font-size:.9375rem;">' + escHtml(iData.title) + '</span>';
                                if (iData.excerpt) {
                                    html += '<span style="font-size:.8rem;color:#64748b;margin-top:.2rem;">' + escHtml(iData.excerpt) + '</span>';
                                }
                                html += '</a></li>';
                            });
                            html += '</ul></div>';
                        }
                        html += '</div>';
                    }

                } else {
                    // ── Empty state ───────────────────────────────────────────
                    html = '<div class="gw-content-inner" style="padding:2rem;display:flex;align-items:center;'
                        + 'justify-content:center;min-height:200px;color:#94a3b8;">'
                        + '<div style="text-align:center;">'
                        + '<div style="font-size:1.1rem;font-weight:600;color:#64748b;margin-bottom:.4rem;">Gateway Explorer</div>'
                        + '<div style="font-size:.875rem;">Select an item from the navigation.</div>'
                        + '</div></div>';
                }

                contentEl.innerHTML = html;
                wireContentLinks();
            }

            // Delegate clicks on dynamically rendered content area links.
            function wireContentLinks() {
                if (!contentEl) return;
                contentEl.querySelectorAll('a[href]').forEach(function (a) {
                    a.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(a.getAttribute('href'));
                    });
                });
            }

            // ── Nav + UI update ───────────────────────────────────────────────

            function updateUI(source) {
                var active = parseSegments(source);

                // Set selector.
                var sel = wrapper.querySelector('.gw-explorer-set-select');
                if (sel) {
                    Array.from(sel.options).forEach(function (opt) {
                        var optSegs = opt.value.replace(/^#\/|^\/?/, '').split('/').filter(Boolean);
                        opt.selected = ((optSegs[0] || null) === active.set);
                    });
                }

                // Group visibility.
                wrapper.querySelectorAll('.gw-nav-group').forEach(function (g) {
                    var gs = g.dataset.setSlug || '';
                    g.style.display = (!hasSets || !active.set || gs === active.set) ? '' : 'none';
                });

                // Group link highlight.
                wrapper.querySelectorAll('.gw-group-link').forEach(function (a) {
                    var ls = parseSegments(hashMode ? a.getAttribute('href') : a.pathname);
                    var isActive = ls.group === active.group && active.item === null && active.group !== null;
                    a.style.color = isActive ? '#0369a1' : '#94a3b8';
                });

                // Item link highlight.
                wrapper.querySelectorAll('.gateway-explorer-nav a:not(.gw-group-link)').forEach(function (a) {
                    var ls       = parseSegments(hashMode ? a.getAttribute('href') : a.pathname);
                    var isActive = ls.group === active.group && ls.item === active.item && active.item !== null;
                    a.style.background      = isActive ? '#e0f2fe' : '';
                    a.style.color           = isActive ? '#0369a1' : '#374151';
                    a.style.fontWeight      = isActive ? '600'     : '400';
                    a.style.borderLeftColor = isActive ? '#0369a1' : 'transparent';
                });

                renderContent(active);
            }

            // ── Navigation ────────────────────────────────────────────────────

            function navigate(target) {
                if (hashMode) {
                    location.hash = target;
                } else {
                    history.pushState(null, '', target);
                    updateUI(location.pathname);
                }
            }

            // Nav clicks (items + group links).
            var nav = wrapper.querySelector('.gateway-explorer-nav');
            if (nav) {
                nav.addEventListener('click', function (e) {
                    var a = e.target.closest('a[href]');
                    if (!a) return;
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(hashMode ? a.getAttribute('href') : a.href);
                });
            }

            // Set selector.
            var sel = wrapper.querySelector('.gw-explorer-set-select');
            if (sel) {
                sel.addEventListener('change', function (e) {
                    e.stopPropagation();
                    navigate(this.value);
                });
            }

            // Back / forward.
            if (hashMode) {
                window.addEventListener('hashchange', function () { updateUI(location.hash); });
            } else {
                window.addEventListener('popstate',   function () { updateUI(location.pathname); });
            }

            // Initial paint.
            updateUI(hashMode ? location.hash : location.pathname);
        }());
        </script>
        <?php
    }

    // ── Data helpers ──────────────────────────────────────────────────────────

    private function buildRecordsData(
        array  $groups,
        array  $items_by_group,
        string $base_path,
        bool   $has_sets,
        array  $sets_by_id,
        string $set_fk_field
    ): array {
        $data = ['groups' => [], 'items' => []];

        foreach ($groups as $group) {
            $gid        = (int) ($group->id ?? 0);
            $group_slug = $group->slug ?? '';
            $items      = $items_by_group[$gid] ?? [];

            $data['groups'][$group_slug] = [
                'title'   => $this->getRecordLabel($group),
                'content' => $this->getRecordContent($group),
                'items'   => array_map(fn($i) => $i->slug ?? '', $items),
            ];

            foreach ($items as $item) {
                $item_slug = $item->slug ?? '';
                $data['items'][$group_slug . '/' . $item_slug] = [
                    'title'   => $this->getRecordLabel($item),
                    'content' => $this->getRecordContent($item),
                    'excerpt' => $this->getRecordExcerpt($item),
                ];
            }
        }

        return $data;
    }

    private function getRecordContent(object $record): string
    {
        foreach (['content', 'body', 'description'] as $field) {
            if (!empty($record->$field)) return (string) $record->$field;
        }
        return '';
    }

    private function getRecordExcerpt(object $record): string
    {
        foreach (['excerpt', 'summary', 'description'] as $field) {
            if (!empty($record->$field)) return (string) $record->$field;
        }
        // Fallback: first 120 chars of content, stripped.
        $content = $this->getRecordContent($record);
        if ($content) {
            $stripped = wp_strip_all_tags($content);
            return mb_strlen($stripped) > 120 ? mb_substr($stripped, 0, 120) . '…' : $stripped;
        }
        return '';
    }

    // ── General helpers ───────────────────────────────────────────────────────

    private function discoverForeignKey(object $child, object $parent): string
    {
        $parentClass = get_class($parent);

        try {
            $methods = \Gateway\Collections\RelationDiscovery::discover($child);
            foreach ($methods as $methodName) {
                $relation = $child->$methodName();
                if (!($relation instanceof \Illuminate\Database\Eloquent\Relations\BelongsTo)) continue;
                if (get_class($relation->getRelated()) !== $parentClass) continue;
                return $relation->getForeignKeyName();
            }
        } catch (\Throwable $e) {}

        $key = method_exists($parent, 'getCollectionKey')
            ? $parent->getCollectionKey()
            : (property_exists($parent, 'key') ? $parent->key : '');
        return rtrim($key, 's') . '_id';
    }

    private function getRecordLabel(object $record): string
    {
        foreach (['title', 'name', 'label', 'slug'] as $field) {
            if (!empty($record->$field)) return (string) $record->$field;
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
        } catch (\Throwable $e) { $visible = []; }

        if (empty($visible)) return;
        echo '<ul style="margin:.5em 0 0;padding-left:1.2em;font-size:.85em;opacity:.7">';
        foreach ($visible as $key => $col) {
            $title = method_exists($col, 'getTitle') ? $col->getTitle() : $key;
            echo '<li><code>' . esc_html($key) . '</code> — ' . esc_html($title) . '</li>';
        }
        echo '</ul>';
    }
}
