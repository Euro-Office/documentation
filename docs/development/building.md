# Building from source

{{ brand.name }} builds entirely inside Docker via `docker buildx bake`, so
the only host requirements are Docker + buildx and Git.

## Build the Docker image

```bash
cd DocumentServer/build
docker buildx bake
```

This produces the same image published as `{{ brand.image }}`.

## Pin a version

```bash
PRODUCT_VERSION=8.1.0 docker buildx bake
```

`PRODUCT_VERSION` is stamped into the image and surfaced via `/healthcheck`.

## Build distribution packages

```bash
docker buildx bake packages
```

Produces `.deb` and `.rpm` artifacts under `out/`. See
[packaging plan]({{ brand.repo }}/DocumentServer/blob/main/deb-plan.md) for
the layout these packages target.

## Prerequisites

The full prerequisite checklist (Docker user-without-root, buildx container
driver, Git SSH keys) is documented in
[`DocumentServer/build/BUILD_REQUISITES.md`]({{ brand.repo }}/DocumentServer/blob/main/build/BUILD_REQUISITES.md).
That file is the current source of truth.

!!! note "Coming soon"
    Migration of the BUILD_REQUISITES content into this page, plus
    documentation for the `cluster` and `develop` bake groups.
