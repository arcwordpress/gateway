<?php

namespace Gateway\Packages;

use Gateway\Package;
use Gateway\Plugin;

/**
 * Handles creation of WordPress admin menus for registered packages.
 */
class PackageMenus
{
    public static function init()
    {
        add_action('admin_menu', [__CLASS__, 'registerMenus'], 20);
        add_action('admin_enqueue_scripts', [__CLASS__, 'enqueue_studio_app']);
    }

    public static function registerMenus()
    {
        $registry = Plugin::getInstance()->getPackageRegistry();
        $packages = $registry->getAll();

        foreach ($packages as $package) {
            if ($package->isTopLevel()) {
                self::registerTopLevelMenu($package);
            } else {
                self::registerSubmenu($package);
            }
        }
    }

    private static function registerTopLevelMenu(Package $package)
    {
        add_menu_page(
            $package->getLabel(),
            $package->getLabel(),
            $package->getCapability(),
            $package->getMenuSlug(),
            [__CLASS__, 'renderPackagePage'],
            $package->getIcon(),
            $package->getPosition()
        );
    }

    private static function registerSubmenu(Package $package)
    {
        add_submenu_page(
            $package->getParent(),
            $package->getLabel(),
            $package->getLabel(),
            $package->getCapability(),
            $package->getMenuSlug(),
            [__CLASS__, 'renderPackagePage']
        );
    }

    public static function enqueue_studio_app($hook)
    {
        $registry = Plugin::getInstance()->getPackageRegistry();
        $packages = $registry->getAll();

        $isPackagePage = false;
        foreach ($packages as $package) {
            $expectedHook = $package->isTopLevel()
                ? 'toplevel_page_' . $package->getMenuSlug()
                : get_plugin_page_hookname($package->getMenuSlug(), $package->getParent());

            if ($hook === $expectedHook || strpos($hook, $package->getMenuSlug()) !== false) {
                $isPackagePage = true;
                break;
            }
        }

        if (!$isPackagePage) {
            return;
        }

        $asset_file = GATEWAY_PATH . 'react/apps/studio/build/index.asset.php';
        if (!file_exists($asset_file)) {
            return;
        }

        $asset     = require $asset_file;
        $build_url = GATEWAY_URL . 'react/apps/studio/build/';

        wp_enqueue_media();

        wp_enqueue_script('gateway-studio', $build_url . 'index.js', $asset['dependencies'], $asset['version'], true);
        wp_enqueue_style('gateway-studio-index', $build_url . 'index.css', [], $asset['version']);
        wp_enqueue_style('gateway-studio-style-index', $build_url . 'style-index.css', [], $asset['version']);

        wp_localize_script('gateway-studio', 'gatewayAdminScript', [
            'apiUrl' => rest_url(),
            'nonce'  => wp_create_nonce('wp_rest'),
        ]);
    }

    public static function renderPackagePage()
    {
        $menuSlug = $_GET['page'] ?? '';
        $registry = Plugin::getInstance()->getPackageRegistry();

        $package = null;
        foreach ($registry->getAll() as $pkg) {
            if ($pkg->getMenuSlug() === $menuSlug) {
                $package = $pkg;
                break;
            }
        }

        if (!$package) {
            echo '<div class="wrap"><h1>Package not found</h1></div>';
            return;
        }

        ?>
        <div gateway-studio-app
             data-package="<?php echo esc_attr($package->getKey()); ?>"
             data-package-label="<?php echo esc_attr($package->getLabel()); ?>">
        </div>
        <?php
    }
}
