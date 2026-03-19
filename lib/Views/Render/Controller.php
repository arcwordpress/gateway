<?php

namespace Gateway\Views\Render;

class Controller
{
    private static $instance = null;

    private $register;

    public function __construct(Register $register)
    {
        $this->register = $register;
    }

    public static function instance(): self
    {
        if (self::$instance !== null) {
            return self::$instance;
        }

        $register = new Register();
        $controller = new self($register);
        $controller->registerDefaultStrategies();

        self::$instance = $controller;

        return self::$instance;
    }

    public static function setInstance(self $instance): void
    {
        self::$instance = $instance;
    }

    public function render(\Gateway\View $view, string $type, array $context = []): string
    {
        if (!$this->register->has($type)) {
            throw new \InvalidArgumentException(
                sprintf("No render strategy registered for view type '%s'", esc_html($type))
            );
        }

        $strategy = $this->register->get($type);

        if (!$strategy->supports($view)) {
            throw new \InvalidArgumentException(
                sprintf("Render strategy '%s' does not support view '%s'", esc_html($type), esc_html(get_class($view)))
            );
        }

        return $strategy->render($view, $context);
    }

    public function getRegister(): Register
    {
        return $this->register;
    }

    private function registerDefaultStrategies(): void
    {
        $this->register->register(new Shortcode\ShortcodeRender());
        $this->register->register(new Block\BlockRender());
        $this->register->register(new Template\TemplateRender());
        $this->register->register(new Page\PageRender());
    }
}
