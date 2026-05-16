<?php

namespace Gateway\Blocks;

use Gateway\Collections\Gateway\BlockTypeUser;

if (!defined('ABSPATH')) {
    exit;
}

class BlockSeeder
{
    public static function seedAll(): void
    {
        $gutenbergDir = GATEWAY_PATH . 'react/block-types/build/blocks';
        if (is_dir($gutenbergDir)) {
            foreach (glob($gutenbergDir . '/*/block.json') ?: [] as $jsonPath) {
                $meta = json_decode(file_get_contents($jsonPath), true);
                if (!empty($meta['name'])) {
                    BlockTypeUser::seedOne(
                        $meta['name'],
                        $meta['title'] ?? $meta['name'],
                        'gutenberg'
                    );
                }
            }
        }

        foreach (BlockRegistry::instance()->getAll() as $block) {
            BlockTypeUser::seedOne(
                $block::getName(),
                $block::getTitle(),
                'php'
            );
        }

        foreach (JsonBlock\JsonBlockLoader::getAll() as $definition) {
            if (!empty($definition['name'])) {
                BlockTypeUser::seedOne(
                    $definition['name'],
                    $definition['title'] ?? $definition['name'],
                    'json'
                );
            }
        }
    }
}
