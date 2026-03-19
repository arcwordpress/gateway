<?php 

namespace Gateway\Render;

class Render {

    /**
     * Initialize rendering system and shortcodes
     */
    public static function init()
    {
        add_shortcode('gateway_render_test', [__CLASS__, 'renderTest']);
        add_action('wp_enqueue_scripts', [__CLASS__, 'enqueueStyles']);
        add_action('wp_enqueue_scripts', [__CLASS__, 'enqueueScripts']);
    }

    /**
     * Enqueue stylesheet for render system
     */
    public static function enqueueStyles()
    {
        // Build CSS from CssClass data on each reload
        CssClass::build();

        $stylePath = dirname(__FILE__) . '/stylesheet/test.css';
        $styleUrl = plugins_url('stylesheet/test.css', __FILE__);
        
        if (file_exists($stylePath)) {
            wp_enqueue_style(
                'gateway-render-test',
                $styleUrl,
                [],
                filemtime($stylePath),
                'all'
            );
        }
    }

    /**
     * Register Interactivity API store script module
     */
    public static function enqueueScripts()
    {
        $storePath = dirname(__FILE__) . '/store/loader.js';
        $storeUrl = plugins_url('store/loader.js', __FILE__);

        if (file_exists($storePath)) {
            wp_register_script_module(
                'gateway-store',
                $storeUrl,
                ['@wordpress/interactivity'],
                filemtime($storePath),
            );
            wp_enqueue_script_module('gateway-store');
        }
    }

    /**
     * Load mock data from JSON files in /data folder
     *
     * @param string $filename elements.json or attributes.json
     * @return array
     */
    public static function loadMockData($filename)
    {
        $dataPath = dirname(__FILE__) . '/data/' . $filename;
        
        if (!file_exists($dataPath)) {
            return [];
        }
        
        $json = file_get_contents($dataPath);
        return json_decode($json, true) ?? [];
    }

    /**
     * Convert flat block rows into a tree of Block objects
     *
     * @param array $blockRows Flat array of block data from database
     * @return array Root-level Block objects
     */
    public static function buildBlockTree($blockRows)
    {
        $blocksById = [];
        $rootBlocks = [];
        $childrenByParent = [];

        // First pass: Create all Block objects
        foreach ($blockRows as $row) {
            $block = new Block(
                $row['id'] ?? null,
                $row['type'] ?? 'container',
                $row['parent'] ?? 0,
                $row['position'] ?? 0
            );

            // Allow simple raw-markup blocks from mock data.
            if (isset($row['markup']) && $row['markup'] !== '') {
                $block->setMarkup($row['markup']);
            }

            $blocksById[$row['id']] = $block;

            // Track children by parent for later sorting
            $parentId = $row['parent'] ?? 0;
            if (!isset($childrenByParent[$parentId])) {
                $childrenByParent[$parentId] = [];
            }
            $childrenByParent[$parentId][] = $row['id'];
        }

        // Second pass: Build hierarchy by assigning child blocks to parents, sorted by position
        foreach ($childrenByParent as $parentId => $childIds) {
            if ($parentId === 0) {
                // Root blocks - sort by position
                usort($childIds, function($idA, $idB) use ($blocksById) {
                    $posA = $blocksById[$idA]->getPosition() ?? 0;
                    $posB = $blocksById[$idB]->getPosition() ?? 0;
                    return $posA <=> $posB;
                });
                foreach ($childIds as $id) {
                    $rootBlocks[] = $blocksById[$id];
                }
            } else {
                // Child blocks - sort by position before adding to parent
                if (isset($blocksById[$parentId])) {
                    usort($childIds, function($idA, $idB) use ($blocksById) {
                        $posA = $blocksById[$idA]->getPosition() ?? 0;
                        $posB = $blocksById[$idB]->getPosition() ?? 0;
                        return $posA <=> $posB;
                    });
                    $parent = $blocksById[$parentId];
                    foreach ($childIds as $id) {
                        $parent->addChildBlock($blocksById[$id]);
                    }
                }
            }
        }

        return $rootBlocks;
    }

    /**
     * Assign elements to blocks based on block_elements mapping
     *
     * @param array $blocksById Map of block ID => Block object
     * @param array $elementRows Element data rows
     * @param array $attributeRows Attribute data rows
     * @param array $blockElementRows Block-element mapping rows
     */
    public static function assignElementsToBlocks(&$blocksById, $elementRows, $attributeRows, $blockElementRows)
    {
        // Build attributes map by element_id
        $attributesByElementId = [];
        foreach ($attributeRows as $attrRow) {
            $elementId = $attrRow['element_id'] ?? null;
            if ($elementId !== null) {
                if (!isset($attributesByElementId[$elementId])) {
                    $attributesByElementId[$elementId] = [];
                }
                $attributesByElementId[$elementId][] = $attrRow;
            }
        }

        // Create elements and map them to blocks
        $elementsById = [];
        foreach ($elementRows as $row) {
            // Build attributes array from normalized data
            $attributes = [];
            if (isset($attributesByElementId[$row['id']])) {
                foreach ($attributesByElementId[$row['id']] as $attrRow) {
                    $attributes[$attrRow['name']] = $attrRow['value'];
                }
            }

            // Initialize children with text content only
            $children = !empty($row['content']) ? [$row['content']] : [];

            $element = new Element(
                $row['tag'] ?? 'div',
                $attributes,
                $children
            );

            $element->_elementId = $row['id'];
            $element->_parentId = $row['parent'] ?? 0;
            $element->_position = $row['position'] ?? 0;
            $elementsById[$row['id']] = $element;
        }

        // Build element hierarchy (parent-child relationships within elements)
        $childrenByParent = [];
        foreach ($elementRows as $row) {
            $parentId = $row['parent'] ?? 0;
            if (!isset($childrenByParent[$parentId])) {
                $childrenByParent[$parentId] = [];
            }
            $childrenByParent[$parentId][] = $row['id'];
        }

        // Sort and assign element children
        foreach ($childrenByParent as $parentId => $childIds) {
            if ($parentId !== 0 && isset($elementsById[$parentId])) {
                usort($childIds, function($idA, $idB) use ($elementsById) {
                    $posA = $elementsById[$idA]->_position ?? 0;
                    $posB = $elementsById[$idB]->_position ?? 0;
                    return $posA <=> $posB;
                });
                $parent = $elementsById[$parentId];
                foreach ($childIds as $id) {
                    $parent->addChild($elementsById[$id]);
                }
            }
        }

        // Assign elements to blocks
        foreach ($blockElementRows as $mapping) {
            $blockId = $mapping['block_id'] ?? null;
            $elementId = $mapping['element_id'] ?? null;

            if ($blockId !== null && $elementId !== null) {
                if (isset($blocksById[$blockId]) && isset($elementsById[$elementId])) {
                    $blocksById[$blockId]->addElement($elementsById[$elementId]);
                }
            }
        }
    }

    /**
     * Inspect the Block tree structure
     *
     * @param array $blocks Root-level blocks
     * @param int $depth Current depth for indentation
     * @return string
     */
    public static function inspectBlockTree($blocks, $depth = 0)
    {
        $output = '';
        $indent = str_repeat('  ', $depth);

        foreach ($blocks as $block) {
            if ($block instanceof Block) {
                $output .= $indent . '- Block ' . $block->getId() . ' (' . $block->getType() . ')';
                if ($block->getPosition() !== null) {
                    $output .= ' [pos: ' . $block->getPosition() . ']';
                }
                if ($block->getMarkup() !== null && $block->getMarkup() !== '') {
                    $output .= ' [markup: yes]';
                } else {
                    $output .= ' [markup: no]';
                }
                $output .= "\n";

                // Show elements in this block
                $elements = $block->getElements();
                if (!empty($elements)) {
                    $output .= $indent . '  Elements:\n';
                    foreach ($elements as $element) {
                        if ($element instanceof Element) {
                            $output .= $indent . '    - ' . $element->getTag();
                            if ($element->_elementId) {
                                $output .= ' (id: ' . $element->_elementId . ')';
                            }
                            $output .= "\n";
                        }
                    }
                }

                // Show child blocks
                $childBlocks = $block->getChildBlocks();
                if (!empty($childBlocks)) {
                    $output .= self::inspectBlockTree($childBlocks, $depth + 1);
                }
            }
        }

        return $output;
    }

    /**
     * Test render method for experimentation
     *
     * @param array $atts Shortcode attributes
     * @return string
     */
    public static function renderTest($atts)
    {
        $atts = shortcode_atts([
            'class' => '',
            'id' => '',
            'debug' => '',
        ], $atts);

        // Load normalized data from mock JSON files
        $blockRows = self::loadMockData('blocks.json');
        $elementRows = self::loadMockData('elements.json');
        $attributeRows = self::loadMockData('attributes.json');
        $blockElementRows = self::loadMockData('block_elements.json');

        // Build block tree
        $blockTree = self::buildBlockTree($blockRows);

        // Create a map of all blocks for element assignment
        $blocksById = [];
        $allBlocks = [];
        
        function flattenBlocks($blocks, &$map, &$all) {
            foreach ($blocks as $block) {
                $map[$block->getId()] = $block;
                $all[] = $block;
                $childBlocks = $block->getChildBlocks();
                if (!empty($childBlocks)) {
                    flattenBlocks($childBlocks, $map, $all);
                }
            }
        }
        
        flattenBlocks($blockTree, $blocksById, $allBlocks);

        // Assign elements to blocks
        self::assignElementsToBlocks($blocksById, $elementRows, $attributeRows, $blockElementRows);

        // Debug output if requested
        if ($atts['debug']) {
            $debug = '<pre style="background: #f5f5f5; padding: 10px; margin-bottom: 20px;">';
            $debug .= '<strong>Block Tree Structure:</strong>' . "\n";
            $debug .= self::inspectBlockTree($blockTree);
            $debug .= '</pre>';
        } else {
            $debug = '';
        }

        // Render all blocks - ONLY render blocks, never wrap rendered output
        $output = '';
        foreach ($blockTree as $block) {
            $output .= $block->render();
        }

        // Output interactivity state for gateway store
        wp_interactivity_state('gateway/forest', [
            'apiRoute' => rest_url('gateway/v1/records'),
            'records'  => [],
            'isLoading' => false,
            'error'    => null,
        ]);

        return $debug . $output;
    }

    /**
     * Core render method for Blocks and Elements
     *
     * @param array $items Array of Block or Element objects to render
     * @return string
     */
    public static function render($items = [])
    {
        $output = '';

        foreach ($items as $item) {
            if ($item instanceof Block) {
                $output .= $item->render();
            } elseif ($item instanceof Element) {
                $output .= $item->render();
            }
        }

        return $output;
    }

}