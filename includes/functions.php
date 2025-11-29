<?php

function gateway_core_active() {
    return class_exists('\Gateway\Plugin');
}