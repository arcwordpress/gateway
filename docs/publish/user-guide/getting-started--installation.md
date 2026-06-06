# Installation

Install Gateway via the WordPress admin or by uploading and unzipping the plugin manually to create `/wp-content/plugins/gateway`.

Gateway is a free, open plugin. The latest stable version is available as a release from the project GitHub at <https://github.com/arcwordpress/gateway>.

## Gateway Activation

Activate the plugin from the WordPress plugins page.

Gateway installs a WP Admin menu item titled **Gateway** where you can view registered collections and test the database connection.

## Database Ports

If you are using **Local** (from WP Engine, previously named Local by Flywheel) this is an app that runs a dynamic interceptor that does real-time database port switching. Gateway creates a second database connection using PDO (to support the Eloquent ORM) therefore you need to set the port number under **WP Admin > Gateway > Settings > Port Settings**. You can find this port number in Local by looking at the **Database** tab under any site — it will usually be a 5-digit number such as `10020`.

## Database Settings

In addition to the port settings, Gateway also supports SQLite as an alternative to MySQL. This was added to support the WordPress Playground. If you are setting up Playground blueprints with Gateway to demo your Gateway Extensions or for any other purpose, Gateway detects the Playground environment automatically and switches the database connection to SQLite.
