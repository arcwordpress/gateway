# Release process (instructions for Claude Code)

Purpose: produce a release for this WordPress plugin, incrementing the version number everywhere listed, updating changelog, building assets, committing, tagging and pushing to origin.

Variables
- NEW_VERSION — the new semantic version (e.g. 1.2.3)
- BRANCH — release branch (default: main)

Steps

1. Checkout and sync
- git checkout BRANCH
- git pull origin BRANCH

2. Set NEW_VERSION
- set NEW_VERSION to the target version.

3. Locate version occurrences
- The following files contain version numbers that must be updated:

    **PHP Files:**
    - `Plugin.php` line 5: `* Version: 1.1.0` (plugin header)
    - `Plugin.php` line 19: `define('GATEWAY_VERSION', '1.1.0');` (constant)

    **Documentation:**
    - `README.md` line 29: version number in ## Version section
    - `CHANGELOG.md`: add new release entry at top

    **React Package Files (package.json):**
    - `react/apps/admin/package.json` line 3: `"version": "1.1.0"`
    - `react/apps/studio/package.json` line 3: `"version": "1.1.0"`
    - `react/apps/form/package.json` line 3: `"version": "1.1.0"`
    - `react/packages/grid/package.json` line 3: `"version": "1.1.0"`
    - `react/packages/forms/package.json` line 3: `"version": "1.1.0"`

    **Dependency References (package.json):**
    - `react/apps/admin/package.json` lines 13-14: `@gateway/forms` and `@gateway/grid` dependency versions
    - `react/apps/studio/package.json` lines 13-14: `@gateway/forms` and `@gateway/grid` dependency versions
    - `react/apps/form/package.json` line 21: `@gateway/forms` dependency version

    Note: composer.json does not have a version field (Composer gets versions from git tags)

4. Update version everywhere
- Replace occurrences with NEW_VERSION. Example portable commands (run from repo root):
    - For PHP plugin header lines like `* Version: X`:
        - perl -pi -e "s/^(\\s*\\*\\s*Version:\\s*).*/\$1$NEW_VERSION/" $(grep -Rl "Version:" --exclude-dir=.git)
    - For JSON files (package.json/composer.json):
        - jq --arg v "$NEW_VERSION" '.version = $v' package.json > package.json.tmp && mv package.json.tmp package.json
        - jq --arg v "$NEW_VERSION" '.version = $v' composer.json > composer.json.tmp && mv composer.json.tmp composer.json
    - For readme stable tag:
        - perl -pi -e "s/^(Stable tag:\\s*).*/\$1$NEW_VERSION/" readme.txt
    - For generic occurrences:
        - grep -Rl "old_version_value" | xargs sed -i "s/old_version_value/$NEW_VERSION/g"
- Verify changes: git diff --name-only

5. Update changelog / RELEASE notes
- Append an entry in docs/CHANGELOG.md or docs/RELEASE.md:
    - Header: ## vNEW_VERSION — YYYY-MM-DD and list notable changes.

6. Run tests and build
- npm ci && npm run build (if applicable)
- composer install --no-dev --optimize-autoloader (if applicable)
- Run unit / integration tests: vendor/bin/phpunit or npm test

7. Commit changes
- git add .
- git commit -m "release: vNEW_VERSION — update versions and changelog"
- git push origin BRANCH

8. Create release candidate tag first
- ALWAYS create a release candidate (RC) tag before the final release tag
- First RC: git tag -a vNEW_VERSION-rc1 -m "Release candidate vNEW_VERSION-rc1"
- Push RC tag: git push origin vNEW_VERSION-rc1
- If testing reveals issues:
    - Fix issues and commit
    - Increment RC number: git tag -a vNEW_VERSION-rc2 -m "Release candidate vNEW_VERSION-rc2"
    - Push: git push origin vNEW_VERSION-rc2
- Once RC testing succeeds, create final release tag:
    - git tag -a vNEW_VERSION -m "Release vNEW_VERSION"
    - git push origin vNEW_VERSION

9. Post-release tasks (optional)
- Create GitHub/GitLab release using the changelog entry.
- Update any package registries (npm, Packagist, WordPress SVN).
- If publishing to WordPress.org: update SVN trunk/tags.

Notes for automation (Claude Code)
- Fail fast on any test/build failure.
- Validate that no remaining occurrences of the old version exist:
    - grep -R --line-number -e "VERSION_PLACEHOLDER" --exclude-dir=.git
- Use environment-provided NEW_VERSION variable; abort if empty.
- Use dry-run mode for sed/perl replacements during verification.

End state required
- Repository BRANCH contains the committed version changes.
- Annotated git tag vNEW_VERSION-rc1 (or higher RC number) exists for testing.
- After successful testing, annotated git tag vNEW_VERSION exists and is pushed to origin.

Replace all placeholders (NEW_VERSION / BRANCH) before execution. Final step must tag and push to origin as above.