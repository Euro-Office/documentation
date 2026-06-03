# Docker

The recommended way to run {{ brand.name }} in production is via the official
Docker image, mounted with persistent volumes and fronted by a reverse proxy
that terminates TLS.

## Pull and run

```bash
docker run -d --name {{ brand.product_slug }} \
    --restart=always \
    -p 80:80 \
    -e JWT_ENABLED=true \
    -e EXAMPLE_ENABLED=true
    -e JWT_SECRET=my_personal_secret \
    {{ brand.image }}
```

Key flags:

- `JWT_SECRET` — the shared secret used by your DMS to sign requests. Store it somewhere durable.
- `EXAMPLE_ENABLED` — enables the example app for trying out the editor without connecting to a DMS. Don't enable in production.

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

## Source

The Docker image is built from `DocumentServer/build/` in the
[DocumentServer repository]({{ brand.repo }}/DocumentServer). To build it
yourself, see [building from source](../development/building.md).
