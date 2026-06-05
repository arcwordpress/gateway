<?php

namespace Gateway\Docs;

use Gateway\Docs\Apps\DocsApp;
use Gateway\Docs\Collections\DocSetCollection;
use Gateway\Docs\Collections\DocGroupCollection;
use Gateway\Docs\Collections\DocCollection;
use Gateway\Docs\Migrations\DocSetMigration;
use Gateway\Docs\Migrations\DocGroupMigration;
use Gateway\Docs\Migrations\DocMigration;

class Docs
{
    public static function init(): void
    {
        DocsApp::register();

        add_action('gateway_loaded', function () {
            DocSetCollection::register();
            DocGroupCollection::register();
            DocCollection::register();

            DocSetMigration::register();
            DocGroupMigration::register();
            DocMigration::register();
        });
    }
}
