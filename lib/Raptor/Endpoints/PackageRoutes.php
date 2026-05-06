<?php

namespace Gateway\Raptor\Endpoints;

use Gateway\Raptor\Build\RaptorBuilder;
use Gateway\Raptor\Collections\RaptorCollection;
use Gateway\Raptor\Collections\RaptorExtension;
use Gateway\Raptor\Collections\RaptorPackage;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * REST API routes for Raptor-managed packages.
 *
 * Endpoints:
 *   GET    /gateway/v1/raptor/package                          — list all
 *   POST   /gateway/v1/raptor/package                          — create
 *   GET    /gateway/v1/raptor/package/{key}                    — get one
 *   PATCH  /gateway/v1/raptor/package/{key}                    — update metadata
 *   DELETE /gateway/v1/raptor/package/{key}                    — delete
 *   GET    /gateway/v1/raptor/package/{key}/collections        — list assignable collections
 *   PUT    /gateway/v1/raptor/package/{key}/collections        — sync assigned collections
 */
class PackageRoutes
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'registerRoutes']);
    }

    public function registerRoutes(): void
    {
        register_rest_route('gateway/v1', '/raptor/package', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'getPackages'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'createPackage'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);

        register_rest_route('gateway/v1', '/raptor/package/(?P<package_key>[a-zA-Z0-9_\-]+)', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'getPackage'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'PATCH, PUT',
                'callback'            => [$this, 'updatePackage'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'DELETE',
                'callback'            => [$this, 'deletePackage'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);

        register_rest_route('gateway/v1', '/raptor/package/(?P<package_key>[a-zA-Z0-9_\-]+)/collections', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'getPackageCollections'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'PUT',
                'callback'            => [$this, 'setPackageCollections'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);
    }

    // ─── Handlers ─────────────────────────────────────────────────────────────

    public function getPackages(\WP_REST_Request $request): \WP_REST_Response
    {
        $packages = RaptorPackage::orderBy('created_at', 'asc')->get();
        $allCollections = \Gateway\Raptor\Collections\RaptorCollection::select('collection_key', 'package_key')
            ->whereNotNull('package_key')
            ->get()
            ->groupBy('package_key');

        $result = $packages->map(function ($pkg) use ($allCollections) {
            $arr = $pkg->toArray();
            $arr['collection_keys'] = $allCollections->get($pkg->package_key, collect())->pluck('collection_key')->toArray();
            $arr['has_collections'] = !empty($arr['collection_keys']);
            return $arr;
        });

        return new \WP_REST_Response([
            'success'  => true,
            'packages' => $result->values(),
        ], 200);
    }

    public function createPackage(\WP_REST_Request $request): \WP_REST_Response
    {
        $data  = $request->get_json_params() ?? [];
        $label = sanitize_text_field($data['label'] ?? '');

        if (!$label) {
            return new \WP_REST_Response(['success' => false, 'message' => 'Label is required.'], 400);
        }

        // Resolve extension — accept extension_id (int) or extension_key (string)
        $extension = $this->resolveExtension($data);
        if (!$extension) {
            return new \WP_REST_Response(['success' => false, 'message' => 'A valid extension is required.'], 400);
        }

        $rawKey = $data['package_key'] ?? $data['key'] ?? '';
        $key    = $rawKey ? $this->sanitizeKey($rawKey) : $this->labelToKey($label);

        if (!$key) {
            return new \WP_REST_Response(['success' => false, 'message' => 'Could not generate a valid package key.'], 400);
        }

        if (RaptorPackage::where('package_key', $key)->exists()) {
            return new \WP_REST_Response(['success' => false, 'message' => "Package key \"{$key}\" already exists."], 409);
        }

        $package = RaptorPackage::create([
            'package_key'  => $key,
            'extension_id' => $extension->id,
            'label'        => $label,
            'description'  => sanitize_textarea_field($data['description'] ?? ''),
            'icon'         => sanitize_text_field($data['icon'] ?? 'dashicons-admin-generic'),
            'position'     => intval($data['position'] ?? 20),
            'capability'   => sanitize_text_field($data['capability'] ?? 'manage_options'),
            'parent'       => sanitize_text_field($data['parent'] ?? '') ?: null,
            'status'       => 'active',
        ]);

        $this->rebuildExtension($extension);

        return new \WP_REST_Response([
            'success' => true,
            'message' => 'Package created.',
            'package' => $package->toArray(),
        ], 201);
    }

    public function getPackage(\WP_REST_Request $request): \WP_REST_Response
    {
        $package = $this->findOrFail($request->get_param('package_key'));
        if ($package instanceof \WP_REST_Response) return $package;

        $arr = $package->toArray();
        $arr['collection_keys'] = $package->collections()->pluck('collection_key')->toArray();
        $arr['has_collections'] = !empty($arr['collection_keys']);

        return new \WP_REST_Response(['success' => true, 'package' => $arr], 200);
    }

    /**
     * GET /raptor/package/{key}/collections
     *
     * Returns all collections for the package's extension, annotated with:
     *   - is_assigned:    bool  — whether assigned to this package
     *   - other_packages: array — other package_keys that include this collection
     */
    public function getPackageCollections(\WP_REST_Request $request): \WP_REST_Response
    {
        $package = $this->findOrFail($request->get_param('package_key'));
        if ($package instanceof \WP_REST_Response) return $package;

        if (!$package->extension_id || !$package->extension) {
            return new \WP_REST_Response(['success' => true, 'collections' => []], 200);
        }

        $assignedIds = $package->collections()->pluck('gateway_raptor_collection.id')->toArray();

        $collections = $package->extension->collections()
            ->with('packages')
            ->orderBy('title')
            ->get();

        $result = $collections->map(function ($col) use ($assignedIds, $package) {
            return [
                'collection_key' => $col->collection_key,
                'title'          => $col->title,
                'status'         => $col->status,
                'is_assigned'    => in_array($col->id, $assignedIds, true),
                'other_packages' => $col->packages
                    ->where('package_key', '!=', $package->package_key)
                    ->pluck('package_key')
                    ->values()
                    ->toArray(),
            ];
        });

        return new \WP_REST_Response(['success' => true, 'collections' => $result->values()], 200);
    }

    /**
     * PUT /raptor/package/{key}/collections
     *
     * Body: { "collection_keys": ["key1", "key2"] }
     * Replaces the full set of collections assigned to this package.
     */
    public function setPackageCollections(\WP_REST_Request $request): \WP_REST_Response
    {
        $package = $this->findOrFail($request->get_param('package_key'));
        if ($package instanceof \WP_REST_Response) return $package;

        $data           = $request->get_json_params() ?? [];
        $collectionKeys = array_filter(array_map('sanitize_text_field', (array) ($data['collection_keys'] ?? [])));

        $ids = RaptorCollection::whereIn('collection_key', $collectionKeys)
            ->pluck('id', 'collection_key');

        $syncData = [];
        foreach ($collectionKeys as $position => $key) {
            if (isset($ids[$key])) {
                $syncData[$ids[$key]] = ['position' => $position];
            }
        }

        $package->collections()->sync($syncData);

        $this->rebuildExtension($package->extension);

        $arr = $package->fresh()->toArray();
        $arr['collection_keys'] = $package->collections()->pluck('collection_key')->toArray();
        $arr['has_collections'] = !empty($arr['collection_keys']);

        return new \WP_REST_Response(['success' => true, 'package' => $arr], 200);
    }

    public function updatePackage(\WP_REST_Request $request): \WP_REST_Response
    {
        $package = $this->findOrFail($request->get_param('package_key'));
        if ($package instanceof \WP_REST_Response) return $package;

        $data   = $request->get_json_params() ?? [];
        $update = [];

        if (isset($data['package_key'])) {
            $newKey = $this->sanitizeKey($data['package_key']);
            if ($newKey && $newKey !== $package->package_key) {
                if (RaptorPackage::where('package_key', $newKey)->where('id', '!=', $package->id)->exists()) {
                    return new \WP_REST_Response(['success' => false, 'message' => "Package key \"{$newKey}\" already exists."], 409);
                }
                if ($package->extension) {
                    (new RaptorBuilder())->deletePackageFile($package, $package->extension);
                }
                $update['package_key'] = $newKey;
            }
        }

        foreach (['label', 'description', 'icon', 'capability', 'status'] as $field) {
            if (isset($data[$field])) {
                $update[$field] = sanitize_text_field($data[$field]);
            }
        }
        if (isset($data['description'])) {
            $update['description'] = sanitize_textarea_field($data['description']);
        }
        if (isset($data['position'])) {
            $update['position'] = intval($data['position']);
        }
        if (array_key_exists('parent', $data)) {
            $update['parent'] = sanitize_text_field($data['parent']) ?: null;
        }
        if (isset($data['extension_id'])) {
            $update['extension_id'] = intval($data['extension_id']) ?: null;
        } elseif (isset($data['extension_key'])) {
            $ext = RaptorExtension::where('extension_key', sanitize_text_field($data['extension_key']))->first();
            $update['extension_id'] = $ext ? $ext->id : null;
        }

        $package->update($update);
        $package->refresh();

        $this->rebuildExtension($package->extension);

        return new \WP_REST_Response(['success' => true, 'package' => $package->toArray()], 200);
    }

    public function deletePackage(\WP_REST_Request $request): \WP_REST_Response
    {
        $package = $this->findOrFail($request->get_param('package_key'));
        if ($package instanceof \WP_REST_Response) return $package;

        $extension = $package->extension;
        $package->delete();

        $this->rebuildExtension($extension);

        return new \WP_REST_Response(['success' => true, 'message' => 'Package deleted.'], 200);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /** @return RaptorPackage|\WP_REST_Response */
    private function findOrFail(string $key)
    {
        $package = RaptorPackage::where('package_key', $key)->first();
        if (!$package) {
            return new \WP_REST_Response(['success' => false, 'message' => 'Package not found.'], 404);
        }
        return $package;
    }

    /**
     * Resolve a RaptorExtension from request data.
     * Accepts extension_id (int) or extension_key (string).
     */
    private function resolveExtension(array $data): ?RaptorExtension
    {
        if (!empty($data['extension_id'])) {
            return RaptorExtension::find((int) $data['extension_id']);
        }
        if (!empty($data['extension_key'])) {
            return RaptorExtension::where('extension_key', sanitize_text_field($data['extension_key']))->first();
        }
        return null;
    }

    private function rebuildExtension(?RaptorExtension $extension): void
    {
        if ($extension) {
            (new RaptorBuilder())->build($extension->extension_key);
        }
    }

    private function labelToKey(string $label): string
    {
        $key = strtolower($label);
        $key = preg_replace('/\s+/', '-', $key);
        $key = preg_replace('/[^a-z0-9\-]/', '', $key);
        return (string) substr(trim($key, '-'), 0, 200);
    }

    private function sanitizeKey(string $key): string
    {
        $key = strtolower($key);
        $key = preg_replace('/[^a-z0-9\-_]/', '', $key);
        return (string) substr(trim($key, '-_'), 0, 200);
    }

    public function checkPermissions(): bool
    {
        return current_user_can('manage_options');
    }
}
