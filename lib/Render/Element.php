<?php

namespace Gateway\Render;

class Element {
    
    protected $tag = 'div';
    protected $attributes = [];
    protected $children = [];
    
    // Self-closing (void) tags that don't have closing tags
    protected static $voidTags = [
        'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
        'link', 'meta', 'param', 'source', 'track', 'wbr'
    ];
    
    // Public properties for metadata (used for tree inspection)
    public $_elementId = null;
    public $_parentId = null;
    public $_position = null;

    /**
     * Create a new Element
     *
     * @param string $tag HTML tag name
     * @param array $attributes HTML attributes
     * @param array $children Child elements or strings
     */
    public function __construct($tag = 'div', $attributes = [], $children = [])
    {
        $this->tag = $tag;
        $this->attributes = $attributes;
        $this->children = $children;
    }

    /**
     * Check if tag is self-closing (void element)
     *
     * @return bool
     */
    protected function isVoidTag()
    {
        return in_array(strtolower($this->tag), self::$voidTags, true);
    }

    /**
     * Add a child element or string
     *
     * @param Element|string $child
     */
    public function addChild($child)
    {
        $this->children[] = $child;
    }

    /**
     * Get all children
     *
     * @return array
     */
    public function getChildren()
    {
        return $this->children;
    }

    /**
     * Get the tag name
     *
     * @return string
     */
    public function getTag()
    {
        return $this->tag;
    }

    /**
     * Render the element as HTML
     *
     * @return string
     */
    public function render()
    {
        $output = '<' . esc_html($this->tag);
        
        // Add attributes
        foreach ($this->attributes as $key => $value) {
            if ($value !== null && $value !== false) {
                if ($value === true) {
                    $output .= ' ' . esc_html($key);
                } else {
                    $output .= ' ' . esc_html($key) . '="' . esc_attr($value) . '"';
                }
            }
        }
        
        // Self-closing tags render without closing tag
        if ($this->isVoidTag()) {
            $output .= ' />';
            return $output;
        }
        
        $output .= '>';
        
        // Render children
        foreach ($this->children as $child) {
            if ($child instanceof Element) {
                $output .= $child->render();
            } elseif ($child !== null) {
                $output .= wp_kses_post($child);
            }
        }
        
        $output .= '</' . esc_html($this->tag) . '>';
        
        return $output;
    }
}
