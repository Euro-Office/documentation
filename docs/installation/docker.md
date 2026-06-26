# Installing Euro-Office via Docker

The quickest way to run Euro-Office Document Server is via the official Docker image.

## Prerequisites

- Docker Engine 20.10 or later
- 5 GB disk space for the image
- 4 GB RAM minimum

## Quick start

```bash
docker run -d \
  --name {{ brand.package_path_name }} \
  --restart=unless-stopped \
  -p 80:80 \
  -e JWT_ENABLED=true \
  -e JWT_SECRET=at-least-32-chars-long-for-hs256 \
  ghcr.io/euro-office/documentserver:latest
```

The server is ready when the health check returns `true`:

```bash
curl http://localhost/healthcheck
```

## Image tags

| Tag | Use |
|---|---|
| `latest` | Most recent release — use in production |
| `nightly` | Nightly builds from `main` — not for production |
| `latest-dev` | Development image with build tools included |

Pin to a specific version in production:

```bash
ghcr.io/euro-office/documentserver:9.3.1
```

## Verify with the example app

To test the editor in a browser, enable the built-in example app:

```bash
docker run -d \
  --name {{ brand.package_path_name }} \
  --restart=unless-stopped \
  -p 8080:80 \
  -e JWT_ENABLED=true \
  -e JWT_SECRET=at-least-32-chars-long-for-hs256 \
  -e EXAMPLE_ENABLED=true \
  ghcr.io/euro-office/documentserver:latest
```

Then open `http://localhost:8080/example/` in your browser.

!!! warning
    Disable `EXAMPLE_ENABLED` in production. The example app has no access control.

## Persistent data

By default, documents and configuration are lost when the container is removed. Mount volumes to persist them:

```bash
docker run -d \
  --name {{ brand.package_path_name }} \
  --restart=unless-stopped \
  -p 80:80 \
  -e JWT_ENABLED=true \
  -e JWT_SECRET=at-least-32-chars-long-for-hs256 \
  -v /path/to/data:/var/lib/{{ brand.package_path_name }}/documentserver \
  -v /path/to/logs:/var/log/{{ brand.package_path_name }}/documentserver \
  -v /path/to/config:/etc/{{ brand.package_path_name }}/documentserver \
  ghcr.io/euro-office/documentserver:latest
```

## Environment variables

The most common variables are listed below. For the full set, including the
`local.json` keys each one maps to, see [Server configuration](../configuration/server.md).

| Variable | Default | Description |
|---|---|---|
| `JWT_ENABLED` | `true` | Enable JWT authentication |
| `JWT_SECRET` | — | Shared secret — set this in production |
| `JWT_HEADER` | `Authorization` | HTTP header carrying the JWT |
| `EXAMPLE_ENABLED` | `false` | Enable the built-in example app |
| `WOPI_ENABLED` | `false` | Enable WOPI protocol support |
| `ALLOW_PRIVATE_IP_ADDRESS` | `false` | Allow document server to fetch from private IPs |
| `NGINX_WORKER_PROCESSES` | `1` | Number of nginx worker processes |
| `GENERATE_FONTS` | `true` | Regenerate font cache on startup |
| `DB_HOST` | `localhost` | PostgreSQL host (for external DB) |
| `DB_NAME` | `eurooffice` | PostgreSQL database name |
| `DB_USER` | `eurooffice` | PostgreSQL user |
| `REDIS_SERVER_HOST` | `localhost` | Redis host (for external Redis) |
| `AMQP_HOST` | `localhost` | RabbitMQ host (for external RabbitMQ) |

## Updating

```bash
docker pull ghcr.io/euro-office/documentserver:latest
docker stop {{ brand.package_path_name }} && docker rm {{ brand.package_path_name }}
# re-run with the same docker run command
```

## Uninstalling

```bash
docker stop {{ brand.package_path_name }}
docker rm {{ brand.package_path_name }}
docker rmi ghcr.io/euro-office/documentserver:latest
```
