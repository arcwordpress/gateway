<?php

namespace Gateway\Collections;

use Gateway\Collections\Gateway\CollectionUser;

if (!defined('ABSPATH')) {
    exit;
}

class CoreCollections
{
    public static function getMap(): array
    {
        return [
            'wp_post'               => WP\Post::class,
            'wp_postmeta'           => WP\PostMeta::class,
            'wp_user'               => WP\User::class,
            'wp_usermeta'           => WP\UserMeta::class,
            'wp_comment'            => WP\Comment::class,
            'wp_commentmeta'        => WP\CommentMeta::class,
            'wp_term'               => WP\Term::class,
            'wp_termmeta'           => WP\TermMeta::class,
            'wp_term_taxonomy'      => WP\TermTaxonomy::class,
            'wp_term_relationship'  => WP\TermRelationship::class,
            'wp_option'             => WP\Option::class,
            'wp_link'               => WP\Link::class,
        ];
    }

    public static function register(): void
    {
        foreach (self::getMap() as $key => $class) {
            if (CollectionUser::isActive($key)) {
                $class::register();
            }
        }
    }

    public static function seed(): void
    {
        foreach (array_keys(self::getMap()) as $key) {
            CollectionUser::seedOne($key);
        }
    }
}
