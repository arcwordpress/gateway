<?php

namespace Gateway\Render;

/**
 * TableDemo - Demonstrates rendering a 3-column table using CssClass approach
 */
class TableDemo {

    /**
     * Sample data for the table
     */
    protected static $tableData = [
        [
            'name' => 'Product A',
            'price' => '$29.99',
            'status' => 'Active'
        ],
        [
            'name' => 'Product B',
            'price' => '$49.99',
            'status' => 'Inactive'
        ],
        [
            'name' => 'Product C',
            'price' => '$89.99',
            'status' => 'Active'
        ],
        [
            'name' => 'Product D',
            'price' => '$39.99',
            'status' => 'Active'
        ]
    ];

    /**
     * Render a simple 3-column table with styling from CssClass
     *
     * @param array $data Table rows
     * @param array $columns Column keys to display
     * @return string HTML table
     */
    public static function renderTable($data = null, $columns = ['name', 'price', 'status'])
    {
        $data = $data ?? self::$tableData;

        $html = '<table class="data-table">' . "\n";

        // Header row
        $html .= '  <thead>' . "\n";
        $html .= '    <tr>' . "\n";
        foreach ($columns as $col) {
            $html .= '      <th class="data-table-header">' . ucfirst($col) . '</th>' . "\n";
        }
        $html .= '    </tr>' . "\n";
        $html .= '  </thead>' . "\n";

        // Body rows
        $html .= '  <tbody>' . "\n";
        foreach ($data as $index => $row) {
            $rowClass = ($index % 2 === 0) ? 'data-table-row-alt' : '';
            $html .= '    <tr' . ($rowClass ? ' class="' . $rowClass . '"' : '') . '>' . "\n";

            foreach ($columns as $col) {
                $value = $row[$col] ?? '—';
                $html .= '      <td class="data-table-cell">' . htmlspecialchars($value) . '</td>' . "\n";
            }

            $html .= '    </tr>' . "\n";
        }
        $html .= '  </tbody>' . "\n";

        $html .= '</table>' . "\n";

        return $html;
    }

    /**
     * Get table data as HTML element structure
     *
     * @return Element
     */
    public static function renderTableAsElement()
    {
        $headerCells = [];
        foreach (['name', 'price', 'status'] as $col) {
            $headerCells[] = new Element('th', ['class' => 'data-table-header'], [ucfirst($col)]);
        }
        $headerRow = new Element('tr', [], $headerCells);
        $thead = new Element('thead', [], [$headerRow]);

        $bodyRows = [];
        foreach (self::$tableData as $index => $row) {
            $cells = [];
            foreach (['name', 'price', 'status'] as $col) {
                $value = $row[$col] ?? '—';
                $cells[] = new Element('td', ['class' => 'data-table-cell'], [$value]);
            }
            $rowClass = ($index % 2 === 0) ? 'data-table-row-alt' : '';
            $bodyRows[] = new Element('tr', $rowClass ? ['class' => $rowClass] : [], $cells);
        }
        $tbody = new Element('tbody', [], $bodyRows);

        return new Element('table', ['class' => 'data-table'], [$thead, $tbody]);
    }
}
