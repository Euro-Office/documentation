# Plugins

Plugins extend the {{ brand.name }} editors with extra panels and tools. This
page covers what ships with the server, how to add or hide plugins, and what to
consider before enabling a plugin. To write your own plugin, see
[Plugin development](../development/plugins.md). For the list of plugins and
the services they contact, see [Available plugins](../integration/plugins.md).

{{ brand.name }} is a fork of ONLYOFFICE Docs and uses the same plugin format,
so most plugins written for ONLYOFFICE work unchanged. Unlike ONLYOFFICE,
{{ brand.name }} ships **no plugin marketplace** and **no plugin manager
command**. The `documentserver-pluginsmanager.sh` script and the
`PLUGINS_ENABLED` and `PLUGINS_MARKET_DISABLED` variables do not exist in
{{ brand.name }}. Plugins are added by the administrator, as described below.

## How plugins are found

Server-wide plugins live in the `sdkjs-plugins` directory of the document
server:

```
/var/www/{{ brand.package_path_name }}/documentserver/sdkjs-plugins/
```

Every subfolder that contains a `config.json` is a plugin. The server lists
them at `/plugins.json`, and the editors load that list on startup:

```bash
curl http://localhost/plugins.json
```

```json
{"url":"","pluginsData":["../../../../sdkjs-plugins/hello/config.json"],"autostart":[]}
```

The folder name does not matter: the editors identify a plugin by the `guid` in
its `config.json`. The server rescans the directory at most every five
minutes. To pick up a new plugin immediately, restart the document server (or
the container).

The `sdkjs-plugins/v1` folder holds the helper scripts that plugins load
(`plugins.js`, `plugins-ui.js`, `plugins.css`). It has no `config.json` and is
not listed as a plugin.

## Bundled plugins

!!! warning "Not yet in the released image"

    Bundling plugins into the image is planned but not released yet. Current
    images ship an empty `sdkjs-plugins` directory without the `v1` helper
    scripts. Until bundling lands, mount the `v1` folder from the
    [plugins repository]({{ brand.repo }}/plugins/tree/master/sdkjs-plugins/v1)
    next to your plugins, the same way as a plugin folder (see
    [Docker](#docker)).

The image will include the helper scripts and a small curated set of plugins
from the [{{ brand.name }} plugins repository]({{ brand.repo }}/plugins):

| Plugin | Purpose |
|---|---|
| Highlight code | Insert source code with syntax highlighting |
| Photo editor | Crop, resize, and apply effects to images |
| Zotero | Insert citations and bibliographies from a Zotero library |
| Mendeley | Insert citations and bibliographies from a Mendeley library |

All bundled plugins are visual plugins: they appear in the **Plugins** tab and
only run when a user opens them. The editors never load plugins from external
hosts such as `onlyoffice.github.io`.

## Adding a plugin

Plugins that are not bundled are published as `.plugin` files on the
[releases page]({{ brand.repo }}/plugins/releases) of the plugins repository.
A `.plugin` file is a zip archive of the plugin folder. Plugins from other
sources work the same way as long as they follow the
[migration notes](../development/plugins.md#migrating-an-existing-plugin).

!!! note "Release files not published yet"

    The release workflow for `.plugin` files is still being set up. Until the
    first release, take the plugin folder from
    [`sdkjs-plugins/content`]({{ brand.repo }}/plugins/tree/master/sdkjs-plugins/content)
    in the plugins repository.

Before adding a plugin, check the [security notes](#security) and the external
services listed in [Available plugins](../integration/plugins.md).

### Package install (deb/rpm)

Unpack the plugin into its own folder under `sdkjs-plugins`:

```bash
sudo mkdir /var/www/{{ brand.package_path_name }}/documentserver/sdkjs-plugins/ocr
sudo unzip ocr.plugin -d /var/www/{{ brand.package_path_name }}/documentserver/sdkjs-plugins/ocr
```

Package upgrades replace the contents of the document server directory, so
keep a copy of your plugins and re-add them after an upgrade.

### Docker

The `sdkjs-plugins` directory is read-only in the image. Mount each plugin
from the host into its own subfolder. Do not mount over the whole
`sdkjs-plugins` directory, as that hides the bundled plugins and helper
scripts.

```bash
mkdir -p /srv/{{ brand.package_path_name }}/plugins/ocr
unzip ocr.plugin -d /srv/{{ brand.package_path_name }}/plugins/ocr
```

=== "docker run"

    ```bash
    docker run -d \
      --name {{ brand.package_path_name }} \
      --restart=unless-stopped \
      -p 80:80 \
      -e JWT_ENABLED=true \
      -e JWT_SECRET=at-least-32-chars-long-for-hs256 \
      -v /srv/{{ brand.package_path_name }}/plugins/ocr:/var/www/{{ brand.package_path_name }}/documentserver/sdkjs-plugins/ocr:ro \
      {{ brand.image }}:latest
    ```

=== "Docker Compose"

    ```yaml
    services:
      documentserver:
        image: {{ brand.image }}:latest
        restart: unless-stopped
        ports:
          - "80:80"
        environment:
          JWT_ENABLED: "true"
          JWT_SECRET: at-least-32-chars-long-for-hs256
        volumes:
          - /srv/{{ brand.package_path_name }}/plugins/ocr:/var/www/{{ brand.package_path_name }}/documentserver/sdkjs-plugins/ocr:ro
    ```

Add one volume line per plugin. The plugin stays on the host, so it survives
container upgrades. No registration step is needed: once the container is
running, the plugin is listed at `/plugins.json` and appears in the **Plugins**
tab.

### Plugins hosted elsewhere

The integrating application can load plugins from any web server through the
editor configuration, without touching the document server. Pass absolute
URLs to each plugin's `config.json` in `editorConfig.plugins.pluginsData`:

```js
const config = {
  editorConfig: {
    plugins: {
      pluginsData: [
        "https://plugins.example.com/ocr/config.json"
      ]
    }
  }
};
```

The editors fetch `config.json` from the browser, so the hosting server must
send CORS headers that allow the document server's origin. These plugins are
only available in editors opened with this configuration.

### Updating and removing a plugin

To update a plugin, replace the files in its folder, then run
`documentserver-flush-cache.sh` so browsers fetch the new version (see
[Command-line tools](commands.md)). To remove a plugin, delete its folder (or
remove the volume and recreate the container) and restart the document server.

## Starting plugins automatically

Plugins normally run when a user opens them from the **Plugins** tab. To start
a plugin when the editor opens, list its GUID (from `config.json`) in
`editorConfig.plugins.autostart`:

```js
const config = {
  editorConfig: {
    plugins: {
      autostart: ["asc.{8f1c2b9e-3d4a-4e6f-9b7c-1a2d3e4f5a6b}"]
    }
  }
};
```

On a package install you can set the same list for all editors in `local.json`
under `services.CoAuthoring.plugins.autostart` (see
[Server configuration](server.md)).

Some plugins start without being configured:

- **Background plugins** (`"type": "background"` in `config.json`) start for
  every user as soon as they are installed on the server.
- **System plugins** (`"isSystem": true`) always run.

Check a plugin's `config.json` for these settings before installing it
server-wide.

## Hiding plugins

To hide the **Plugins** tab and stop all plugins for a document, set
`editorConfig.customization.plugins` to `false`:

```js
const config = {
  editorConfig: {
    customization: {
      plugins: false
    }
  }
};
```

Disabling individual server-wide plugins per document
(`editorConfig.plugins.disable`) is not available yet. It will arrive with a
later update of the editors. Until then, remove the plugin from the server.

## Per-browser plugins

Plugins can also be installed into a single browser through the plugin API.
The editors store these in the browser's local storage (key
`asc_plugins_installed`), so they are only visible to that browser profile and
persist until the user clears site data. {{ brand.name }} does not ship a user
interface for browsing or installing plugins this way.

## Security

Review a plugin before you install it on the server. Plugins are not sandboxed
from the document:

- **Full document access.** The plugin UI runs in an iframe, but code passed to
  `callCommand` runs in the editor frame with the full document API. A plugin
  can read and change everything in the open document, including content the
  user has not selected.
- **External services.** Several plugins send document text or images to third
  parties. For example, DeepL requests go through an ONLYOFFICE proxy
  (`plugins-services.onlyoffice.com`), Translator loads the Google Translate
  widget, LanguageTool sends text to `api.languagetoolplus.com`, Thesaurus
  queries `words.bighugelabs.com`, and the AI plugin sends prompts and document
  content to whichever providers the user configures. See
  [Available plugins](../integration/plugins.md) for the full list.
- **Server-wide reach.** A plugin in `sdkjs-plugins` is offered to every user
  of the document server. Background and system plugins run for every user
  without any action on their part.
- **Per-browser installs persist.** Plugins installed into a browser stay in
  its local storage until the user clears site data, and are not visible to
  the administrator.
- **Message origin.** The `v1/plugins.js` helper trusts the first origin that
  sends it the `plugin_init` message and evaluates the code in it. Host plugins
  on the document server, or, for plugins hosted elsewhere, restrict which
  sites may frame them (for example with a `Content-Security-Policy:
  frame-ancestors` header).
