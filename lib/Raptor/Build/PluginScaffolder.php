<?php

namespace Gateway\Raptor\Build;

use Gateway\Raptor\Collections\RaptorExtension;
use Gateway\Raptor\Collections\RaptorExtensionFile;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Creates and maintains the generated plugin's file structure.
 *
 * Responsibilities:
 *   - Create the plugin directory tree
 *   - Write the main plugin entry file from template
 *   - Write lib/Extension.php from template
 *   - Activate / deactivate the plugin in WordPress
 */
class PluginScaffolder
{
    /**
     * Scaffold the full plugin directory and write the main plugin entry file.
     * Safe to call on repeat builds — existing files are overwritten in place.
     */
    public function scaffold(
        string $pluginDir,
        string $pluginSlug,
        string $namespace,
        string $constantPrefix,
        string $projectName,
        RaptorExtension $extension
    ): array {
        foreach (['lib/Packages', 'lib/Collections', 'lib/Migrations', 'lib/Views', 'schemas'] as $subDir) {
            if (!is_dir($pluginDir . '/' . $subDir) && !wp_mkdir_p($pluginDir . '/' . $subDir)) {
                return ['success' => false, 'error' => "Failed to create plugin directory: {$subDir}"];
            }
        }

        $templatePath = GATEWAY_PATH . 'templates/scaffold/plugin_main.php';
        if (!file_exists($templatePath)) {
            return ['success' => false, 'error' => 'Plugin template not found.'];
        }

        $code = str_replace(
            ['{{PROJECT_NAME}}', '{{PROJECT_SLUG}}', '{{NAMESPACE}}', '{{CONSTANT_PREFIX}}', '{{VERSION}}'],
            [$projectName, $pluginSlug, $namespace, $constantPrefix, $extension->version ?: '1.0.0'],
            file_get_contents($templatePath)
        );

        $pluginFile = $pluginDir . '/' . $pluginSlug . '.php';
        if (file_put_contents($pluginFile, $code) === false) {
            return ['success' => false, 'error' => 'Failed to write main plugin file.'];
        }

        $extensionResult = $this->buildExtensionFile($pluginDir, $namespace, $extension);
        if (!$extensionResult['success']) {
            return $extensionResult;
        }

        return ['success' => true, 'plugin_file' => $pluginFile];
    }

    /**
     * Write lib/Extension.php — the thin Gateway\Extension subclass that registers
     * this plugin with Gateway's ExtensionRegistry.
     *
     * Public so ExtensionRoutes can call it directly for targeted repairs.
     */
    public function buildExtensionFile(string $pluginDir, string $namespace, RaptorExtension $extension): array
    {
        try {
            RaptorExtensionFile::firstOrCreate(['extension_id' => $extension->id]);
        } catch (\Throwable $e) {
            // Table may not exist yet — non-fatal.
        }

        $libDir = $pluginDir . '/lib';
        if (!is_dir($libDir) && !wp_mkdir_p($libDir)) {
            return ['success' => false, 'error' => 'Failed to create lib directory.'];
        }

        $templatePath = GATEWAY_PATH . 'templates/scaffold/extension_class.php';
        if (!file_exists($templatePath)) {
            return ['success' => false, 'error' => 'Extension class template not found.'];
        }

        $code = str_replace(
            ['{{NAMESPACE}}', '{{KEY}}', '{{TITLE}}'],
            [$namespace, addslashes($extension->extension_key), addslashes($extension->title)],
            file_get_contents($templatePath)
        );

        $file = $libDir . '/Extension.php';
        if (file_put_contents($file, $code) === false) {
            return ['success' => false, 'error' => 'Failed to write Extension.php.'];
        }

        return ['success' => true, 'file' => $file];
    }

    /**
     * Activate the generated plugin in WordPress.
     */
    public function activate(string $pluginSlug): array
    {
        $pluginFile = $pluginSlug . '/' . $pluginSlug . '.php';

        if (!function_exists('activate_plugin')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        if (is_plugin_active($pluginFile)) {
            return ['activated' => false, 'already_active' => true];
        }

        $result = activate_plugin($pluginFile);

        if (is_wp_error($result)) {
            return ['activated' => false, 'error' => $result->get_error_message()];
        }

        return ['activated' => true];
    }
}
