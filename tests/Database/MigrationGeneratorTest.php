<?php

namespace Gateway\Tests\Database;

use PHPUnit\Framework\TestCase;
use Gateway\Database\MigrationGenerator;

/**
 * Test MigrationGenerator functionality
 *
 * Tests the core Builder functionality of generating database migrations
 * from collection JSON data.
 */
class MigrationGeneratorTest extends TestCase
{
    /**
     * Test that generateFromData creates valid migration code
     */
    public function testGenerateFromDataCreatesValidMigration()
    {
        // Arrange: Create a simple collection with basic fields
        $collectionData = [
            'key' => 'test_products',
            'title' => 'Products',
            'fields' => [
                [
                    'name' => 'title',
                    'type' => 'text',
                    'required' => true,
                ],
                [
                    'name' => 'description',
                    'type' => 'textarea',
                    'required' => false,
                ],
                [
                    'name' => 'price',
                    'type' => 'number',
                    'required' => true,
                ],
            ],
        ];

        // Act: Generate migration code
        $result = MigrationGenerator::generateFromData($collectionData, 'TestPlugin');

        // Assert: Check the result structure
        $this->assertIsArray($result);
        $this->assertArrayHasKey('code', $result);
        $this->assertArrayHasKey('className', $result);
        $this->assertArrayHasKey('tableName', $result);
        $this->assertArrayHasKey('notes', $result);

        // Assert: Check the generated class name
        $this->assertEquals('TestProductsMigration', $result['className']);

        // Assert: Check the table name
        $this->assertEquals('test_products', $result['tableName']);

        // Assert: Verify the code contains essential elements
        $code = $result['code'];
        $this->assertStringContainsString('namespace TestPlugin\\Database;', $code);
        $this->assertStringContainsString('class TestProductsMigration', $code);
        $this->assertStringContainsString('public static function create()', $code);
        $this->assertStringContainsString('dbDelta(', $code);

        // Assert: Verify all fields are in the migration
        $this->assertStringContainsString('title VARCHAR(255) NOT NULL', $code);
        $this->assertStringContainsString('description TEXT NULL', $code);
        $this->assertStringContainsString('price BIGINT NOT NULL', $code);

        // Assert: Verify standard columns are present
        $this->assertStringContainsString('id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY', $code);
        $this->assertStringContainsString('created_at TIMESTAMP', $code);
        $this->assertStringContainsString('updated_at TIMESTAMP', $code);
    }

    /**
     * Test that field types are correctly mapped to database types
     */
    public function testFieldTypeMappingIsCorrect()
    {
        $collectionData = [
            'key' => 'field_test',
            'title' => 'Field Types Test',
            'fields' => [
                ['name' => 'text_field', 'type' => 'text'],
                ['name' => 'email_field', 'type' => 'email'],
                ['name' => 'url_field', 'type' => 'url'],
                ['name' => 'number_field', 'type' => 'number'],
                ['name' => 'date_field', 'type' => 'date'],
                ['name' => 'checkbox_field', 'type' => 'checkbox'],
                ['name' => 'textarea_field', 'type' => 'textarea'],
            ],
        ];

        $result = MigrationGenerator::generateFromData($collectionData);
        $code = $result['code'];

        // Verify correct SQL types
        $this->assertStringContainsString('text_field VARCHAR(255)', $code);
        $this->assertStringContainsString('email_field VARCHAR(255)', $code);
        $this->assertStringContainsString('url_field VARCHAR(512)', $code);
        $this->assertStringContainsString('number_field BIGINT', $code);
        $this->assertStringContainsString('date_field DATE', $code);
        $this->assertStringContainsString('checkbox_field TINYINT(1)', $code);
        $this->assertStringContainsString('textarea_field TEXT', $code);
    }

    /**
     * Test that required fields have NOT NULL constraint
     */
    public function testRequiredFieldsHaveNotNullConstraint()
    {
        $collectionData = [
            'key' => 'nullable_test',
            'title' => 'Nullable Test',
            'fields' => [
                ['name' => 'required_field', 'type' => 'text', 'required' => true],
                ['name' => 'optional_field', 'type' => 'text', 'required' => false],
                ['name' => 'default_nullable', 'type' => 'text'], // No required key = nullable
            ],
        ];

        $result = MigrationGenerator::generateFromData($collectionData);
        $code = $result['code'];

        $this->assertStringContainsString('required_field VARCHAR(255) NOT NULL', $code);
        $this->assertStringContainsString('optional_field VARCHAR(255) NULL', $code);
        $this->assertStringContainsString('default_nullable VARCHAR(255) NULL', $code);
    }

    /**
     * Test that default values are properly handled
     */
    public function testDefaultValuesAreProperlySet()
    {
        $collectionData = [
            'key' => 'defaults_test',
            'title' => 'Defaults Test',
            'fields' => [
                ['name' => 'status', 'type' => 'text', 'default' => 'active'],
                ['name' => 'count', 'type' => 'number', 'default' => 0],
                ['name' => 'enabled', 'type' => 'checkbox', 'default' => true],
            ],
        ];

        $result = MigrationGenerator::generateFromData($collectionData);
        $code = $result['code'];

        $this->assertStringContainsString("status VARCHAR(255) NULL DEFAULT 'active'", $code);
        $this->assertStringContainsString('count BIGINT NULL DEFAULT 0', $code);
        $this->assertStringContainsString('enabled TINYINT(1) NULL DEFAULT 1', $code);
    }

    /**
     * Test that collection with no fields generates valid empty migration
     */
    public function testEmptyFieldsGeneratesValidMigration()
    {
        $collectionData = [
            'key' => 'empty_collection',
            'title' => 'Empty Collection',
            'fields' => [],
        ];

        $result = MigrationGenerator::generateFromData($collectionData);
        $code = $result['code'];

        // Should still have id and timestamps
        $this->assertStringContainsString('id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY', $code);
        $this->assertStringContainsString('created_at TIMESTAMP', $code);
        $this->assertStringContainsString('updated_at TIMESTAMP', $code);
        $this->assertStringContainsString('class EmptyCollectionMigration', $code);
    }

    /**
     * Test that namespace is correctly included when provided
     */
    public function testNamespaceIsIncludedWhenProvided()
    {
        $collectionData = [
            'key' => 'namespaced_test',
            'title' => 'Namespaced Test',
            'fields' => [],
        ];

        // Test with namespace
        $result = MigrationGenerator::generateFromData($collectionData, 'MyExtension');
        $this->assertStringContainsString('namespace MyExtension\\Database;', $result['code']);

        // Test without namespace
        $result = MigrationGenerator::generateFromData($collectionData, null);
        $this->assertStringNotContainsString('namespace', $result['code']);
    }

    /**
     * Test that migration code is syntactically valid PHP
     */
    public function testGeneratedCodeIsSyntacticallyValid()
    {
        $collectionData = [
            'key' => 'syntax_test',
            'title' => 'Syntax Test',
            'fields' => [
                ['name' => 'title', 'type' => 'text', 'required' => true],
            ],
        ];

        $result = MigrationGenerator::generateFromData($collectionData, 'TestPlugin');
        $code = $result['code'];

        // Write to temporary file and check syntax
        $tempFile = sys_get_temp_dir() . '/migration_test_' . uniqid() . '.php';
        file_put_contents($tempFile, $code);

        $output = [];
        $returnVar = 0;
        exec("php -l " . escapeshellarg($tempFile) . " 2>&1", $output, $returnVar);

        unlink($tempFile);

        $this->assertEquals(0, $returnVar, "Generated code has syntax errors:\n" . implode("\n", $output));
    }

    /**
     * Test that special characters in field names are handled safely
     */
    public function testSpecialCharactersInFieldNamesAreHandled()
    {
        $collectionData = [
            'key' => 'special_chars',
            'title' => 'Special Characters',
            'fields' => [
                ['name' => 'user_email', 'type' => 'email'],
                ['name' => 'is_active', 'type' => 'checkbox'],
                ['name' => 'created_by_user', 'type' => 'number'],
            ],
        ];

        $result = MigrationGenerator::generateFromData($collectionData);
        $code = $result['code'];

        // Underscores should be preserved in field names
        $this->assertStringContainsString('user_email', $code);
        $this->assertStringContainsString('is_active', $code);
        $this->assertStringContainsString('created_by_user', $code);
    }

    /**
     * Test that exception is thrown when collection key is missing
     */
    public function testExceptionThrownWhenCollectionKeyMissing()
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Collection key is required');

        $collectionData = [
            'title' => 'No Key Collection',
            'fields' => [],
        ];

        MigrationGenerator::generateFromData($collectionData);
    }

    /**
     * Test that class name conversion handles various key formats
     */
    public function testClassNameConversionHandlesVariousFormats()
    {
        $testCases = [
            'simple' => 'SimpleMigration',
            'with_underscores' => 'WithUnderscoresMigration',
            'with-hyphens' => 'WithHyphensMigration',
            'mixed_format-test' => 'MixedFormatTestMigration',
        ];

        foreach ($testCases as $key => $expectedClassName) {
            $collectionData = [
                'key' => $key,
                'title' => 'Test',
                'fields' => [],
            ];

            $result = MigrationGenerator::generateFromData($collectionData);

            $this->assertEquals(
                $expectedClassName,
                $result['className'],
                "Key '{$key}' should generate class name '{$expectedClassName}'"
            );
        }
    }
}
