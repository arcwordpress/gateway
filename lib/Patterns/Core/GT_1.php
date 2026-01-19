<?php

namespace Gateway\Patterns\Core;

use Gateway\Patterns\Pattern;

/**
 * GT-1 Pattern: Data Source with Loop, Text, and Button
 *
 * A foundational pattern that demonstrates the core Gateway dynamic blocks:
 * - Parent Data Source block for fetching collection data
 * - Child Data Loop block for iterating over records
 * - Dynamic String blocks for displaying text fields
 * - Click Control block for interactive buttons
 */
class GT_1 extends Pattern {
    /**
     * @inheritDoc
     */
    public function getSlug(): string {
        return 'gateway/gt-1';
    }

    /**
     * @inheritDoc
     */
    public function getTitle(): string {
        return 'GT-1: Dynamic Data List with Actions';
    }

    /**
     * @inheritDoc
     */
    public function getDescription(): string {
        return 'Displays a list of items from a Gateway collection with title, description, and action button. Features data source, loop, dynamic text, and interactive controls.';
    }

    /**
     * @inheritDoc
     */
    public function getCategories(): array {
        return ['gateway', 'data', 'list'];
    }

    /**
     * @inheritDoc
     */
    public function getKeywords(): array {
        return ['data', 'loop', 'list', 'dynamic', 'collection', 'button', 'action'];
    }

    /**
     * @inheritDoc
     */
    public function getBlockTypes(): ?array {
        return ['gateway/data-source'];
    }

    /**
     * @inheritDoc
     */
    public function getContent(): string {
        // GT Dynamic String for title
        $titleBlock = $this->buildBlock('gateway/dynamic-string', [
            'propertyPath' => 'title',
            'fallbackText' => 'Item Title',
            'style' => [
                'typography' => [
                    'fontSize' => '1.5rem',
                    'fontWeight' => '600'
                ]
            ]
        ]);

        // GT Dynamic String for description/content
        $descriptionBlock = $this->buildBlock('gateway/dynamic-string', [
            'propertyPath' => 'description',
            'fallbackText' => 'Item description will appear here.',
            'style' => [
                'spacing' => [
                    'margin' => [
                        'top' => '0.5rem',
                        'bottom' => '1rem'
                    ]
                ]
            ]
        ]);

        // GT Dynamic String for slug or ID (smaller text)
        $slugBlock = $this->buildBlock('gateway/dynamic-string', [
            'propertyPath' => 'slug',
            'fallbackText' => 'item-slug',
            'style' => [
                'typography' => [
                    'fontSize' => '0.875rem'
                ],
                'color' => [
                    'text' => '#666666'
                ]
            ]
        ]);

        // GT Click Control button
        $buttonBlock = $this->buildBlock('gateway/click-control', [
            'text' => 'View Details',
            'elementType' => 'button',
            'namespace' => 'gateway/data-source',
            'action' => 'actions.handleItemClick',
            'style' => [
                'spacing' => [
                    'padding' => [
                        'top' => '0.5rem',
                        'right' => '1rem',
                        'bottom' => '0.5rem',
                        'left' => '1rem'
                    ]
                ],
                'color' => [
                    'background' => '#0073aa',
                    'text' => '#ffffff'
                ],
                'border' => [
                    'radius' => '4px'
                ]
            ]
        ]);

        // Wrap item content in a group for styling
        $itemContent = $this->wrapInGroup(
            $titleBlock . "\n\n" .
            $slugBlock . "\n\n" .
            $descriptionBlock . "\n\n" .
            $buttonBlock,
            [
                'style' => [
                    'spacing' => [
                        'padding' => [
                            'top' => '1.5rem',
                            'right' => '1.5rem',
                            'bottom' => '1.5rem',
                            'left' => '1.5rem'
                        ],
                        'margin' => [
                            'bottom' => '1rem'
                        ]
                    ],
                    'border' => [
                        'width' => '1px',
                        'style' => 'solid',
                        'color' => '#e0e0e0',
                        'radius' => '8px'
                    ]
                ],
                'backgroundColor' => '#ffffff'
            ]
        );

        // GT Data Loop block
        $loopBlock = $this->buildBlock('gateway/data-loop', [
            'contextNamespace' => 'gateway/data-source',
            'arrayProperty' => 'filteredRecords',
            'itemName' => 'item'
        ], $itemContent);

        // Loading state message
        $loadingBlock = $this->buildBlock('core/paragraph', [
            'content' => 'Loading data...',
            'placeholder' => 'Loading message'
        ]);

        // Error state message
        $errorBlock = $this->buildBlock('core/paragraph', [
            'content' => 'No items found or error loading data.',
            'placeholder' => 'Error message',
            'style' => [
                'color' => [
                    'text' => '#cc0000'
                ]
            ]
        ]);

        // Container for loop and states
        $loopContainer = $this->wrapInGroup(
            $loadingBlock . "\n\n" .
            $errorBlock . "\n\n" .
            $loopBlock,
            [
                'style' => [
                    'spacing' => [
                        'padding' => [
                            'top' => '2rem',
                            'bottom' => '2rem'
                        ]
                    ]
                ]
            ]
        );

        // Header with title
        $headerBlock = $this->buildBlock('core/heading', [
            'content' => 'Dynamic Data List',
            'level' => 2
        ]);

        // Optional search input (can be styled/customized)
        $searchBlock = $this->buildBlock('core/paragraph', [
            'content' => '<!-- Add search control here if needed -->',
            'placeholder' => 'Search control'
        ]);

        // GT Data Source block (parent)
        $dataSourceContent =
            $headerBlock . "\n\n" .
            $searchBlock . "\n\n" .
            $loopContainer;

        $dataSourceBlock = $this->buildBlock('gateway/data-source', [
            'collectionSlug' => 'your-collection-slug',
            'namespace' => 'gateway/data-source',
            'query' => [
                'limit' => 10
            ]
        ], $dataSourceContent);

        // Wrap everything in a container group
        return $this->wrapInGroup($dataSourceBlock, [
            'align' => 'wide',
            'style' => [
                'spacing' => [
                    'padding' => [
                        'top' => '2rem',
                        'right' => '2rem',
                        'bottom' => '2rem',
                        'left' => '2rem'
                    ]
                ]
            ]
        ]);
    }
}
