<?php
<?php

namespace Gateway\Package;

use Gateway\Plugin;

/**
 * Handles creation of WordPress admin menus for registered packages
 */
class PackageMenus
{
    /**
     * Initialize menu hooks
     */
    public static function init()
    {
        add_action('admin_menu', [__CLASS__, 'registerMenus'], 20);
        add_action('admin_enqueue_scripts', [__CLASS__, 'enqueue_studio_app']);
    }

    /**
     * Register admin menus for all packages
     */
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

    /**
     * Register a top-level menu
     *
     * @param Package $package
     */
    private static function registerTopLevelMenu(Package $package)
    {
        add_menu_page(
            $package->getLabel(),           // page_title
            $package->getLabel(),           // menu_title
            $package->getCapability(),      // capability
            $package->getMenuSlug(),        // menu_slug
            [__CLASS__, 'renderPackagePage'], // callback
            $package->getIcon(),            // icon_url
            $package->getPosition()         // position
        );
    }

    /**
     * Register a submenu under an existing menu
     *
     * @param Package $package
     */
    private static function registerSubmenu(Package $package)
    {
        add_submenu_page(
            $package->getParent(),          // parent_slug
            $package->getLabel(),           // page_title
            $package->getLabel(),           // menu_title
            $package->getCapability(),      // capability
            $package->getMenuSlug(),        // menu_slug
            [__CLASS__, 'renderPackagePage'] // callback
        );
    }

    /**
     * Enqueue the React studio app for package pages
     */
    public static function enqueue_studio_app($hook)
    {
        // Check if we're on a package page
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

        $asset = require $asset_file;
        $build_url = GATEWAY_URL . 'react/apps/studio/build/';

        // Enqueue WordPress media library for file/image/gallery fields
        wp_enqueue_media();

        wp_enqueue_script(
            'gateway-studio',
            $build_url . 'index.js',
            $asset['dependencies'],
            $asset['version'],
            true
        );

        wp_enqueue_style(
            'gateway-studio-index',
            $build_url . 'index.css',
            [],
            $asset['version']
        );

        wp_enqueue_style(
            'gateway-studio-style-index',
            $build_url . 'style-index.css',
            [],
            $asset['version']
        );

        // Localize script with API settings and nonce
        wp_localize_script(
            'gateway-studio',
            'gatewayAdminScript',
            [
                'apiUrl' => rest_url(),
                'nonce' => wp_create_nonce('wp_rest'),
            ]
        );
    }

    /**
     * Render package page - loads Studio app with package data
     */
    public static function renderPackagePage()
    {
        $menuSlug = $_GET['page'] ?? '';
        $registry = Plugin::getInstance()->getPackageRegistry();
        
        // Find package by menu slug
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

        // Render Studio app with package identifier
        ?>
        <div id="gateway-admin-root" data-package="<?php echo esc_attr($package->getKey()); ?>"></div>
        <?php
    }
}