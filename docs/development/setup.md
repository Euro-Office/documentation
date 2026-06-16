# Developer setup

The full {{ brand.name }} stack runs locally via the docker-compose-based
environment in
[`DocumentServer/develop/`]({{ brand.repo }}/DocumentServer/tree/main/develop).
It builds each component from source, can serve the editor UI from source for
[hot-reload](hot-reload.md), and includes a paired Nextcloud instance for
end-to-end testing.

## Prerequisites

- Docker 24+ with `buildx`.
- 16 GB RAM minimum (the first build is heavy).
- Git with access to `{{ brand.repo }}`.
- A Linux x86_64 or arm64 host. macOS works for everything except native-core
  C++ debugging. On Windows, use WSL2 (see [Troubleshooting](troubleshooting.md)
  for the host/WSL Git caveats).

## Clone and start

```bash
git clone --recurse-submodules {{ brand.repo }}/DocumentServer.git
cd DocumentServer/develop
make local
```

`make local`:

1. Brings up the containers (`docker compose up -d`).
2. Waits for the document server to answer `/healthcheck` and for Nextcloud to
   finish installing.
3. Runs `refresh-urls`, which sets `DocumentServerUrl`, `trusted_domains` and the
   shared `jwt_secret` in Nextcloud — **always as `www-data`**.
4. Drops you into a shell inside the `eo` container.

## Layout of the dev environment

The compose file (`develop/docker-compose.yml`) starts:

| Service | Role | URL |
|---|---|---|
| `eo` | {{ brand.name }} document server, built from local source (image `{{ brand.image }}:latest-dev`) | `http://localhost:8080` |
| `nextcloud` | Storage provider with the {{ brand.name }} integration app | `http://localhost:8081` |
| `onlyoffice` | Stock ONLYOFFICE, for comparison/regression | `http://localhost:8082` |

PostgreSQL, Redis and RabbitMQ run **inside** the `eo` container. The repository
root is bind-mounted into `eo` at `/develop` (`EO_DEV`), and the compiled/deployed
tree that nginx serves lives at `$EO_ROOT`
(`/var/www/{{ brand.product_slug }}/documentserver` by default).

## First build

The pre-built dev image already contains a working editor. To rebuild a component
from your local source, run the internal Makefile inside the container:

```bash
# you are already inside eo after `make local`; otherwise: docker compose exec eo bash
make -f /Makefile web-apps     # front-end: npm ci + full grunt build
make -f /Makefile sdkjs        # document engine (JS/WASM)
make -f /Makefile server       # Node backend (docservice, converter, …)
```

The compiled front lands in `$EO_ROOT/web-apps/…`, which nginx serves by default.

## Front build model (compiled vs source)

The editor nginx serves in production is **not your sources**: it is a single
`app.js` bundle optimised by **r.js (RequireJS)** and minified, with `.template`
files inlined at build time and LESS compiled to CSS.

Each editor ships two HTML entry points:

- `index.html` — **source / dev mode**: `data-main="app_dev"`, RequireJS loads each
  module individually from source, templates via the `text!` plugin at runtime,
  LESS compiled in the browser. The SDK is loaded as global scripts listed by a
  *develop loader*.
- `index.html.deploy` — **compiled mode**: loads the optimised `app.js` bundle.
  The build copies it over `index.html` on deploy.

Serving the **source** entry point is what enables [hot-reload](hot-reload.md):
edit a file, reload, see the change — no build.

## Mobile / non-localhost testing

`make local` runs against `localhost`. To reach the editor from a phone, emulator
or another machine on the LAN, use `make mobile` (it injects the detected host LAN
IP into Nextcloud's `DocumentServerUrl` and `trusted_domains`). After an IP change,
re-run `make refresh-urls`.

## Next steps

- [Front hot-reload](hot-reload.md) — edit the UI and see it without rebuilding.
- [Troubleshooting](troubleshooting.md) — Git/WSL, `npm ci`, Nextcloud recovery.
- [Building from source](building.md) — produce the Docker image and packages.
- [Nextcloud integration](../integration/nextcloud.md) — the connector app.
