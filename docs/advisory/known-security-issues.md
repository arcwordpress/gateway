# Known Security Issues

Gateway plugin — prioritized advisory list. Last updated: 2026-03-26 (v1.2.1-rc5).

---

## Critical

### 1. Path Traversal / Arbitrary File Write in ExtensionCrudRoutes
**File:** `lib/Raptor/Endpoints/ExtensionCrudRoutes.php` (lines 117, 138, 262–272)

`extension_key` and `collection_key` from URL/body parameters are concatenated directly into file system paths with no traversal validation. An authenticated admin can write JSON or PHP files outside the intended `/wp-content/gateway/extensions/` boundary using sequences like `../../../`.

**Remediation:** Validate both keys against a strict allowlist (alphanumeric, hyphens, underscores). Use `realpath()` after path construction and assert the result is within the expected base directory before any read/write.

---

### 2. Arbitrary PHP Code Generation via Unsanitized Field Keys
**File:** `lib/Collections/FileFromData.php` (lines 86–87, 153, 189)

`generateCollectionClass()` writes PHP class files where array keys originate from user-supplied field definitions. The `arrayToPhp()` helper interpolates keys directly into PHP source (`"'{$key}' => {$phpValue},"`) without context-appropriate escaping. A crafted field key could embed executable PHP into the generated file.

**Remediation:** Sanitize all field keys to alphanumeric + underscore before use in code generation. Reject or strip any characters that have meaning in PHP string/array contexts.

---

### 3. Unparameterized SQL in TestConnectionRoute
**File:** `lib/Endpoints/TestConnectionRoute.php` (line 61)

The MySQL branch uses direct string concatenation into an SQL statement:
```php
$connection->select("SHOW TABLES LIKE '" . $wpdb->prefix . "%'");
```
While `$wpdb->prefix` is generally static, the pattern is inconsistent with the SQLite branch on line 56 (which uses parameterized queries) and with WordPress coding standards. Future refactors could introduce injectable values following the same pattern.

**Remediation:** Use `$wpdb->prepare()` or the `$wpdb->esc_like()` helper consistently across both branches.

---

## High

### 4. Unsanitized `sqlite_path` Stored as Plugin Setting
**File:** `lib/Endpoints/SettingsRoute.php` (lines 94–101)

The `sqlite_path` REST parameter is stored directly without sanitization:
```php
$settings->sqlite_path = !empty($sqlitePath) ? $sqlitePath : WP_CONTENT_DIR . '...';
```
An admin with REST access could point the path at sensitive files outside the intended data directory, enabling read or write of arbitrary filesystem locations when the SQLite driver is active.

**Remediation:** Validate the path resolves within an expected base directory. Use `sanitize_text_field()` and `realpath()` to canonicalize and assert scope.

---

### 5. Unsanitized `connection_port` Written to Options
**File:** `lib/Endpoints/SettingsRoute.php` (lines 66, 85–86)

`connection_port` is range-validated later but stored without sanitization:
```php
update_option('gateway_connection_port', $request->get_param('connection_port') ?? '');
```
Sanitization should occur at the point of retrieval, before any storage or use.

**Remediation:** Pass through `absint()` or `sanitize_text_field()` immediately on retrieval, before assignment or storage.

---

### 6. Undefined Variable in `showMigrationNotice()` Output
**File:** `Plugin.php` (line 383)

`$settings_url` is referenced in `showMigrationNotice()` but is never defined within that function (it is defined in the sibling `showConnectionNotice()` at line 368). The anchor href silently renders empty. A future copy-paste fix that introduces the wrong value here could create an open redirect or XSS vector.

**Remediation:** Define `$settings_url` explicitly within `showMigrationNotice()` using `admin_url('admin.php?page=gateway-settings')` as done in the sibling function.

---

## Medium

### 7. `$_REQUEST['post_type']` Used Without Sanitization
**File:** `includes/functions.php` (lines 88–89)

```php
if (isset($_REQUEST['post_type']) && post_type_exists($_REQUEST['post_type'])) {
    $typenow = $_REQUEST['post_type'];
}
```
Although `post_type_exists()` provides implicit validation, the raw superglobal value is assigned without explicit sanitization. WordPress standards require `sanitize_key()` on post type slugs.

**Remediation:** Apply `sanitize_key()` to `$_REQUEST['post_type']` before use.

---

### 8. `glob()` Traversal via Unvalidated Extension Directory
**File:** `lib/Raptor/Endpoints/ExtensionCrudRoutes.php` (line 186)

```php
$collection_files = glob($collections_dir . '/*.json');
```
`$collections_dir` is derived from the user-controlled `$extension_key`. Combined with issue #1, a traversal payload in `extension_key` allows enumeration of arbitrary JSON files across the filesystem.

**Remediation:** Resolve this as a downstream consequence of fixing issue #1. Once `extension_key` is strictly validated, this call becomes safe.

---

### 9. Missing Nonce Verification on CPT `save_post` Hook
**File:** `includes/functions.php` (lines 114–163)

The `save_post` handler checks `current_user_can('edit_post')` but does not verify a nonce. Without nonce verification, a crafted cross-site request from a logged-in admin can trigger the save action.

**Remediation:** Add `check_admin_referer()` or `wp_verify_nonce()` using a nonce field output on the edit screen.

---

## Low

### 10. Unparameterized `SHOW TABLES` in MigrationGeneratorRoute
**File:** `lib/Endpoints/MigrationGeneratorRoute.php` (line 217)

```php
$tableExists = $wpdb->get_var("SHOW TABLES LIKE '$fullTableName'") === $fullTableName;
```
`$fullTableName` is internally derived but the pattern is inconsistent with usage elsewhere and could become injectable if the derivation logic changes.

**Remediation:** Use `$wpdb->prepare()` with `$wpdb->esc_like()` for all `SHOW TABLES LIKE` queries.

---

### 11. Hardcoded Unrelated Plugin Slug in functions.php
**File:** `includes/functions.php` (lines 131–132)

```php
$pluginSlug = 'horizon';
$pluginNamespace = 'Horizon';
```
References to a different plugin's slug and namespace appear to be a leftover from a copy. This is low risk but indicates dead or misattributed code that could cause confusion during security reviews or audits.

**Remediation:** Remove or replace with Gateway-specific values.
