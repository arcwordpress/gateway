<?php

namespace Gateway;

/**
 * Base controller for Gateway REST API handlers.
 *
 * Each concrete controller declares the single Eloquent model class it manages
 * via the $model property — one controller, one model (e.g. TicketController
 * works with Ticket, CollectionController works with Collection).
 *
 * Response helpers are public so route classes and other callers can reuse them.
 */
abstract class Controller
{
    /**
     * The Eloquent model class this controller works with.
     * Must be overridden in every concrete subclass.
     *
     * @var string|null  e.g. \Gateway\Collection::class
     */
    protected static $model = null;

    /**
     * Return the model class for this controller.
     *
     * @return string|null
     */
    public static function model(): ?string
    {
        return static::$model;
    }

    /**
     * Return a successful REST response.
     *
     * @param  mixed $data
     * @param  int   $status HTTP status code (default 200)
     * @return \WP_REST_Response
     */
    public function respond($data, int $status = 200): \WP_REST_Response
    {
        return new \WP_REST_Response($data, $status);
    }

    /**
     * Return an error REST response.
     *
     * @param  string $message Human-readable error message
     * @param  int    $status  HTTP status code (default 500)
     * @return \WP_REST_Response
     */
    public function error(string $message, int $status = 500): \WP_REST_Response
    {
        return new \WP_REST_Response(['error' => $message], $status);
    }
}
