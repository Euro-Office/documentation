# Front hot-reload

The {{ brand.name }} editor front-end (`web-apps`) can be served **from source**, so
editing a file (a template, a view, a stylesheet) is reflected in the editor by a
browser reload — **no build step**. With the optional live-reload server the tab
reloads on its own.

This mirrors ONLYOFFICE's official "developer mode" (`build_tools/develop`): `api.js`,
`web-apps` and `sdkjs` are all served from the source tree, mutually coherent, instead
of mixing compiled pieces.

!!! note "Scope"
    Hot-reload applies to **`web-apps`** (the UI: toolbar, views, panels, dialogs,
    styles) — the bulk of front-end work. The **JS** of `sdkjs` is also served from
    source and reloads on a refresh, but the live-reload watcher only watches
    `web-apps` by default, and WASM/C++ parts of the SDK are pre-compiled. `server`
    and `core` are compiled processes and need a rebuild + restart.

## One-time setup

Generate the SDK "develop loader" in the source tree, coherent with the front:

```bash
cd ~/repos/DocumentServer/develop
make sdkjs-dev
```

`make sdkjs-dev` runs `grunt develop` in `sdkjs` and places the generated
`AllFonts.js`, so `/develop/sdkjs` serves a complete SDK that matches your front.
Re-run it only when you change the `sdkjs` submodule. `make front-dev` refuses to
start if this step has not been run, so you can't accidentally serve a half-built SDK.

!!! note "Live-reload dependencies install themselves"
    The first `make front-dev-live` runs `npm ci` for the watcher
    (`develop/setup/livereload-tools`) automatically when `node_modules` is missing —
    no manual install step. The lockfile is committed, so the install is reproducible
    across machines.

## Daily use

```bash
make front-dev-live      # source mode + live-reload server
# edit e.g. web-apps/apps/documenteditor/main/app/template/Toolbar.template
# (change a class/id), SAVE  →  the editor tab reloads itself
make front-prod          # back to production (compiled) mode when done
```

Variants:

- `make front-dev` — source mode **without** auto-reload (you press ++ctrl+shift+r++).
- `make front-prod` — restore the production (compiled) editor and versioned cache.

## How it works

All of this lives in `develop/setup/ds-docservice-dev.conf` (swapped in by the make
targets) and `develop/setup/livereload-tools/`:

1. **Serve from source.** The dev nginx config serves `/web-apps/` and `/sdkjs/` from
   `/develop` with `no-store`, and drops the production version-redirect.
2. **No version prefix.** `api.js` is served from source. DocsAPI only adds the
   `/X.Y.Z-<hash>/` version prefix when `api.js` is *compiled* (its
   `{{ '{{PRODUCT_VERSION}}' }}` placeholder substituted). Served from source, the
   placeholder is intact, so **no prefix is added** — the editor loads unversioned and
   the SDK load order (synchronous `document.write` → RequireJS) works as designed.
3. **SDK from source.** `make sdkjs-dev` generates the develop loader under
   `/develop/sdkjs`. The dev config falls back to `$EO_ROOT` for generated binaries
   (`.wasm`, `theme.bin`) that are not present in the source tree.
4. **Auto live-reload.** A small `livereload` Node server watches
   `/develop/web-apps/apps` in **polling** mode (inotify events do not cross the
   Windows↔WSL boundary reliably; polling catches saves from any editor). The client
   is injected via nginx `sub_filter` and the websocket is proxied through `:8080`, so
   no extra ports are exposed and the container is not recreated.

!!! info "WSL2"
    Because the browser fetches from nginx on each reload (and nginx reads the
    bind-mounted source live), hot-reload does **not** depend on `inotify`. Saving from
    Windows VS Code over `\\wsl.localhost\` works.

## Verify it

Open a document from Nextcloud and check **DevTools → Network**:

- Editor URLs are `…:8080/web-apps/…` and `…:8080/sdkjs/…` **without** a `/9.3.1-…/`
  prefix.
- You see `app_dev.js` plus individual `.js` / `.template` files and SDK sources
  (first load is slower).
- Edit a template, save → the tab reloads and the change is visible, with no console
  errors.

!!! tip "First run: clear stale cache"
    If you previously opened the editor in compiled mode, clear the browser state once:
    DevTools → Application → Service Workers → **Unregister**, then **Clear site data**,
    and keep **Disable cache** ticked in Network. The dev config also neutralises the
    editor service worker.

!!! note "First load is slower"
    In source mode the SDK loads as many individual files, so the first time you open an
    editor is slower than the compiled bundle; subsequent reloads are fast. If the editor
    ever fails to open after an upstream change (e.g. an SDK/front mismatch), re-run
    `make sdkjs-dev` or fall back to the per-editor rebuild below.

## Fallback: fast per-editor rebuild

Not instant, but the officially supported cycle and **always works**: rebuild only the
editor you touched and flush the nginx cache (tens of seconds):

```bash
docker compose exec eo bash -lc 'cd /develop/web-apps/build && \
  BUILD_ROOT=$EO_ROOT grunt --skip-babel --skip-imagemin --skip-sprites deploy-documenteditor && \
  HASH=$(date +%s|openssl md5|cut -d" " -f2); echo "set \$cache_tag \"$HASH\";">/etc/nginx/includes/ds-cache.conf; \
  service nginx reload'
```

Targets exist per editor (`deploy-documenteditor`, `deploy-spreadsheeteditor`, …) and
`grunt less-all` rebuilds styles only. The `ds-cache.conf` re-tag is required, otherwise
the browser keeps the cached bundle. Then hard-reload the browser.

| | Source mode | Per-editor rebuild |
|---|---|---|
| "save → visible" latency | auto reload (~1–2 s, no build) | rebuild 1 editor (tens of s) + reload |
| commands per change | none (`make front-dev-live` once) | one per change |
| SDK | from source (develop loader) | compiled |
| best for | intensive UI iteration | real builds / SDK changes |
