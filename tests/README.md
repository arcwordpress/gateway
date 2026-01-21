# Gateway PHPUnit Tests

This directory contains PHPUnit tests for the Gateway plugin.

## Setup

1. Install PHPUnit via Composer:
```bash
composer install --dev
```

2. Run the tests:
```bash
composer test
# or
./vendor/bin/phpunit
```

3. Generate code coverage report:
```bash
composer test:coverage
# Coverage report will be in ./coverage/index.html
```

## Test Structure

- `bootstrap.php` - Test environment setup, mocks WordPress functions
- `Database/` - Tests for database-related functionality
  - `MigrationGeneratorTest.php` - Tests for Builder migration generation

## Writing Tests

Tests should:
- Be placed in the appropriate subdirectory matching the `lib/` structure
- Use descriptive method names starting with `test`
- Follow the Arrange-Act-Assert pattern
- Test both success and failure scenarios

### Example Test

```php
<?php

namespace Gateway\Tests\MyFeature;

use PHPUnit\Framework\TestCase;

class MyFeatureTest extends TestCase
{
    public function testMyFeatureBehavesCorrectly()
    {
        // Arrange: Set up test data
        $input = ['key' => 'value'];

        // Act: Execute the code being tested
        $result = myFeatureFunction($input);

        // Assert: Verify the result
        $this->assertEquals('expected', $result);
    }
}
```

## Current Test Coverage

### MigrationGeneratorTest

Tests the core Builder functionality of generating database migrations from JSON collection data:

- ✅ Generates valid migration code structure
- ✅ Correctly maps field types to database column types
- ✅ Handles required vs optional fields (NOT NULL constraint)
- ✅ Properly sets default values
- ✅ Handles collections with no fields
- ✅ Includes namespace when provided
- ✅ Generates syntactically valid PHP code
- ✅ Handles special characters in field names
- ✅ Throws exception for missing collection key
- ✅ Handles various key formats (underscores, hyphens, mixed)

This test suite covers the fundamental aspect of the Builder: converting user-defined collection schemas into database migration code that can create/update MySQL tables.
