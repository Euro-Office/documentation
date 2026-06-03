# Developer setup

The full {{ brand.name }} stack runs locally via the docker-compose-based
environment in
[`DocumentServer/develop/`]({{ brand.repo }}/DocumentServer/tree/main/develop).
It builds each component from source, exposes hot-reload paths for the editor
UI, and includes a paired Nextcloud instance for end-to-end testing.

## Prerequisites

- Docker 24+ with `buildx`.
- 16 GB RAM minimum (the first build is heavy).
- Git with SSH access to `{{ brand.repo }}`.
- A Linux x86_64 or arm64 host. macOS works for everything except native-core
  C++ debugging.

## Clone and bootstrap

```bash
git clone --recurse-submodules {{ brand.repo }}/DocumentServer.git
cd DocumentServer/develop
./scripts/up.sh        # placeholder — exact entrypoint TBD
```

## Layout of the dev environment

The compose file spins up:

- {{ brand.name }} document server (built from local source).
- Nextcloud (with the {{ brand.name }} integration app pre-installed).
- PostgreSQL, Redis, RabbitMQ.
- An nginx front-end with self-signed TLS.

## Mobile / non-localhost testing

When testing from a phone or a separate machine, override the public URL via
the docker-compose `.env` so the editor connects through your LAN IP.

!!! note "Coming soon"
    The full reference for the develop environment, migrated from
    [`DocumentServer/develop/README.md`]({{ brand.repo }}/DocumentServer/blob/main/develop/README.md).
    That document is currently the source of truth.
