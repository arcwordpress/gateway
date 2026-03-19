<?php

namespace Gateway\Views;

/**
 * File From Data - Generates view PHP class from database data
 */
class FileFromData
{
    /**
     * Generate view class file from view data.
     *
     * @param array  $viewData         Keys: view_key, title, collection_key, columns,
     *                                 facet_filters, default_sort, per_page
     * @param string $pluginSlug       Plugin slug (e.g. 'horizon')
     * @param string $pluginNamespace  Plugin namespace (e.g. 'Horizon')
     * @return bool True on success, false on failure
     */
    public static function generateViewClass(array $viewData, string $pluginSlug, string $pluginNamespace): bool
    {
        if (empty($viewData['view_key'])) {
            error_log('[Gateway] View key missing, cannot generate view class');
            return false;
        }

        if (empty($viewData['collection_key'])) {
            error_log('[Gateway] Collection key missing for view, cannot generate view class');
            return false;
        }

        $pluginDir = WP_PLUGIN_DIR . '/' . $pluginSlug;

        if (!is_dir($pluginDir)) {
            error_log("[Gateway] Plugin directory does not exist: {$pluginDir}");
            return false;
        }

        $viewsDir = $pluginDir . '/lib/Views';
        if (!is_dir($viewsDir)) {
            if (!wp_mkdir_p($viewsDir)) {
                error_log("[Gateway] Failed to create Views directory: {$viewsDir}");
                return false;
            }
        }

        $templatePath = GATEWAY_PATH . 'templates/scaffold/view_class.php';
        if (!file_exists($templatePath)) {
            error_log("[Gateway] View template not found: {$templatePath}");
            return false;
        }

        $template = file_get_contents($templatePath);

        $className       = self::keyToClassName($viewData['view_key']);
        $collectionClass = self::keyToClassName($viewData['collection_key']);
        $sourceClass     = $pluginNamespace . '\\Collections\\' . $collectionClass;

        $replacements = [
            '{{NAMESPACE}}'     => $pluginNamespace,
            '{{CLASS_NAME}}'    => $className,
            '{{VIEW_KEY}}'      => $viewData['view_key'],
            '{{SOURCE_CLASS}}'  => $sourceClass,
            '{{COLUMNS}}'       => self::arrayToPhpLiteral($viewData['columns'] ?? []),
            '{{FACET_FILTERS}}' => self::arrayToPhpLiteral($viewData['facet_filters'] ?? []),
            '{{DEFAULT_SORT}}'  => self::arrayToPhpLiteral($viewData['default_sort'] ?? []),
            '{{PER_PAGE}}'      => (int) ($viewData['per_page'] ?? 20),
        ];

        $classContent = str_replace(array_keys($replacements), array_values($replacements), $template);

        $filePath = $viewsDir . '/' . $className . '.php';
        $result   = file_put_contents($filePath, $classContent);

        if ($result === false) {
            error_log("[Gateway] Failed to write view class to: {$filePath}");
            return false;
        }

        chmod($filePath, 0644);

        error_log("[Gateway] Generated view class: {$filePath}");
        return true;
    }

    /**
     * Convert key to PascalCase class name.
     * Example: article_list -> ArticleList
     */
    private static function keyToClassName(string $key): string
    {
        return str_replace('_', '', ucwords($key, '_'));
    }

    /**
     * Generate page class file for a view that has a "page" render type.
     *
     * @param array  $viewData         Must contain: view_key, title
     * @param string $pluginSlug       Plugin slug (e.g. 'horizon')
     * @param string $pluginNamespace  Plugin namespace (e.g. 'Horizon')
     * @return bool True on success, false on failure
     */
    public static function generatePageClass(array $viewData, string $pluginSlug, string $pluginNamespace): bool
    {
        if (empty($viewData['view_key'])) {
            error_log('[Gateway] View key missing, cannot generate page class');
            return false;
        }

        $pluginDir = WP_PLUGIN_DIR . '/' . $pluginSlug;

        if (!is_dir($pluginDir)) {
            error_log("[Gateway] Plugin directory does not exist: {$pluginDir}");
            return false;
        }

        $pagesDir = $pluginDir . '/lib/Pages';
        if (!is_dir($pagesDir)) {
            if (!wp_mkdir_p($pagesDir)) {
                error_log("[Gateway] Failed to create Pages directory: {$pagesDir}");
                return false;
            }
        }

        $templatePath = GATEWAY_PATH . 'templates/scaffold/page_class.php';
        if (!file_exists($templatePath)) {
            error_log("[Gateway] Page template not found: {$templatePath}");
            return false;
        }

        $template = file_get_contents($templatePath);

        $viewKey   = $viewData['view_key'];
        $className = self::keyToClassName($viewKey) . 'Page';
        $slug      = str_replace('_', '-', $viewKey);
        $title     = !empty($viewData['title']) ? $viewData['title'] : self::keyToTitle($viewKey);
        $content   = '[gateway_view key="' . $viewKey . '"]';

        $replacements = [
            '{{NAMESPACE}}'  => $pluginNamespace,
            '{{CLASS_NAME}}' => $className,
            '{{PAGE_TITLE}}' => addslashes($title),
            '{{PAGE_SLUG}}'  => $slug,
            '{{PAGE_CONTENT}}' => $content,
        ];

        $classContent = str_replace(array_keys($replacements), array_values($replacements), $template);

        $filePath = $pagesDir . '/' . $className . '.php';
        $result   = file_put_contents($filePath, $classContent);

        if ($result === false) {
            error_log("[Gateway] Failed to write page class to: {$filePath}");
            return false;
        }

        chmod($filePath, 0644);

        error_log("[Gateway] Generated page class: {$filePath}");
        return true;
    }

    /**
     * Convert key to human-readable title.
     * Example: article_list -> Article List
     */
    private static function keyToTitle(string $key): string
    {
        return ucwords(str_replace('_', ' ', $key));
    }

    /**
     * Format a PHP value as an inline literal suitable for class property assignment.
     * Uses var_export() for correctness, then normalises indentation.
     */
    private static function arrayToPhpLiteral($value): string
    {
        if (empty($value)) {
            return '[]';
        }

        $exported = var_export($value, true);

        // Replace array ( with [ syntax
        $exported = preg_replace('/array \(/', '[', $exported);
        $exported = preg_replace('/\)/', ']', $exported);

        return $exported;
    }
}
