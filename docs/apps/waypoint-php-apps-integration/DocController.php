<?php

/**
 * Example: mounting a React SPA at /docs using Gateway\Apps\ReactAppController.
 *
 * ReactAppController replaces this boilerplate entirely. Call ::register()
 * once (typically in your plugin's bootstrap) and it handles rewrite rules,
 * query vars, template loading, and asset enqueueing automatically.
 *
 * Client-side React Router then owns all sub-paths:
 *   /docs                  → app root
 *   /docs/user-guide       → handled by the React app
 *   /docs/user-guide/auth  → handled by the React app
 */

use Gateway\Apps\ReactAppController;

ReactAppController::register([
    'basePath'     => 'docs',
    'buildDir'     => WAYPOINT_PATH . 'apps/front/build',
    'buildUrl'     => WAYPOINT_URL  . 'apps/front/build',
    'templateFile' => WAYPOINT_PATH . 'templates/docs.php',
    'localizeKey'  => 'waypointData',
    'localizeData' => fn() => [
        'apiUrl'        => rest_url('gateway/v1'),
        'nonce'         => wp_create_nonce('wp_rest'),
        'isLoggedIn'    => is_user_logged_in(),
        'canManageDocs' => current_user_can('manage_options'),
        'adminUrl'      => admin_url('admin.php?page=gateway-collections'),
    ],
]);
