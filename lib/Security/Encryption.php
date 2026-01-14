<?php

namespace Gateway\Security;

class Encryption
{
    /**
     * Encrypt a value using WordPress authentication salts
     *
     * @param string $value The value to encrypt
     * @return string|false The encrypted value or false on failure
     */
    public static function encrypt($value)
    {
        if (empty($value)) {
            return false;
        }

        $key = self::getEncryptionKey();
        $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length('aes-256-cbc'));

        $encrypted = openssl_encrypt($value, 'aes-256-cbc', $key, 0, $iv);

        if ($encrypted === false) {
            return false;
        }

        // Combine IV and encrypted data for storage
        return base64_encode($iv . '::' . $encrypted);
    }

    /**
     * Decrypt a value using WordPress authentication salts
     *
     * @param string $encrypted The encrypted value
     * @return string|false The decrypted value or false on failure
     */
    public static function decrypt($encrypted)
    {
        if (empty($encrypted)) {
            return false;
        }

        $key = self::getEncryptionKey();
        $decoded = base64_decode($encrypted);

        if ($decoded === false) {
            return false;
        }

        $parts = explode('::', $decoded, 2);

        if (count($parts) !== 2) {
            return false;
        }

        list($iv, $encrypted_data) = $parts;

        $decrypted = openssl_decrypt($encrypted_data, 'aes-256-cbc', $key, 0, $iv);

        return $decrypted !== false ? $decrypted : false;
    }

    /**
     * Generate an encryption key from WordPress authentication salts
     *
     * @return string The encryption key
     */
    private static function getEncryptionKey()
    {
        // Use WordPress authentication salts to generate a consistent encryption key
        // These are defined in wp-config.php and are unique to each installation
        $salt = AUTH_KEY . SECURE_AUTH_KEY . LOGGED_IN_KEY . NONCE_KEY;

        // Generate a 256-bit key from the salts
        return hash('sha256', $salt, true);
    }

    /**
     * Validate if a string is properly encrypted
     *
     * @param string $value The value to validate
     * @return bool True if the value appears to be encrypted
     */
    public static function isEncrypted($value)
    {
        if (empty($value)) {
            return false;
        }

        $decoded = base64_decode($value, true);

        if ($decoded === false) {
            return false;
        }

        return strpos($decoded, '::') !== false;
    }
}
