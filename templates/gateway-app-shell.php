<?php
if (!defined('ABSPATH')) {
    exit;
}

/** @var \Gateway\App $app */
$app = $GLOBALS['gateway_active_app'] ?? null;
$mountId = $app ? $app->getMountId() : 'gateway-app';

get_header();
?>

<div id="<?php echo esc_attr($mountId); ?>"></div>

<?php
get_footer();
