<?php

namespace Gateway\Package;

use Gateway\Plugin;
use Gateway\Raptor\Collections\RaptorPackage;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Loads active Raptor-managed packages from the database and registers
 * them with PackageRegistry so PackageMenus creates their admin menus.
 *
 * A package is only registered when its extension's WordPress plugin is
 * currently active — mirroring the behavior of code-defined packages, which
 * only exist while their plugin is loaded.
 */
class PackageLoader
{
    public static function load(): void
    {
        try {
            if (!function_exists('is_plugin_active')) {
                require_once ABSPATH . 'wp-admin/includes/plugin.php';
            }

            $records  = RaptorPackage::with(['extension', 'collections'])->where('status', 'active')->get();
            $registry = Plugin::getInstance()->getPackageRegistry();

            foreach ($records as $record) {
                $extKey = $record->extension ? $record->extension->extension_key : null;
                if (!self::extensionIsActive($extKey)) {
                    continue;
                }

                if ($registry->has($record->package_key)) {
                    continue;
                }

                $data                = $record->toArray();
                $data['collections'] = $record->collections->pluck('collection_key')->toArray();
                $registry->register(new DatabasePackage($data));
            }
        } catch (\Exception $e) {
            error_log('[Gateway] PackageLoader::load failed: ' . $e->getMessage());
        }
    }

    /**
     * Returns true when the WordPress plugin generated for the given extension
     * key is currently active. Packages with no extension key are never shown.
     */
    private static function extensionIsActive(?string $extensionKey): bool
    {
        if (!$extensionKey) {
            return false;
        }

        $slug = str_replace('_', '-', $extensionKey);
        return is_plugin_active($slug . '/' . $slug . '.php');
    }
}
