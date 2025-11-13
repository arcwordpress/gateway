<?php

namespace Gateway\Package;

/**
 * Package class represents a registered package that groups collections
 * 
 * Packages allow developers to organize collections into logical groups
 * and control where they appear in the WordPress admin menu.
 * 
 * Usage:
 * $package = new Package('my-package', [
 *     'label' => 'My Package',
 *     'description' => 'Package description',
 *     'icon' => 'dashicons-admin-generic',
 *     'position' => 20,
 *     'capability' => 'manage_options',
 *     'parent' => 'edit.php', // Optional: make it a submenu
 * ]);
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
     * Constructor
     *
     * @param string $key Package unique key/slug
     * @param array $config Configuration options
     */
    public function __construct(string $key, array $config = [])
    {
        $this->key = $key;
        $this->label = $config['label'] ?? ucwords(str_replace(['-', '_'], ' ', $key));
        $this->description = $config['description'] ?? '';
        $this->icon = $config['icon'] ?? 'dashicons-admin-generic';
        $this->position = $config['position'] ?? 20;
        $this->capability = $config['capability'] ?? 'manage_options';
        $this->parent = $config['parent'] ?? null;
        $this->menuSlug = 'gateway-package-' . $key;
    }

    /**
     * Register this package with the PackageRegistry
     *
     * @return static
     */
    public function register()
    {
        return \Gateway\Plugin::getInstance()->getPackageRegistry()->register($this);
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