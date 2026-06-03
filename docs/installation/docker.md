# Docker

The recommended way to run {{ brand.name }} in production is via the official
Docker image, mounted with persistent volumes and fronted by a reverse proxy
that terminates TLS.

## Pull and run

```bash
docker run -d --name {{ brand.product_slug }} \
    --restart=always \
    -p 443:443 \
    -v {{ brand.product_slug }}_data:/var/www/{{ brand.product_slug }}/Data \
    -v {{ brand.product_slug }}_log:/var/log/{{ brand.product_slug }} \
    -e JWT_ENABLED=true \
    -e JWT_SECRET=$(openssl rand -hex 32) \
    {{ brand.image }}
```

Key flags:

- `JWT_ENABLED=true` — refuse any unsigned API request. **Always enable in production.**
- `JWT_SECRET` — the shared secret used by your DMS to sign requests. Store it somewhere durable.
- `-v …_data:/var/www/{{ brand.product_slug }}/Data` — persists document data across container restarts.
- `-v …_log:/var/log/{{ brand.product_slug }}` — keeps logs outside the container.

## Image tags

| Tag | Use |
|---|---|
| `latest` | Most recent release. Pin in production. |
| `X.Y.Z` | Specific version. |
| `develop` | Bleeding-edge builds from `main`. Not for production. |

## TLS

Terminate TLS in front of the container. See
[TLS and reverse proxy](../configuration/tls-and-proxy.md) for nginx and
Caddy examples.

## Configuration

The container accepts configuration via environment variables (covered per
subsystem in the [configuration section](../configuration/overview.md)) or
by mounting a `local.json` into `/etc/{{ brand.product_slug }}/documentserver/local.json`.

!!! note "Coming soon"
    This page will be expanded with the full environment-variable matrix
    migrated from `DocumentServer/build/README.md`.

## Source

The Docker image is built from `DocumentServer/build/` in the
[DocumentServer repository]({{ brand.repo }}/DocumentServer). To build it
yourself, see [building from source](../development/building.md).
