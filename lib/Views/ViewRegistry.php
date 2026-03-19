<?php

namespace Gateway\Views;

class ViewRegistry
{
    protected $views = [];

    public function register(\Gateway\View $view)
    {
        $key = $view->getKey();

        if (empty($key)) {
            throw new \InvalidArgumentException(
                sprintf("View '%s' must have a \$key property set", get_class($view))
            );
        }

        $this->views[$key] = $view;

        do_action('gateway_view_registered', get_class($view), $view);

        return $view;
    }

    public function get($key)
    {
        if (!isset($this->views[$key])) {
            throw new \InvalidArgumentException(
                sprintf("View with key '%s' is not registered", esc_html($key))
            );
        }

        return $this->views[$key];
    }

    public function has($key)
    {
        return isset($this->views[$key]);
    }

    public function getAll()
    {
        return $this->views;
    }

    public function getRegistered()
    {
        return array_keys($this->views);
    }

    public function count()
    {
        return count($this->views);
    }
}
