<?php

namespace Gateway\Views\Render;

class Register
{
    protected $strategies = [];

    public function register(Strategy $strategy)
    {
        $type = $strategy->getType();

        if ($type === '') {
            throw new \InvalidArgumentException(
                sprintf("Render strategy '%s' must return a non-empty type", get_class($strategy))
            );
        }

        $this->strategies[$type] = $strategy;

        do_action('gateway_view_render_strategy_registered', get_class($strategy), $strategy);

        return $strategy;
    }

    public function get($type)
    {
        if (!isset($this->strategies[$type])) {
            throw new \InvalidArgumentException(
                sprintf("Render strategy type '%s' is not registered", esc_html($type))
            );
        }

        return $this->strategies[$type];
    }

    public function has($type)
    {
        return isset($this->strategies[$type]);
    }

    public function getAll()
    {
        return $this->strategies;
    }

    public function getRegistered()
    {
        return array_keys($this->strategies);
    }

    public function count()
    {
        return count($this->strategies);
    }

    public function all(): array
    {
        return $this->getAll();
    }
}
