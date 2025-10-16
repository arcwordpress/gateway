<?php

namespace Gateway\FieldType;

use Gateway\Field;

class SortableChildrenField extends Field
{
    /**
     * Configure sortable children relationship
     *
     * @param array $config Configuration array with:
     *   - endpoint: API endpoint to fetch children (required)
     *   - updateEndpoint: API endpoint to update positions (defaults to endpoint)
     *   - filterBy: Query parameter to filter by parent (required)
     *   - labelField: Field to display in list (default: 'title')
     *   - positionField: Field to update for ordering (default: 'position')
     *   - idField: Primary key field (default: 'id')
     * @return $this
     */
    public function sortableChildren($config)
    {
        // Validate required fields
        if (empty($config['endpoint'])) {
            throw new \InvalidArgumentException('sortable_children requires an endpoint');
        }

        if (empty($config['filterBy'])) {
            throw new \InvalidArgumentException('sortable_children requires a filterBy parameter');
        }

        // Set defaults
        $defaults = [
            'updateEndpoint' => $config['endpoint'],
            'labelField' => 'title',
            'positionField' => 'position',
            'idField' => 'id',
        ];

        $this->attributes['sortable_children'] = array_merge($defaults, $config);
        return $this;
    }

    /**
     * Get the field type name
     */
    public function getType()
    {
        return 'sortable_children';
    }

    /**
     * Get database column definition
     * Sortable children don't need a database column - they're virtual/computed
     */
    public function getColumnDefinition()
    {
        return null;
    }

    /**
     * Validate field value
     * Sortable children fields are read-only from the parent perspective
     */
    public function validate($value)
    {
        // No validation needed - this field doesn't accept input on the parent
        return [];
    }

    /**
     * Render field as HTML
     * This is primarily for React frontend, so we just return a placeholder
     */
    public function render($value = null)
    {
        $label = $this->getAttribute('label', ucfirst($this->key));
        $config = $this->getAttribute('sortable_children', []);

        $html = '<div class="arc-field arc-sortable-children-field">';
        $html .= '<label>' . esc_html($label) . '</label>';
        $html .= '<div class="sortable-children-placeholder" ';
        $html .= 'data-config="' . esc_attr(json_encode($config)) . '">';
        $html .= '<p class="help-text">This field requires JavaScript to function.</p>';
        $html .= '</div>';
        $html .= '</div>';

        return $html;
    }
}
