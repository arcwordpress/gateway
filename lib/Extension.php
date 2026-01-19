<?php
namespace Gateway;

class Extension
{
    protected $key;
    protected $pluginPath;

    public static function register()
    {
        $instance = new static();
        return \Gateway\Extensions\ExtensionRegistry::instance()->register($instance);
    }

    public function getKey()
    {
        if ($this->key) {
            return $this->key;
        }
        $className = class_basename(static::class);
        $key = strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', $className));
        return $key;
    }

    /**
     * Get the plugin slug (directory name)
     * Converts underscores to hyphens for WordPress plugin conventions
     *
     * @return string
     */
    public function getPluginSlug()
    {
        return str_replace('_', '-', $this->getKey());
    }

    /**
     * Get the absolute path to the extension's plugin directory
     * Uses reflection to find where the extension class is defined
     *
     * @return string|null
     */
    public function getPluginPath()
    {
        if ($this->pluginPath) {
            return $this->pluginPath;
        }

        try {
            $reflection = new \ReflectionClass(static::class);
            $classFile = $reflection->getFileName();

            if ($classFile) {
                // Find the plugin root by looking for the directory that contains the class file
                // Typically: /wp-content/plugins/{plugin-name}/...
                $pluginDir = dirname($classFile);

                // Walk up the directory tree until we find the plugins directory or hit the limit
                $maxDepth = 10;
                $depth = 0;

                while ($depth < $maxDepth) {
                    $parent = dirname($pluginDir);

                    // If parent is 'plugins', we found the plugin root
                    if (basename($parent) === 'plugins') {
                        $this->pluginPath = $pluginDir;
                        return $this->pluginPath;
                    }

                    $pluginDir = $parent;
                    $depth++;
                }
            }
        } catch (\ReflectionException $e) {
            return null;
        }

        return null;
    }

    /**
     * Get the absolute path to the extension's lib directory
     *
     * @return string|null
     */
    public function getLibPath()
    {
        $pluginPath = $this->getPluginPath();
        return $pluginPath ? $pluginPath . '/lib' : null;
    }

    /**
     * Get the absolute path to the extension's Database directory
     *
     * @return string|null
     */
    public function getDatabasePath()
    {
        $libPath = $this->getLibPath();
        return $libPath ? $libPath . '/Database' : null;
    }

    /**
     * Check if the extension has the standard directory structure
     *
     * @return bool
     */
    public function hasStandardStructure()
    {
        $databasePath = $this->getDatabasePath();
        return $databasePath && file_exists($databasePath) && is_dir($databasePath);
    }
}