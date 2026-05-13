<?php

namespace Gateway;

/**
 * Base class for a registered Gateway package.
 *
 * Extend this class to create a package that groups collections under a
 * WordPress admin menu entry.
 *
 * Usage:
 *   class MyPackage extends \Gateway\Package {
 *       protected $key = 'my-package';
 *   }
 *   (new MyPackage())->register();
 */
class Package
{
    /** @var string Unique package key/slug */
    protected $key;

    /** @var string Display label */
    protected $label;

    /** @var string Optional description */
    protected $description = '';

    /** @var string WordPress dashicon class or custom icon URL */
    protected $icon = 'dashicons-admin-generic';

    /** @var int Menu position in WordPress admin */
    protected $position = 20;

    /** @var string Required capability to access this package */
    protected $capability = 'manage_options';

    /** @var string|null Parent menu slug (null = top-level) */
    protected $parent = null;

    /** @var array Collections that belong to this package */
    protected $collections = [];

    /** @var string WordPress menu slug */
    protected $menuSlug;

    public function __construct()
    {
        if (empty($this->key)) {
            throw new \InvalidArgumentException('Package key must be set in extended class');
        }

        if (empty($this->label)) {
            $this->label = ucwords(str_replace(['-', '_'], ' ', $this->key));
        }

        $this->menuSlug = 'gateway-package-' . $this->key;
    }

    public function register()
    {
        $registry = \Gateway\Plugin::getInstance()->getPackageRegistry();
        if ($registry === null) {
            return $this;
        }
        return $registry->register($this);
    }

    public function getKey()        { return $this->key; }
    public function getLabel()      { return $this->label; }
    public function getDescription(){ return $this->description; }
    public function getIcon()       { return $this->icon; }
    public function getPosition()   { return $this->position; }
    public function getCapability() { return $this->capability; }
    public function getParent()     { return $this->parent; }
    public function getMenuSlug()   { return $this->menuSlug; }
    public function isTopLevel()    { return $this->parent === null; }
    public function isSubmenu()     { return $this->parent !== null; }
    public function getCollections(){ return $this->collections; }

    public function addCollection($collection)
    {
        $this->collections[] = $collection;
        return $this;
    }

    public function setCollections(array $collections)
    {
        $this->collections = $collections;
        return $this;
    }

    public function toArray()
    {
        return [
            'key'               => $this->key,
            'label'             => $this->label,
            'description'       => $this->description,
            'icon'              => $this->icon,
            'position'          => $this->position,
            'capability'        => $this->capability,
            'parent'            => $this->parent,
            'menu_slug'         => $this->menuSlug,
            'is_top_level'      => $this->isTopLevel(),
            'is_submenu'        => $this->isSubmenu(),
            'collections_count' => count($this->collections),
        ];
    }
}
