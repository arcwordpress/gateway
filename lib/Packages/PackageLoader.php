<?php

namespace Gateway\Packages;

use Gateway\Plugin;
use Gateway\Raptor\Collections\RaptorPackage;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Loads all active Raptor-managed packages from the database and registers
 * them with PackageRegistry so PackageMenus creates their admin menus.
 */
class PackageLoader
{
    public static function load(): void
    {
        try {
            $records  = RaptorPackage::where('status', 'active')->get();
            $registry = Plugin::getInstance()->getPackageRegistry();

            foreach ($records as $record) {
                if ($registry->has($record->package_key)) {
                    continue;
                }
                $package = new DatabasePackage($record->toArray());
                $registry->register($package);
            }
        } catch (\Exception $e) {
            error_log('[Gateway] PackageLoader::load failed: ' . $e->getMessage());
        }
    }
}
