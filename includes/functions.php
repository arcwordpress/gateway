<?php

function gateway_core_active() {
    return class_exists('\Gateway\Plugin');
}

function gateway_extension_registry() {
    return \Gateway\Extensions\ExtensionRegistry::instance();
}

function gateway_registered_extensions_array() {
    $registry = gateway_extension_registry();
    $extensions = $registry->getAll();

    // Convert to array format (e.g., key, class name)
    $result = [];
    foreach ($extensions as $key => $extension) {
        $result[] = [
            'key' => $key,
            'class' => get_class($extension),
        ];
    }
    return $result;
}