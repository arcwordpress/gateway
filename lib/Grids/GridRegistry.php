<?php

namespace Gateway\Grids;

class GridRegistry
{
    protected $grids = [];

    /**
     * Register a grid instance
     *
     * @param \Gateway\Grid $grid Grid instance to register
     * @return \Gateway\Grid
     */
    public function register(\Gateway\Grid $grid)
    {
        $key = $grid->getKey();

        if (empty($key)) {
            throw new \InvalidArgumentException(
                sprintf("Grid '%s' must have a \$key property set", get_class($grid))
            );
        }

        $this->grids[$key] = $grid;

        do_action('gateway_grid_registered', get_class($grid), $grid);

        return $grid;
    }

    /**
     * Get a registered grid by key
     *
     * @param string $key Grid key
     * @return \Gateway\Grid
     */
    public function get($key)
    {
        if (!isset($this->grids[$key])) {
            throw new \InvalidArgumentException(
                sprintf("Grid with key '%s' is not registered", esc_html($key))
            );
        }

        return $this->grids[$key];
    }

    /**
     * Check if a grid is registered by key
     *
     * @param string $key Grid key
     * @return bool
     */
    public function has($key)
    {
        return isset($this->grids[$key]);
    }

    /**
     * Get all registered grids
     *
     * @return array
     */
    public function getAll()
    {
        return $this->grids;
    }

    /**
     * Get all registered grid keys
     *
     * @return array
     */
    public function getRegistered()
    {
        return array_keys($this->grids);
    }

    /**
     * Count registered grids
     *
     * @return int
     */
    public function count()
    {
        return count($this->grids);
    }
}
