<?php

/**
 * Example: mounting a second React SPA at /docs2 — same pattern, different path.
 *
 * Each ::register() call is independent; multiple apps can coexist on the same
 * WordPress install without query-var or handle collisions because both are
 * derived from basePath.
 */

use Gateway\Apps\ReactAppController;

ReactAppController::register([
    'basePath'     => 'docs2',
    'buildDir'     => WAYPOINT_PATH . 'apps/front2/build',
    'buildUrl'     => WAYPOINT_URL  . 'apps/front2/build',
    'templateFile' => WAYPOINT_PATH . 'templates/docs2.php',
    'localizeKey'  => 'waypointData',
    'localizeData' => fn() => [
        'apiUrl'        => rest_url('gateway/v1'),
        'nonce'         => wp_create_nonce('wp_rest'),
        'isLoggedIn'    => is_user_logged_in(),
        'canManageDocs' => current_user_can('manage_options'),
        'adminUrl'      => admin_url('admin.php?page=gateway-collections'),
    ],
]);
