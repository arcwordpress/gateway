<?php

namespace Gateway\Views\Facets;

class FacetRegistry
{
    protected $facets = [];

    public function register(Facet $facet)
    {
        $key = $facet->getKey();

        if (empty($key)) {
            throw new \InvalidArgumentException(
                sprintf("Facet '%s' must have a \$key property set", get_class($facet))
            );
        }

        $this->facets[$key] = $facet;

        do_action('gateway_facet_registered', get_class($facet), $facet);

        return $facet;
    }

    public function get($key)
    {
        if (!isset($this->facets[$key])) {
            throw new \InvalidArgumentException(
                sprintf("Facet with key '%s' is not registered", esc_html($key))
            );
        }

        return $this->facets[$key];
    }

    public function has($key)
    {
        return isset($this->facets[$key]);
    }

    public function getAll()
    {
        return $this->facets;
    }

    public function getRegistered()
    {
        return array_keys($this->facets);
    }

    public function count()
    {
        return count($this->facets);
    }
}
