<?php
namespace Gateway\Blocks;

class BlockRegistry
{
    protected static $instance = null;
    protected $blocks = [];

    public static function instance()
    {
        if (!self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Register a block instance
     *
     * @param \Gateway\Block $block
     * @return \Gateway\Block
     */
    public function register($block)
    {
        if (!$block instanceof \Gateway\Block) {
            throw new \InvalidArgumentException("Must pass a Gateway\\Block instance");
        }

        $name = $block->getName();
        if (empty($name)) {
            throw new \InvalidArgumentException(
                sprintf("Block '%s' must have a name set", get_class($block))
            );
        }

        // Store in registry
        $this->blocks[$name] = $block;

        // Note: Actual WordPress block registration is handled by BlockInit::registerBlocks()
        // which is called on the 'init' hook and uses the gt1 script globally
        
        do_action('gateway_block_registered', get_class($block), $block);

        return $block;
    }

    public function get($name)
    {
        if (!isset($this->blocks[$name])) {
            throw new \InvalidArgumentException(
                sprintf("Block with name '%s' is not registered", esc_html($name))
            );
        }
        return $this->blocks[$name];
    }

    public function has($name)
    {
        return isset($this->blocks[$name]);
    }

    public function unregister($name)
    {
        if (isset($this->blocks[$name])) {
            unset($this->blocks[$name]);
            do_action('gateway_block_unregistered', $name);
            return true;
        }
        return false;
    }

    public function getAll()
    {
        return $this->blocks;
    }

    public function getRegistered()
    {
        return array_keys($this->blocks);
    }

    public function count()
    {
        return count($this->blocks);
    }

    public function clear()
    {
        $this->blocks = [];
        do_action('gateway_block_registry_cleared');
    }

    /**
     * Get all blocks as metadata array for API/JS consumption
     *
     * @return array
     */
    public function getMetadata()
    {
        return array_map(function($block) {
            return $block->getMetadata();
        }, $this->blocks);
    }
}