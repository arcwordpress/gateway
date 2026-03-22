<?php

namespace Gateway\Tests\Database;

use PHPUnit\Framework\TestCase;
use Gateway\Database\DatabaseConnection;

/**
 * Tests for the connection-availability guard used by activate() and maybeRunMigrations().
 *
 * Both methods call DatabaseConnection::testConnection() to decide whether to run
 * migrations or defer them. These tests verify that the guard correctly distinguishes
 * between three real-world states:
 *
 *   1. Plugin booted but DB not reachable yet (capsule is null)
 *   2. Capsule configured but TCP connection refused (e.g. wrong port in Local WP)
 *   3. Capsule configured and connection healthy
 *
 * The capsule static property is injected via reflection so no real database is needed.
 */
class ConnectionAvailabilityTest extends TestCase
{
    protected function setUp(): void
    {
        $this->setCapsule(null);
    }

    protected function tearDown(): void
    {
        $this->setCapsule(null);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function setCapsule(?object $capsule): void
    {
        $prop = new \ReflectionProperty(DatabaseConnection::class, 'capsule');
        $prop->setAccessible(true);
        $prop->setValue(null, $capsule);
    }

    /**
     * Build a minimal capsule stub whose connection either succeeds or throws.
     *
     * DatabaseConnection::testConnection() only calls:
     *   $capsule->getConnection()->getPdo()
     * so we only need those two methods on the stubs.
     */
    private function makeCapsuleStub(bool $pdoSucceeds): object
    {
        $connection = $this->getMockBuilder(\stdClass::class)
            ->addMethods(['getPdo'])
            ->getMock();

        if ($pdoSucceeds) {
            $connection->method('getPdo')
                ->willReturn($this->createMock(\PDO::class));
        } else {
            $connection->method('getPdo')
                ->willThrowException(new \Exception('SQLSTATE[HY000]: Connection refused'));
        }

        $capsule = $this->getMockBuilder(\stdClass::class)
            ->addMethods(['getConnection'])
            ->getMock();

        $capsule->method('getConnection')->willReturn($connection);

        return $capsule;
    }

    // -------------------------------------------------------------------------
    // Tests
    // -------------------------------------------------------------------------

    /**
     * No capsule means Eloquent was never booted — e.g. the plugin is loading
     * for the first time and bootEloquent() hasn't run yet.
     */
    public function test_returns_false_when_capsule_is_null(): void
    {
        // capsule is null from setUp()
        $this->assertFalse(DatabaseConnection::testConnection());
    }

    /**
     * Capsule exists but the TCP handshake fails — the typical Local WP scenario
     * where the port is non-standard and the user hasn't configured it yet.
     */
    public function test_returns_false_when_pdo_throws(): void
    {
        $this->setCapsule($this->makeCapsuleStub(pdoSucceeds: false));

        $this->assertFalse(DatabaseConnection::testConnection());
    }

    /**
     * Happy path: capsule exists and PDO connects successfully.
     * This is the state required before migrations are allowed to run.
     */
    public function test_returns_true_when_connection_is_healthy(): void
    {
        $this->setCapsule($this->makeCapsuleStub(pdoSucceeds: true));

        $this->assertTrue(DatabaseConnection::testConnection());
    }

    /**
     * The MySQL connection config must include a short connect timeout so that
     * testConnection() fails fast instead of blocking PHP-FPM workers for ~30 s
     * when the database host is unreachable.
     *
     * If this test fails, someone removed PDO::MYSQL_ATTR_CONNECT_TIMEOUT from
     * boot() and page loads will hang on every request until the worker pool is
     * exhausted.
     */
    public function test_mysql_boot_config_includes_connect_timeout(): void
    {
        $source = file_get_contents(
            (new \ReflectionClass(DatabaseConnection::class))->getFileName()
        );

        $this->assertStringContainsString(
            'MYSQL_ATTR_CONNECT_TIMEOUT',
            $source,
            'PDO::MYSQL_ATTR_CONNECT_TIMEOUT must be set in boot() — without it a ' .
            'unreachable host blocks each PHP-FPM worker for ~30 s'
        );
    }
}
