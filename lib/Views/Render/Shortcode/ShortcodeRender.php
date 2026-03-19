<?php

namespace Gateway\Views\Render\Shortcode;

class ShortcodeRender extends \Gateway\Views\Render\Strategy
{
    public function getType(): string
    {
        return 'shortcode';
    }

    public function render(\Gateway\View $view, array $context = []): string
    {
        try {
            $collection = $view->getCollection();
            if (!$collection) {
                return '<p>No collection configured for view</p>';
            }

            $columns = $view->getColumns();
            if (empty($columns)) {
                return '<p>No columns configured for view</p>';
            }

            // Fetch records from collection via Eloquent query builder.
            $records = $collection->query()->get();

            return $this->buildTable($columns, $records);
        } catch (\Exception $e) {
            return '<p>Error rendering view: ' . esc_html($e->getMessage()) . '</p>';
        }
    }

    private function buildTable(array $columns, $records): string
    {
        $html = '<table class="gateway-view-table" style="border-collapse: collapse; width: 100%;">';
        
        // Header
        $html .= '<thead>';
        $html .= '<tr style="background: #f5f5f5;">';
        foreach ($columns as $col) {
            $html .= '<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">' . esc_html($col) . '</th>';
        }
        $html .= '</tr>';
        $html .= '</thead>';
        
        // Body
        $html .= '<tbody>';
        if (is_iterable($records)) {
            foreach ($records as $record) {
                $html .= '<tr>';
                foreach ($columns as $col) {
                    $value = $this->extractValue($record, $col);
                    $html .= '<td style="border: 1px solid #ddd; padding: 8px;">' . esc_html($value) . '</td>';
                }
                $html .= '</tr>';
            }
        }
        $html .= '</tbody>';
        
        $html .= '</table>';
        
        return $html;
    }

    private function extractValue($record, string $column)
    {
        if (is_array($record)) {
            return $record[$column] ?? '';
        }

        if ($record instanceof \ArrayAccess && isset($record[$column])) {
            return $record[$column];
        }

        if (is_object($record) && isset($record->{$column})) {
            return $record->{$column};
        }

        if (is_object($record) && method_exists($record, 'getAttribute')) {
            return $record->getAttribute($column);
        }

        return '';
    }
}
