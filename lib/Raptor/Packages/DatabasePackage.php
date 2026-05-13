<?php

namespace Gateway\Raptor\Packages;

use Gateway\Package\Package;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * A Package instance hydrated from a Raptor DB record.
 *
 * Raptor stores packages in gateway_raptor_package and registers them
 * at runtime via PackageLoader so they behave identically to code-defined
 * packages (admin menu, Studio app, menu slug, etc.).
 */
class DatabasePackage extends Package
{
    public function __construct(array $record)
    {
        $this->key         = $record['package_key'];
        $this->label       = $record['label']       ?? '';
        $this->description = $record['description'] ?? '';
        $this->icon        = $record['icon']        ?? 'dashicons-admin-generic';
        $this->position    = (int) ($record['position']   ?? 20);
        $this->capability  = $record['capability']  ?? 'manage_options';
        $this->parent      = $record['parent']       ?: null;
        $this->collections = $record['collections'] ?? [];

        parent::__construct();
    }
}
