<?php

namespace Gateway\Views\Render;

abstract class Strategy
{
    abstract public function render(\Gateway\View $view, array $context = []): string;

    abstract public function getType(): string;

    public function supports(\Gateway\View $view): bool
    {
        return true;
    }
}
