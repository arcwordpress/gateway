<?php

namespace Gateway\Render;

class Block {
    
    protected $id = null;
    protected $parent = null;
    protected $type = 'container';
    protected $elements = [];
    protected $children = [];
    protected $position = null;

    /**
     * Create a new Block
     *
     * @param int $id Block ID
     * @param string $type Block type (container, loop, conditional, etc.)
     * @param int $parent Parent block ID (0 for top-level)
     * @param int $position Position within same parent
     */
    public function __construct($id, $type = 'container', $parent = 0, $position = 0)
    {
        $this->id = $id;
        $this->parent = $parent;
        $this->type = $type;
        $this->position = $position;
    }

    /**
     * Get block ID
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Get parent block ID
     *
     * @return int
     */
    public function getParent()
    {
        return $this->parent;
    }

    /**
     * Get block type
     *
     * @return string
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * Get position
     *
     * @return int
     */
    public function getPosition()
    {
        return $this->position;
    }

    /**
     * Add an element to this block
     *
     * @param Element $element
     */
    public function addElement(Element $element)
    {
        $this->elements[] = $element;
    }

    /**
     * Get all elements in this block
     *
     * @return array
     */
    public function getElements()
    {
        return $this->elements;
    }

    /**
     * Add a child block
     *
     * @param Block $block
     */
    public function addChildBlock(Block $block)
    {
        $this->children[] = $block;
    }

    /**
     * Get all child blocks
     *
     * @return array
     */
    public function getChildBlocks()
    {
        return $this->children;
    }

    /**
     * Render the block and its contents
     *
     * @return string
     */
    public function render()
    {
        $output = '';

        // Render all elements in this block
        foreach ($this->elements as $element) {
            if ($element instanceof Element) {
                $output .= $element->render();
            }
        }

        // Render all child blocks
        foreach ($this->children as $block) {
            if ($block instanceof Block) {
                $output .= $block->render();
            }
        }

        return $output;
    }

    /**
     * Get debug representation of block
     *
     * @return array
     */
    public function toArray()
    {
        return [
            'id' => $this->id,
            'parent' => $this->parent,
            'type' => $this->type,
            'position' => $this->position,
            'elements_count' => count($this->elements),
            'children_count' => count($this->children),
        ];
    }
}
