<?php
namespace Gateway\Extensions;

class ExtensionRegistry
{
    protected static $instance = null;
    protected $extensions = [];

    public static function instance()
    {
        if (!self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Register an extension instance
     *
     * @param Extension $extension
     * @return Extension
     */
    public function register($extension)
    {
        if (!$extension instanceof \Gateway\Extension) {
            throw new \InvalidArgumentException("Must pass a Gateway\\Extension instance");
        }

        $key = $extension->getKey();
        if (empty($key)) {
            throw new \InvalidArgumentException(
                sprintf("Extension '%s' must have a \$key property set", get_class($extension))
            );
        }

        $this->extensions[$key] = $extension;
        do_action('gateway_extension_registered', get_class($extension), $extension);

        return $extension;
    }

    public function get($key)
    {
        if (!isset($this->extensions[$key])) {
            throw new \InvalidArgumentException(
                sprintf("Extension with key '%s' is not registered", esc_html($key))
            );
        }
        return $this->extensions[$key];
    }

    public function has($key)
    {
        return isset($this->extensions[$key]);
    }

    public function unregister($key)
    {
        if (isset($this->extensions[$key])) {
            unset($this->extensions[$key]);
            do_action('gateway_extension_unregistered', $key);
            return true;
        }
        return false;
    }

    public function getAll()
    {
        return $this->extensions;
    }

    public function getRegistered()
    {
        return array_keys($this->extensions);
    }

    public function count()
    {
        return count($this->extensions);
    }

    public function clear()
    {
        $this->extensions = [];
        do_action('gateway_extension_registry_cleared');
    }
}