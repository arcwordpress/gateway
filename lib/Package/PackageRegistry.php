<?php

namespace Gateway\Package;

/**
 * Registry for managing registered packages
 */
class PackageRegistry
{
    /**
     * @var array Registered packages indexed by key
     */
    private $packages = [];

    /**
     * Register a package
     *
     * @param Package $package
     * @return Package
     * @throws \InvalidArgumentException
     */
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

    /**
     * Get a package by key
     *
     * @param string $key
     * @return Package|null
     */
    public function get($key)
    {
        return $this->packages[$key] ?? null;
    }

    /**
     * Get all registered packages
     *
     * @return array
     */
    public function getAll()
    {
        return $this->packages;
    }

    /**
     * Check if a package is registered
     *
     * @param string $key
     * @return bool
     */
    public function has($key)
    {
        return isset($this->packages[$key]);
    }

    /**
     * Unregister a package
     *
     * @param string $key
     * @return bool
     */
    public function unregister($key)
    {
        if (isset($this->packages[$key])) {
            unset($this->packages[$key]);
            return true;
        }
        return false;
    }

    /**
     * Get all packages as array
     *
     * @return array
     */
    public function toArray()
    {
        return array_map(function ($package) {
            return $package->toArray();
        }, $this->packages);
    }
}