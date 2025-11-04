<?php

namespace ARC\Maze;

class StateManager
{
    private static $instance = null;

    public static function init()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct()
    {
        // Initialize state manager hooks
        add_action('init', [$this, 'registerHooks']);
    }

    public function registerHooks()
    {
        // Hook for state management
        do_action('arc_maze_state_manager_ready');
    }
}
