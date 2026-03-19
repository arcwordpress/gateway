<?php

namespace Gateway\Render;

class CssClass {
    
    protected $id = null;
    protected $name = '';
    protected $content = '';

    /**
     * Create a new CssClass
     *
     * @param string $name CSS class name
     * @param string $content Full CSS class content (will be broken into rules later)
     * @param int|null $id CSS class ID
     */
    public function __construct($name, $content, $id = null)
    {
        $this->id = $id;
        $this->name = $name;
        $this->content = $content;
    }

    /**
     * Get CSS class ID
     *
     * @return int|null
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Get CSS class name
     *
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * Get CSS class content (full class definition)
     *
     * @return string
     */
    public function getContent()
    {
        return $this->content;
    }

    /**
     * Set CSS class content
     *
     * @param string $content
     */
    public function setContent($content)
    {
        $this->content = $content;
    }

    /**
     * Convert to array for database insertion
     *
     * @return array
     */
    public function toArray()
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'content' => $this->content,
        ];
    }

    /**
     * Build CSS file from mock data
     * Reads cssclasses.json and generates stylesheet/test.css
     *
     * @return bool True if build successful
     */
    public static function build()
    {
        $cssClassesPath = dirname(__FILE__) . '/data/cssclasses.json';
        $outputPath = dirname(__FILE__) . '/stylesheet/test.css';

        if (!file_exists($cssClassesPath)) {
            error_log('CssClass::build() - No cssclasses.json found at: ' . $cssClassesPath);
            return false;
        }

        $json = file_get_contents($cssClassesPath);
        $classesData = json_decode($json, true);

        if (!is_array($classesData)) {
            error_log('CssClass::build() - Invalid JSON in cssclasses.json');
            return false;
        }

        // Build CSS content from classes
        $cssContent = "/* Generated CSS - built at " . date('Y-m-d H:i:s') . " */\n\n";

        foreach ($classesData as $classData) {
            if (!isset($classData['name'], $classData['content'])) {
                continue;
            }

            $cssClass = new self(
                $classData['name'],
                $classData['content'],
                $classData['id'] ?? null
            );

            $cssContent .= $cssClass->render();
        }

        // Ensure directory exists
        $outputDir = dirname($outputPath);
        if (!is_dir($outputDir)) {
            mkdir($outputDir, 0755, true);
        }

        // Write the CSS file
        if (file_put_contents($outputPath, $cssContent) === false) {
            error_log('CssClass::build() - Failed to write CSS file to: ' . $outputPath);
            return false;
        }

        return true;
    }

    /**
     * Render the CSS class to string format
     * Currently outputs the full content as-is (will be extended later for rules)
     *
     * @return string
     */
    public function render()
    {
        return "." . $this->name . " {\n" . $this->content . "\n}\n\n";
    }
}
