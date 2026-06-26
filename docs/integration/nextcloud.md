# Nextcloud

{{ brand.name }} has first-class Nextcloud integration via a dedicated
Nextcloud app that connects to a running {{ brand.name }} document server.

## Prerequisites

- A running {{ brand.name }} document server reachable from your Nextcloud
  instance — see [installation](../installation/docker.md).
- The JWT secret you configured in your document server, which you'll need to enter in the Nextcloud app
  settings.
- Nextcloud 34 or later

## Install the Nextcloud app

1. In Nextcloud, go to **Apps** → **Office & text** → **{{ brand.name }} integration**.
2. Click **Download and enable**.

## Configure the app

1. In Nextcloud, go to **Settings** → **Administration** → **{{ brand.name }}**.
2. Enter the URL of your {{ brand.name }} document server, including the protocol and port (e.g. `https://{{ brand.product_slug }}.example.com`).
3. Enter the JWT secret you configured in your document server. It must be at least **32 characters**. Generate one with `openssl rand -hex 32`.
4. Click **Save**.

## Source

The Nextcloud integration app lives at
[`{{ brand.repo }}/{{ brand.product_slug }}-nextcloud`]({{ brand.repo }}/{{ brand.product_slug }}-nextcloud).

## Local development

In the [dev environment](../development/setup.md), the integration app is mounted into
Nextcloud from a sibling checkout (`~/repos/{{ brand.product_slug }}-nextcloud`), not
installed from the App Store. If that directory is empty the app can't be enabled and
the **+ New** buttons disappear.

**Set it up once:**

```bash
# 1) clone WITH submodules (it needs document-formats / document-templates)
cd ~/repos
git clone --recurse-submodules {{ brand.repo }}/{{ brand.product_slug }}-nextcloud.git

# 2) build: frontend (vite → js/) + PHP deps (firebase/php-jwt → vendor/)
cd {{ brand.product_slug }}-nextcloud
npm install && npm run build
composer install --no-dev

# 3) enable it (as www-data) and align URLs/JWT
cd ~/repos/DocumentServer/develop
docker compose exec -u www-data nextcloud php occ app:enable {{ brand.product_slug }}
make refresh-urls
```

!!! warning "App Store / permissions"
    Nextcloud requires the `apps_paths` entry marked `writable: true` to be writable.
    The dev mount creates `custom_apps` as `root:root`, so `occ app:enable` fails with
    *"Cannot write into apps directory"*. Give it to `www-data` and disable the App
    Store (not needed in dev):

    ```bash
    docker compose exec -u root nextcloud chown www-data:www-data /var/www/html/custom_apps
    docker compose exec -u root nextcloud chmod 775 /var/www/html/custom_apps
    docker compose exec -u www-data nextcloud php occ config:system:set appstoreenabled --type=boolean --value=false
    ```

!!! note "`/apps/files/` shows a 500 (`getFormats(): … null`)"
    You cloned the app **without** its submodules. Fix it:

    ```bash
    cd ~/repos/{{ brand.product_slug }}-nextcloud && git submodule update --init --recursive
    docker compose -f ~/repos/DocumentServer/develop/docker-compose.yml restart nextcloud
    ```

**Verify:** `occ app:list | grep {{ brand.product_slug }}` lists the app; in
`http://localhost:8081` the **+ New** menu offers Document / Spreadsheet / Presentation.
See [Troubleshooting](../development/troubleshooting.md) for `occ`/permissions recovery.
