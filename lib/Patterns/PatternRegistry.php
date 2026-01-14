<?php

namespace Gateway\Patterns;

/**
 * Pattern Registry
 *
 * Manages registration of Gateway block patterns with WordPress.
 * Automatically discovers and registers patterns from the Core directory.
 */
class PatternRegistry {
    /**
     * @var Pattern[] Registered patterns
     */
    private array $patterns = [];

    /**
     * @var bool Whether patterns have been registered
     */
    private bool $registered = false;

    /**
     * Register a pattern
     *
     * @param Pattern $pattern
     * @return self
     */
    public function register(Pattern $pattern): self {
        $this->patterns[$pattern->getSlug()] = $pattern;
        return $this;
    }

    /**
     * Get a registered pattern by slug
     *
     * @param string $slug
     * @return Pattern|null
     */
    public function get(string $slug): ?Pattern {
        return $this->patterns[$slug] ?? null;
    }

    /**
     * Get all registered patterns
     *
     * @return Pattern[]
     */
    public function all(): array {
        return $this->patterns;
    }

    /**
     * Auto-discover and register patterns from the Core directory
     *
     * @return self
     */
    public function discoverCorePatterns(): self {
        $coreDir = __DIR__ . '/Core';

        if (!is_dir($coreDir)) {
            return $this;
        }

        $files = glob($coreDir . '/*.php');

        foreach ($files as $file) {
            $className = 'Gateway\\Patterns\\Core\\' . basename($file, '.php');

            if (class_exists($className)) {
                $pattern = new $className();

                if ($pattern instanceof Pattern) {
                    $this->register($pattern);
                }
            }
        }

        return $this;
    }

    /**
     * Register pattern category with WordPress
     *
     * @param string $name Category slug
     * @param string $label Category label
     * @return void
     */
    public function registerCategory(string $name, string $label): void {
        if (function_exists('register_block_pattern_category')) {
            register_block_pattern_category($name, ['label' => $label]);
        }
    }

    /**
     * Register all patterns with WordPress
     *
     * @return void
     */
    public function registerWithWordPress(): void {
        if ($this->registered || !function_exists('register_block_pattern')) {
            return;
        }

        // Register the Gateway pattern category
        $this->registerCategory('gateway', __('Gateway Patterns', 'gateway'));
        $this->registerCategory('data', __('Data Patterns', 'gateway'));

        // Register each pattern
        foreach ($this->patterns as $pattern) {
            register_block_pattern($pattern->getSlug(), $pattern->toArray());
        }

        $this->registered = true;
    }

    /**
     * Initialize the pattern registry
     *
     * @return void
     */
    public function init(): void {
        // Discover core patterns
        $this->discoverCorePatterns();

        // Hook into WordPress to register patterns
        add_action('init', [$this, 'registerWithWordPress']);
    }

    /**
     * Get pattern count
     *
     * @return int
     */
    public function count(): int {
        return count($this->patterns);
    }

    /**
     * Check if a pattern is registered
     *
     * @param string $slug
     * @return bool
     */
    public function has(string $slug): bool {
        return isset($this->patterns[$slug]);
    }

    /**
     * Unregister a pattern
     *
     * @param string $slug
     * @return bool
     */
    public function unregister(string $slug): bool {
        if (isset($this->patterns[$slug])) {
            unset($this->patterns[$slug]);

            // Also unregister from WordPress if possible
            if (function_exists('unregister_block_pattern')) {
                unregister_block_pattern($slug);
            }

            return true;
        }

        return false;
    }

    /**
     * Get patterns by category
     *
     * @param string $category
     * @return Pattern[]
     */
    public function getByCategory(string $category): array {
        return array_filter($this->patterns, function(Pattern $pattern) use ($category) {
            return in_array($category, $pattern->getCategories(), true);
        });
    }
}
