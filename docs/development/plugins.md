# Plugin development

{{ brand.name }} uses the ONLYOFFICE plugin runtime unchanged: plugins are web
pages that run in an iframe inside the editor, talk to it through
`window.Asc.plugin`, and are described by a `config.json` manifest. The full
API (`callCommand`, `executeMethod`, events, and the document builder API) is
documented in the upstream
[plugin API reference](https://api.onlyoffice.com/docs/plugins/). This page
covers what is specific to {{ brand.name }}: a minimal plugin, a local
development loop, debugging, and migrating existing plugins.

To install a finished plugin, see [Plugins](../configuration/plugins.md).

## A minimal plugin

This plugin adds a **Hello world** button to the **Plugins** tab of the
document editor. Clicking it inserts a paragraph into the document.

```
hello/
├── config.json
├── index.html
├── scripts/
│   └── hello.js
└── resources/
    ├── icon.png
    └── icon@2x.png
```

### `config.json`

```json
{
  "name": "Hello world",
  "guid": "asc.{8f1c2b9e-3d4a-4e6f-9b7c-1a2d3e4f5a6b}",
  "version": "1.0.0",
  "variations": [
    {
      "description": "Insert a greeting into the document",
      "url": "index.html",
      "icons": ["resources/icon.png", "resources/icon@2x.png"],
      "isViewer": false,
      "EditorsSupport": ["word"],
      "isVisual": false,
      "initDataType": "none",
      "initData": "",
      "buttons": []
    }
  ]
}
```

!!! warning "Use your own GUID"

    The `guid` above is a placeholder. Every plugin needs a unique GUID in the
    form `asc.{UUID}`. Generate one, for example with `uuidgen`, and replace
    the placeholder before you share the plugin. Two plugins with the same
    GUID overwrite each other.

`isVisual: false` makes this a plugin without its own window: it runs its code
and closes. `EditorsSupport` lists the editors that offer the plugin (`word`,
`cell`, `slide`, `pdf`). The icons are shown on the button in the **Plugins**
tab; use 20 x 20 and 40 x 40 pixel PNGs.

### `index.html`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Hello world</title>
  <script src="../v1/plugins.js"></script>
  <script src="../v1/plugins-ui.js"></script>
  <link rel="stylesheet" href="../v1/plugins.css" />
  <script src="scripts/hello.js"></script>
</head>
<body></body>
</html>
```

The three `v1` files are the plugin helpers. They live in
`sdkjs-plugins/v1` on the document server, next to the plugin folders, so a
plugin installed in `sdkjs-plugins/<name>/` loads them with `../v1/`.

### `scripts/hello.js`

```js
(function (window) {
  window.Asc.plugin.init = function () {
    this.callCommand(function () {
      var oDocument = Api.GetDocument();
      var oParagraph = Api.CreateParagraph();
      oParagraph.AddText("Hello from a plugin!");
      oDocument.InsertContent([oParagraph]);
    }, true);
  };

  window.Asc.plugin.button = function () {
    this.executeCommand("close", "");
  };
})(window);
```

`init` runs when the user starts the plugin. The function passed to
`callCommand` is serialized and run inside the editor, where the document
builder API (`Api`) is available. It cannot use variables from the plugin
scope; pass data in through `Asc.scope` instead. The second argument `true`
closes the plugin when the command has finished.

## Development loop

Run a local document server with the
[developer environment](setup.md) in `DocumentServer/develop` and mount your
plugin folder into it. Create `develop/docker-compose.override.yml`:

```yaml
services:
  eo:
    volumes:
      - /path/to/hello:/var/www/{{ brand.package_path_name }}/documentserver/sdkjs-plugins/hello:ro
      # Only needed until the image ships the helpers:
      - /path/to/plugins/sdkjs-plugins/v1:/var/www/{{ brand.package_path_name }}/documentserver/sdkjs-plugins/v1:ro
```

Then start the server and open a document in the example app:

```bash
cd DocumentServer/develop
docker compose up -d eo
curl -sf http://localhost:8080/healthcheck
curl http://localhost:8080/plugins.json
```

Open `http://localhost:8080/example/`, create a document, and open the
**Plugins** tab. Changes to `index.html` and scripts are served directly from
your folder; reload the editor to pick them up. Changes to `config.json` and
newly added plugins are listed at `/plugins.json` within five minutes, or
immediately after `docker compose restart eo`.

!!! note "Helper scripts"

    Current images do not ship `sdkjs-plugins/v1` yet. Mount the folder from a
    checkout of the [plugins repository]({{ brand.repo }}/plugins) as shown
    above.

### Without a local document server

You can also serve the plugin from any local web server and load it through
`editorConfig.plugins.pluginsData` with an absolute URL to `config.json` (see
[Plugins hosted elsewhere](../configuration/plugins.md#plugins-hosted-elsewhere)).
The server must send CORS headers for the document server's origin. In this
setup `../v1/` resolves on your own server, so serve the `v1` folder next to
the plugin folder.

## Debugging

The plugin UI and its scripts run in an iframe. Select that frame in the
browser developer tools to inspect it and set breakpoints in your plugin files.

Code passed to `callCommand` is different: it runs in the editor frame, not in
the plugin iframe, so breakpoints set in your plugin file are never hit. Add a
`debugger` statement inside the command and keep the developer tools open:

```js
this.callCommand(function () {
  debugger;
  var oDocument = Api.GetDocument();
  // ...
}, true);
```

Errors thrown inside a command appear in the console of the editor frame.

## Migrating an existing plugin

Plugins written for ONLYOFFICE work in {{ brand.name }} with two changes.

**Load the helpers locally.** Many plugins load the helpers from GitHub Pages.
{{ brand.name }} does not load anything from `onlyoffice.github.io`, so point
them at the local copy:

```diff
-<script src="https://onlyoffice.github.io/sdkjs-plugins/v1/plugins.js"></script>
-<script src="https://onlyoffice.github.io/sdkjs-plugins/v1/plugins-ui.js"></script>
-<link rel="stylesheet" href="https://onlyoffice.github.io/sdkjs-plugins/v1/plugins.css">
+<script src="../v1/plugins.js"></script>
+<script src="../v1/plugins-ui.js"></script>
+<link rel="stylesheet" href="../v1/plugins.css">
```

**Replace `pluginBase.js`.** Older plugins load `../pluginBase.js`, which
{{ brand.name }} does not ship. Replace it with the three `v1` files above. The
`window.Asc.plugin` API stays the same.

Also check the plugin for other assets loaded from external hosts (fonts,
libraries, APIs) and either bundle them or document them, so administrators
know which services the plugin contacts.

## Reference

- [Plugin API reference](https://api.onlyoffice.com/docs/plugins/) (upstream)
- [`editorConfig.plugins`](https://api.onlyoffice.com/docs/docs-api/usage-api/config/editor/plugins/) (upstream)
- [{{ brand.name }} plugins repository]({{ brand.repo }}/plugins), including
  the `v1` helpers and the source of all [available plugins](../integration/plugins.md)
