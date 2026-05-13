<?php

namespace Gateway\Raptor\Endpoints;

use Gateway\Raptor\Collections\RaptorExtension;
use Gateway\Raptor\Collections\RaptorCollection;
use Gateway\Raptor\Collections\RaptorFieldList;
use Gateway\Raptor\Collections\RaptorField;
use Gateway\Raptor\Collections\RaptorViewList;
use Gateway\Raptor\Collections\RaptorView;
use Gateway\Raptor\Collections\RaptorViewRender;
use Gateway\Raptor\Collections\RaptorFacetList;
use Gateway\Raptor\Collections\RaptorFacet;
use Gateway\Raptor\Collections\RaptorFormList;
use Gateway\Raptor\Collections\RaptorForm;
use Gateway\Raptor\Collections\RaptorFormField;
use Gateway\Raptor\Collections\RaptorPackage;
use Gateway\Raptor\Collections\RaptorUserLayout;
use Gateway\Raptor\Collections\RaptorUserLayoutNode;
use Gateway\Raptor\Collections\RaptorExtensionFile;
use Gateway\Raptor\Build\RaptorBuilder;
use Gateway\Plugin;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * REST API routes for Raptor-managed extensions.
 *
 * Extensions are stored in wp_gateway_raptor_extension and map 1:1
 * to generated WordPress plugins in WP_PLUGIN_DIR.
 *
 * Endpoints:
 *   GET    /gateway/v1/raptor/extension              — list all
 *   POST   /gateway/v1/raptor/extension              — create + scaffold plugin
 *   GET    /gateway/v1/raptor/extension/{key}        — get one (with collections)
 *   PATCH  /gateway/v1/raptor/extension/{key}        — update metadata
 *   DELETE /gateway/v1/raptor/extension/{key}        — delete record + plugin files
 *   POST   /gateway/v1/raptor/extension/{key}/build  — full build
 */
class ExtensionRoutes
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'registerRoutes']);
    }

    public function registerRoutes(): void
    {
        register_rest_route('gateway/v1', '/raptor/shortcodes', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'getShortcodes'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);

        register_rest_route('gateway/v1', '/raptor/extension', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'getExtensions'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'createExtension'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);

        register_rest_route('gateway/v1', '/raptor/extension/fields', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'getFields'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);

        register_rest_route('gateway/v1', '/raptor/extension/registered', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'getRegisteredExtensions'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);

        register_rest_route('gateway/v1', '/raptor/extension/(?P<extension_key>[a-zA-Z0-9_\-]+)', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'getExtension'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'PATCH, PUT',
                'callback'            => [$this, 'updateExtension'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'DELETE',
                'callback'            => [$this, 'deleteExtension'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);

        register_rest_route('gateway/v1', '/raptor/extension/(?P<extension_key>[a-zA-Z0-9_\-]+)/build', [
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'buildExtension'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);
    }

    // ─── Handlers ─────────────────────────────────────────────────────────────

    public function getExtensions(\WP_REST_Request $request): \WP_REST_Response
    {
        $extensions = RaptorExtension::with(['collections' => function ($query) {
            $query->select(['id', 'collection_key', 'title', 'extension_id']);
        }])->orderBy('created_at', 'asc')->get();

        return new \WP_REST_Response([
            'success'    => true,
            'extensions' => $extensions->toArray(),
        ], 200);
    }

    public function createExtension(\WP_REST_Request $request): \WP_REST_Response
    {
        $data  = $request->get_json_params() ?? [];
        $title = sanitize_text_field($data['title'] ?? '');

        if (!$title) {
            return new \WP_REST_Response(['success' => false, 'message' => 'Title is required.'], 400);
        }

        // Accept either 'extension_key' or 'key' from the request body.
        $rawKey = $data['extension_key'] ?? $data['key'] ?? '';
        $key    = $rawKey ? $this->sanitizeKey($rawKey) : $this->titleToKey($title);

        if (!$key) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Could not generate a valid extension key from the given title.',
            ], 400);
        }

        if (RaptorExtension::where('extension_key', $key)->exists()) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => "An extension with key \"{$key}\" already exists.",
            ], 409);
        }

        $builder   = new RaptorBuilder();
        $namespace = !empty($data['namespace'])
            ? sanitize_text_field($data['namespace'])
            : $builder->toNamespace($key);

        $extension = RaptorExtension::create([
            'extension_key'   => $key,
            'title'           => $title,
            'description'     => sanitize_textarea_field($data['description'] ?? ''),
            'version'         => sanitize_text_field($data['version'] ?? '1.0.0'),
            'author'          => sanitize_text_field($data['author'] ?? ''),
            'author_uri'      => esc_url_raw($data['author_uri'] ?? ''),
            'text_domain'     => sanitize_key($data['text_domain'] ?? $key),
            'min_wp_version'  => sanitize_text_field($data['min_wp_version'] ?? '6.0'),
            'namespace'       => $namespace,
            'status'          => 'active',
        ]);

        // Build the plugin (scaffold + generate files + activate) immediately on creation.
        $buildResult = $builder->build($key);

        return new \WP_REST_Response([
            'success'   => true,
            'message'   => 'Extension created.',
            'extension' => $extension->toArray(),
            'build'     => $buildResult,
        ], 201);
    }

    public function getExtension(\WP_REST_Request $request): \WP_REST_Response
    {
        $extension = $this->findOrFail($request->get_param('extension_key'));
        if ($extension instanceof \WP_REST_Response) return $extension;

        try {
            $notices = $this->repairExtensionFileIfMissing($extension);
        } catch (\Throwable $e) {
            $notices = [];
        }

        $collections = RaptorCollection::where('extension_id', $extension->id)
            ->with(['viewList.views'])
            ->orderBy('id')
            ->get();

        $builder    = new RaptorBuilder();
        $pluginSlug = $builder->toPluginSlug($extension->extension_key);
        $pluginFile = $pluginSlug . '/' . $pluginSlug . '.php';
        if (!function_exists('is_plugin_active')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }
        $pluginActive = is_plugin_active($pluginFile);

        $formattedCollections = $collections->map(function ($col) {
            $views = [];
            if ($col->viewList) {
                $views = $col->viewList->views->map(fn($v) => [
                    'id'       => $v->id,
                    'view_key' => $v->view_key,
                    'title'    => $v->title,
                    'status'   => $v->status,
                ])->values()->toArray();
            }
            return [
                'id'             => $col->id,
                'collection_key' => $col->collection_key,
                'title'          => $col->title,
                'description'    => $col->description,
                'status'         => $col->status,
                'views'          => $views,
            ];
        })->toArray();

        return new \WP_REST_Response([
            'success'       => true,
            'extension'     => $extension->toArray(),
            'collections'   => $formattedCollections,
            'plugin_active' => $pluginActive,
            'notices'       => $notices,
        ], 200);
    }

    /**
     * If the extension is missing its lib/Extension.php or RaptorExtensionFile record,
     * regenerate the file silently and return a notice. Returns an empty array when
     * nothing was needed or when the plugin directory does not yet exist.
     */
    private function repairExtensionFileIfMissing(RaptorExtension $extension): array
    {
        $builder    = new RaptorBuilder();
        $pluginSlug = $builder->toPluginSlug($extension->extension_key);
        $pluginDir  = WP_PLUGIN_DIR . '/' . $pluginSlug;

        // Skip repair when the plugin hasn't been built yet — nothing to repair.
        if (!is_dir($pluginDir)) {
            return [];
        }

        $hasRecord = RaptorExtensionFile::where('extension_id', $extension->id)->exists();
        $hasFile   = file_exists($pluginDir . '/lib/Extension.php');

        if ($hasRecord && $hasFile) {
            return [];
        }

        $namespace = !empty($extension->namespace)
            ? $extension->namespace
            : $builder->toNamespace($extension->extension_key);

        $builder->buildExtensionFile($pluginDir, $namespace, $extension);

        return [[
            'type'    => 'info',
            'message' => 'Extension file was missing and has been created.',
        ]];
    }

    public function updateExtension(\WP_REST_Request $request): \WP_REST_Response
    {
        $extension = $this->findOrFail($request->get_param('extension_key'));
        if ($extension instanceof \WP_REST_Response) return $extension;

        $data   = $request->get_json_params() ?? [];
        $update = [];

        $stringFields = ['title', 'description', 'version', 'author', 'text_domain',
                         'min_wp_version', 'namespace', 'status'];

        foreach ($stringFields as $field) {
            if (isset($data[$field])) {
                $update[$field] = sanitize_text_field($data[$field]);
            }
        }
        if (isset($data['author_uri'])) {
            $update['author_uri'] = esc_url_raw($data['author_uri']);
        }

        $extension->update($update);

        return new \WP_REST_Response([
            'success'   => true,
            'extension' => $extension->fresh()->toArray(),
        ], 200);
    }

    public function deleteExtension(\WP_REST_Request $request): \WP_REST_Response
    {
        $extension = $this->findOrFail($request->get_param('extension_key'));
        if ($extension instanceof \WP_REST_Response) return $extension;

        $key        = $extension->extension_key;
        $builder    = new RaptorBuilder();
        $pluginSlug = $builder->toPluginSlug($key);
        $pluginDir  = WP_PLUGIN_DIR . '/' . $pluginSlug;
        $dirDeleted = false;

        // Deactivate the plugin before removing its files.
        $pluginFile = $pluginSlug . '/' . $pluginSlug . '.php';
        if (!function_exists('deactivate_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }
        deactivate_plugins($pluginFile);

        if (is_dir($pluginDir)) {
            $dirDeleted = $this->deleteDirectory($pluginDir);
        }

        // Cascade-delete all Raptor child records for this extension.
        $this->cascadeDeleteExtension($extension->id);

        $extension->delete();

        return new \WP_REST_Response([
            'success'      => true,
            'message'      => 'Extension deleted.',
            'dir_deleted'  => $dirDeleted,
            'plugin_dir'   => $pluginDir,
        ], 200);
    }

    /**
     * Delete all Raptor records owned by an extension in leaf-to-root order.
     * Uses bulk whereIn deletes to avoid N+1 queries.
     */
    private function cascadeDeleteExtension(int $extensionId): void
    {
        // ── Packages (pivot rows first, then packages) ────────────────────────
        $packageIds = RaptorPackage::where('extension_id', $extensionId)->pluck('id')->toArray();
        if ($packageIds) {
            $db = \Gateway\Database\DatabaseConnection::getCapsule()->getConnection();
            $db->table('gateway_raptor_package_collection')->whereIn('package_id', $packageIds)->delete();
            RaptorPackage::whereIn('id', $packageIds)->delete();
        }

        $collections = RaptorCollection::where('extension_id', $extensionId)->get();

        if ($collections->isEmpty()) {
            return;
        }

        $collectionIds  = $collections->pluck('id')->toArray();
        $collectionKeys = $collections->pluck('collection_key')->toArray();

        // ── Fields ────────────────────────────────────────────────────────────
        $fieldListIds = RaptorFieldList::whereIn('collection_id', $collectionIds)->pluck('id')->toArray();
        if ($fieldListIds) {
            RaptorField::whereIn('field_list_id', $fieldListIds)->delete();
            RaptorFieldList::whereIn('id', $fieldListIds)->delete();
        }

        // ── Views (renders → facets → views → view lists) ─────────────────────
        $viewListIds = RaptorViewList::whereIn('collection_id', $collectionIds)->pluck('id')->toArray();
        if ($viewListIds) {
            $viewIds = RaptorView::whereIn('view_list_id', $viewListIds)->pluck('id')->toArray();
            if ($viewIds) {
                $facetListIds = RaptorFacetList::whereIn('view_id', $viewIds)->pluck('id')->toArray();
                if ($facetListIds) {
                    RaptorFacet::whereIn('facet_list_id', $facetListIds)->delete();
                    RaptorFacetList::whereIn('id', $facetListIds)->delete();
                }
                RaptorViewRender::whereIn('view_id', $viewIds)->delete();
                RaptorView::whereIn('id', $viewIds)->delete();
            }
            RaptorViewList::whereIn('id', $viewListIds)->delete();
        }

        // ── Forms (form fields → forms → form lists) ──────────────────────────
        $formListIds = RaptorFormList::whereIn('collection_id', $collectionIds)->pluck('id')->toArray();
        if ($formListIds) {
            $formIds = RaptorForm::whereIn('form_list_id', $formListIds)->pluck('id')->toArray();
            if ($formIds) {
                RaptorFormField::whereIn('form_id', $formIds)->delete();
                RaptorForm::whereIn('id', $formIds)->delete();
            }
            RaptorFormList::whereIn('id', $formListIds)->delete();
        }

        // ── User layouts keyed to these collections ────────────────────────────
        foreach ($collectionKeys as $collKey) {
            $layoutIds = RaptorUserLayout::where('route_key', 'LIKE', '%' . $collKey . '%')
                ->pluck('id')->toArray();
            if ($layoutIds) {
                RaptorUserLayoutNode::whereIn('layout_id', $layoutIds)->delete();
                RaptorUserLayout::whereIn('id', $layoutIds)->delete();
            }
        }

        // ── Collections ───────────────────────────────────────────────────────
        RaptorCollection::whereIn('id', $collectionIds)->delete();
    }

    public function buildExtension(\WP_REST_Request $request): \WP_REST_Response
    {
        $key    = $request->get_param('extension_key');
        $result = (new RaptorBuilder())->build($key);

        $status = $result['success'] ? 200 : 422;
        return new \WP_REST_Response($result, $status);
    }

    public function getFields(\WP_REST_Request $request): \WP_REST_Response
    {
        return new \WP_REST_Response([
            'success' => true,
            'fields'  => (new RaptorExtension())->getFields(),
        ], 200);
    }

    public function getRegisteredExtensions(\WP_REST_Request $request): \WP_REST_Response
    {
        $registry   = \Gateway\Extensions\ExtensionRegistry::instance();
        $extensions = $this->normalizeRegisteredExtensions($registry->getAll());

        usort($extensions, function ($left, $right) {
            return strcmp($left->getKey(), $right->getKey());
        });

        $payload = array_map(function ($extension) {
            return [
                'key'         => $extension->getKey(),
                'class'       => get_class($extension),
                'class_name'  => class_basename(get_class($extension)),
                'plugin_slug' => method_exists($extension, 'getPluginSlug') ? $extension->getPluginSlug() : null,
                'plugin_path' => method_exists($extension, 'getPluginPath') ? $extension->getPluginPath() : null,
            ];
        }, $extensions);

        return new \WP_REST_Response([
            'success'    => true,
            'total'      => count($payload),
            'extensions' => $payload,
        ], 200);
    }

    /**
     * Return all shortcodes across every active extension — used when a specific
     * extension's plugin is not active and we fall back to the global list.
     */
    public function getShortcodes(\WP_REST_Request $request): \WP_REST_Response
    {
        $registry    = Plugin::getInstance()->getRegistry();
        $registered  = $this->normalizeRegisteredCollections($registry->getAll());

        $shortcodes = [];

        foreach ($registered as $collection) {
            $key       = $collection->getKey();
            $title     = $collection->getTitlePlural() ?: ($collection->getTitle() ?: $key);

            $shortcodes[] = [
                'title'           => $title,
                'key'             => $key,
                'shortcode'       => '[gateway_grid schema="' . $key . '"]',
                'extension_key'   => null,
                'extension_title' => null,
            ];
        }

        return new \WP_REST_Response([
            'success'    => true,
            'shortcodes' => $shortcodes,
        ], 200);
    }

    /**
     * @param array<int,mixed> $entries
     * @return array<int,\Gateway\Collection>
     */
    private function normalizeRegisteredCollections(array $entries): array
    {
        $collections = [];

        foreach ($entries as $entry) {
            if (is_object($entry)) {
                $collection = $entry;
            } elseif (is_string($entry) && class_exists($entry)) {
                $collection = new $entry();
            } else {
                continue;
            }

            if (!method_exists($collection, 'isHidden') || $collection->isHidden()) {
                continue;
            }

            if (!method_exists($collection, 'getKey')) {
                continue;
            }

            $collections[] = $collection;
        }

        return $collections;
    }

    /**
     * @param array<int,mixed> $entries
     * @return array<int,\Gateway\Extension>
     */
    private function normalizeRegisteredExtensions(array $entries): array
    {
        $extensions = [];

        foreach ($entries as $entry) {
            if (is_object($entry)) {
                $extension = $entry;
            } elseif (is_string($entry) && class_exists($entry)) {
                $extension = new $entry();
            } else {
                continue;
            }

            if (!$extension instanceof \Gateway\Extension) {
                continue;
            }

            $extensions[] = $extension;
        }

        return $extensions;
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * @return RaptorExtension|\WP_REST_Response
     */
    private function findOrFail(string $key)
    {
        $extension = RaptorExtension::where('extension_key', $key)->first();
        if (!$extension) {
            return new \WP_REST_Response(['success' => false, 'message' => 'Extension not found.'], 404);
        }
        return $extension;
    }

    private function titleToKey(string $title): string
    {
        $key = strtolower($title);
        $key = preg_replace('/\s+/', '_', $key);
        $key = preg_replace('/[^a-z0-9_]/', '', $key);
        return (string) substr(trim($key, '_'), 0, 200);
    }

    private function sanitizeKey(string $key): string
    {
        $key = strtolower(str_replace('-', '_', $key));
        $key = preg_replace('/[^a-z0-9_]/', '', $key);
        return (string) substr(trim($key, '_'), 0, 200);
    }

    private function deleteDirectory(string $dir): bool
    {
        if (!is_dir($dir)) return false;
        $items = array_diff(scandir($dir), ['.', '..']);
        foreach ($items as $item) {
            $path = $dir . '/' . $item;
            is_dir($path) ? $this->deleteDirectory($path) : unlink($path);
        }
        return rmdir($dir);
    }

    public function checkPermissions(): bool
    {
        return current_user_can('manage_options');
    }
}
