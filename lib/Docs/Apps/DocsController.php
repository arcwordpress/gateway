<?php

namespace Gateway\Docs\Apps;

use Gateway\Apps\ReactAppController;

class DocsController
{
    public static function register(): void
    {
        ReactAppController::register([
            'basePath'     => 'docs',
            'buildDir'     => GATEWAY_PATH . 'react/apps/docs/build',
            'buildUrl'     => GATEWAY_URL  . 'react/apps/docs/build',
            'templateFile' => GATEWAY_PATH . 'templates/docs.php',
            'localizeKey'  => 'gatewayDocsData',
            'localizeData' => function () {
                return [
                    'apiUrl'        => rest_url('gateway/v1'),
                    'nonce'         => wp_create_nonce('wp_rest'),
                    'isLoggedIn'    => is_user_logged_in(),
                    'canManageDocs' => current_user_can('manage_options'),
                    'adminUrl'      => admin_url('admin.php?page=gateway-collections'),
                ];
            },
        ]);
    }
}
