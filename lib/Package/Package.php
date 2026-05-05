<?php

namespace Gateway\Package;

/**
 * Package class represents a registered package that groups collections
 * 
 * Extend class: Package extends \Gateway\Package
 * 
 * Then register: $package->register();
 * 
 * Collections can reference this package:
 * class MyCollection extends Collection {
 *     protected $package = 'my-package';
 * }
 */
class Package
{
    /**
     * @var string Unique package key/slug
     */
    protected $key;

    /**
     * @var string Display label for the package
     */
    protected $label;

    /**
     * @var string Optional description
     */
    protected $description = '';

    /**
     * @var string WordPress dashicon class or custom icon URL
     */
    protected $icon = 'dashicons-admin-generic';

    /**
     * @var int Menu position in WordPress admin (null for submenu)
     */
    protected $position = 20;

    /**
     * @var string Required capability to access this package
     */
    protected $capability = 'manage_options';

    /**
     * @var string|null Parent menu slug (null for top-level menu)
     * Examples: 'edit.php', 'tools.php', 'options-general.php'
     */
    protected $parent = null;

    /**
     * @var array Collections that belong to this package
     */
    protected $collections = [];

    /**
     * @var string Menu slug for WordPress
     */
    protected $menuSlug;

    /**
     * Constructor - auto-configures from class properties
     */
    public function __construct()
    {
        // If key not set, throw error
        if (empty($this->key)) {
            throw new \InvalidArgumentException('Package key must be set in extended class');
        }

        // Auto-generate label from key if not set
        if (empty($this->label)) {
            $this->label = ucwords(str_replace(['-', '_'], ' ', $this->key));
        }

        // Generate menu slug
        $this->menuSlug = 'gateway-package-' . $this->key;
    }

    /**
     * Register this package with the PackageRegistry
     *
     * @return static
     */
    public function register()
    {
        $registry = \Gateway\Plugin::getInstance()->getPackageRegistry();
        if ($registry === null) {
            return $this;
        }
        return $registry->register($this);
    }

    /**
     * Get package key
     *
     * @return string
     */
    public function getKey()
    {
        return $this->key;
    }

    /**
     * Get package label
     *
     * @return string
     */
    public function getLabel()
    {
        return $this->label;
    }

    /**
     * Get package description
     *
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * Get package icon
     *
     * @return string
     */
    public function getIcon()
    {
        return $this->icon;
    }

    /**
     * Get menu position
     *
     * @return int|null
     */
    public function getPosition()
    {
        return $this->position;
    }

    /**
     * Get required capability
     *
     * @return string
     */
    public function getCapability()
    {
        return $this->capability;
    }

    /**
     * Get parent menu slug
     *
     * @return string|null
     */
    public function getParent()
    {
        return $this->parent;
    }

    /**
     * Get menu slug for WordPress
     *
     * @return string
     */
    public function getMenuSlug()
    {
        return $this->menuSlug;
    }

    /**
     * Check if this is a top-level menu
     *
     * @return bool
     */
    public function isTopLevel()
    {
        return $this->parent === null;
    }

    /**
     * Check if this is a submenu
     *
     * @return bool
     */
    public function isSubmenu()
    {
        return $this->parent !== null;
    }

    /**
     * Get collections that belong to this package
     *
     * @return array
     */
    public function getCollections()
    {
        return $this->collections;
    }

    /**
     * Add a collection to this package
     *
     * @param \Gateway\Collection $collection
     * @return static
     */
    public function addCollection($collection)
    {
        $this->collections[] = $collection;
        return $this;
    }

    /**
     * Set collections for this package
     *
     * @param array $collections
     * @return static
     */
    public function setCollections(array $collections)
    {
        $this->collections = $collections;
        return $this;
    }

    /**
     * Convert package to array representation
     *
     * @return array
     */
    public function toArray()
    {
        return [
            'key' => $this->key,
            'label' => $this->label,
            'description' => $this->description,
            'icon' => $this->icon,
            'position' => $this->position,
            'capability' => $this->capability,
            'parent' => $this->parent,
            'menu_slug' => $this->menuSlug,
            'is_top_level' => $this->isTopLevel(),
            'is_submenu' => $this->isSubmenu(),
            'collections_count' => count($this->collections),
        ];
    }
}