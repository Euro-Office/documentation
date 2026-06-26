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
