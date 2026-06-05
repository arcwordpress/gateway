<?php

namespace Gateway\Docs\Apps;

class DocsApp extends \Gateway\App
{
    protected string $key        = 'docs';
    protected string $label      = 'Gateway Docs';
    protected string $localizeKey = 'gatewayDocsData';

    protected function getBuildDir(): string
    {
        return GATEWAY_PATH . 'react/apps/docs/build/';
    }

    protected function getBuildUrl(): string
    {
        return GATEWAY_URL . 'react/apps/docs/build/';
    }

    protected function localizeData(int $pageId, string $basePath): array
    {
        return [
            'isLoggedIn'    => is_user_logged_in(),
            'canManageDocs' => current_user_can('manage_options'),
            'adminUrl'      => admin_url('admin.php?page=gateway-collections'),
        ];
    }
}
