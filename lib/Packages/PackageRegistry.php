<?php

namespace Gateway\Packages;

use Gateway\Package;

/**
 * Registry for managing registered packages.
 */
class PackageRegistry
{
    /** @var Package[] Registered packages indexed by key */
    private $packages = [];

    public function register(Package $package)
    {
        $key = $package->getKey();

        if (empty($key)) {
            throw new \InvalidArgumentException('Package key cannot be empty');
        }

        if (isset($this->packages[$key])) {
            return $this->packages[$key];
        }

        $this->packages[$key] = $package;
        return $package;
    }

    public function get($key)
    {
        return $this->packages[$key] ?? null;
    }

    public function getAll()
    {
        return $this->packages;
    }

    public function has($key)
    {
        return isset($this->packages[$key]);
    }

    public function unregister($key)
    {
        if (isset($this->packages[$key])) {
            unset($this->packages[$key]);
            return true;
        }
        return false;
    }

    public function toArray()
    {
        return array_map(fn($p) => $p->toArray(), $this->packages);
    }
}
