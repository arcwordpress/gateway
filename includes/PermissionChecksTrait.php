<?php

namespace Gateway;

trait PermissionChecksTrait
{
    public function checkProtectedPermission()
    {
        error_log('AUTH HEADER: ' . ($_SERVER['HTTP_AUTHORIZATION'] ?? 'none'));
        error_log('PHP_AUTH_USER: ' . ($_SERVER['PHP_AUTH_USER'] ?? 'none'));

        // Manually parse Basic Auth credentials
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null;
        $user = null;
        $pass = null;

        if ($header && stripos($header, 'basic ') === 0) {
            $encoded = substr($header, 6);
            $decoded = base64_decode($encoded);
            if ($decoded && strpos($decoded, ':') !== false) {
                list($user, $pass) = explode(':', $decoded, 2);
            }
        } elseif (isset($_SERVER['PHP_AUTH_USER'], $_SERVER['PHP_AUTH_PW'])) {
            $user = $_SERVER['PHP_AUTH_USER'];
            $pass = $_SERVER['PHP_AUTH_PW'];
        }

        // Use the official WP function for application password authentication
        if ($user && $pass) {
            $result = wp_authenticate_application_password(null, $user, $pass);
            error_log('WP_AUTH_APP_PASS result: ' . print_r($result, true));
            if ($result && !is_wp_error($result)) {
                return true;
            }
        }

        return new \WP_Error(
            'rest_auth_invalid',
            '[Auth] Manual Basic Auth failed. Provide valid Application Password credentials.',
            ['status' => 403]
        );
    }
}