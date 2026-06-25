# Building from source

{{ brand.name }} builds entirely inside Docker via `docker buildx bake`. The only
host requirements are Docker with the buildx container driver, and Git with SSH
access to the repositories.

## Prerequisites

Before building for the first time, complete the one-time setup described in
[`build/BUILD_REQUISITES.md`]({{ brand.repo }}/DocumentServer/blob/main/build/BUILD_REQUISITES.md):

- Docker CE installed (not `podman` — RHEL-based systems default to podman)
- Your build user added to the `docker` group and re-logged in
- A buildx container driver created and bootstrapped:

    ```bash
    docker buildx create \
      --name container-builder \
      --driver docker-container \
      --use

    docker buildx inspect --bootstrap
    ```

- SSH key added to your GitHub profile (for submodule access)

## Clone the repository

```bash
git clone --recurse-submodules git@github.com:Euro-Office/DocumentServer.git
cd DocumentServer
```

If you already cloned without `--recurse-submodules`:

```bash
git submodule update --init --recursive
```

## Build the Docker image

All build commands run from the `build/` subdirectory:

```bash
cd DocumentServer/build
BUILDX_BAKE_ENTITLEMENTS_FS=0 docker buildx bake --allow=fs.read=.. --load
```

This builds the `standalone` target (the default group) and loads the resulting
image into your local Docker daemon as `ghcr.io/euro-office/documentserver:latest`.

**Why these flags:**

| Flag | Reason |
|---|---|
| `BUILDX_BAKE_ENTITLEMENTS_FS=0` | Newer BuildKit versions gate filesystem access behind entitlement checks. This disables the check since the access is explicitly granted below. |
| `--allow=fs.read=..` | The build reads source files from the parent directory (`context = ".."` in `docker-bake.hcl`). BuildKit requires explicit permission for this. |
| `--load` | Imports the finished image into the local Docker daemon. Without this flag the image is built but not accessible via `docker run`. |

Verify the image was created:

```bash
docker images ghcr.io/euro-office/documentserver
```

## Run and verify the image

Start the locally built image:

```bash
docker run -d \
  --name euro-office-dev \
  --restart=unless-stopped \
  -p 8080:80 \
  -e JWT_ENABLED=true \
  -e JWT_SECRET=at-least-32-chars-long-for-hs256 \
  ghcr.io/euro-office/documentserver:latest
```

Wait for the container to finish initialising, then check the health endpoint:

```bash
curl http://localhost:8080/healthcheck
```

Expected output: `true`

To open the built-in example app in a browser:

```bash
docker run -d \
  --name euro-office-dev \
  --restart=unless-stopped \
  -p 8080:80 \
  -e JWT_ENABLED=true \
  -e JWT_SECRET=at-least-32-chars-long-for-hs256 \
  -e EXAMPLE_ENABLED=true \
  ghcr.io/euro-office/documentserver:latest
```

Then open `http://localhost:8080/example/` in your browser.

Stop and remove the container when done:

```bash
docker stop euro-office-dev && docker rm euro-office-dev
```

## Build a branded image

The default build produces a Euro-Office image. To build for a different brand
(e.g. Nextcloud Office), include the brand-specific HCL file alongside the main
bake file:

```bash
cd DocumentServer/build
BUILDX_BAKE_ENTITLEMENTS_FS=0 docker buildx bake \
  -f docker-bake.hcl \
  -f brands/nextcloud-office-brand/brand-server.hcl \
  --allow=fs.read=.. \
  --allow=fs=./brands/nextcloud-office-brand/generated \
  --load
```

The additional `--allow=fs=./brands/nextcloud-office-brand/generated` flag grants
BuildKit write access to the directory where the brand asset generation step
exports its output.

**What changes in a branded build:**

| | Default (Euro-Office) | Branded (Nextcloud Office) |
|---|---|---|
| Image tag | `ghcr.io/euro-office/documentserver:latest` | `ghcr.io/nextcloud-office/documentserver:latest` |
| Install path inside image | `/var/www/euro-office/` | `/var/www/nextcloud-office/` |
| `COMPANY_NAME` env var | `Euro-Office` | `Nextcloud Office` |
| Visual assets | Built-in defaults | Generated from `brands/nextcloud-office-brand/svg/` |

**How the brand asset pipeline works:**

Including a brand HCL overrides the dummy `brand-icons` target in `docker-bake.hcl`
with a real build step. That step runs `build-icons.bake.Dockerfile` — an Alpine
container with `rsvg-convert` — which renders the five source SVGs into PNGs, ICOs,
and correctly named SVG copies for each component (server admin panel, welcome page,
example app). The generated files are written to
`brands/nextcloud-office-brand/generated/` and then injected into the `server`,
`example`, and `packages` build stages via `COPY --from=brand-icons`.

**Customising the visual identity:**

The visual output depends entirely on the five source SVGs in
`brands/nextcloud-office-brand/svg/`:

```
svg/
  logo-dark.svg        # square app icon, dark theme
  logo-light.svg       # square app icon, light theme
  logo-large-dark.svg  # wide logo, dark theme
  logo-large-light.svg # wide logo, light theme
  splash.svg           # splash screen
```

Replace these files with your own artwork and rebuild. Everything in `generated/`
is derived from them — do not edit the generated files directly.

!!! note
    The `nextcloud-office-brand` source SVGs currently contain the same artwork as
    the Euro-Office defaults. A branded build will compile and run correctly, but
    will look identical until different SVG files are placed in `svg/`.

## Build targets

| Target / group | Command | Output |
|---|---|---|
| `standalone` (default) | `docker buildx bake` | `ghcr.io/euro-office/documentserver:latest` |
| `develop` | `docker buildx bake develop` | `ghcr.io/euro-office/documentserver:latest-dev` — includes build tools |
| `packages` | `docker buildx bake packages` | `.deb` and `.rpm` files in `build/deploy/packages/` |
| `cluster` | `docker buildx bake cluster` | Orchestrated cluster images (`cluster-docs`, `cluster-example`, `cluster-utils`) |

## Override the version

The version is read from the `VERSION` file at the repository root. Override it at
build time via environment variables:

```bash
PRODUCT_VERSION=9.3.1 BUILD_NUMBER=42 \
  BUILDX_BAKE_ENTITLEMENTS_FS=0 \
  docker buildx bake --allow=fs.read=.. --load
```

`BUILD_NUMBER` is appended to the version string (e.g. `9.3.1-42`). It defaults
to `dev.1` when not set.

## Build distribution packages

```bash
cd DocumentServer/build
BUILDX_BAKE_ENTITLEMENTS_FS=0 docker buildx bake packages \
  --allow=fs.read=.. \
  --allow=fs=./deploy/packages
```

Packages are written to `build/deploy/packages/`. Both `.deb` and `.rpm` are
produced for each architecture in a single run:

```
deploy/packages/
  euro-office-documentserver_9.3.1-dev.1_arm64.deb
  euro-office-documentserver-9.3.1-dev.1.aarch64.rpm
```

The `--allow=fs=./deploy/packages` flag grants BuildKit write access to that
output directory.

!!! warning "Output directory is not cleared between runs"
    The `deploy/packages/` directory accumulates packages across builds. Remove
    old packages before building if you want only the current run's output:

    ```bash
    rm -rf deploy/packages && mkdir -p deploy/packages
    ```

!!! note
    The `packages` target builds the full source first (same pipeline as `standalone`)
    before producing the packages. Expect the same build time as a full image build
    on a cold cache.

### Override version and build number

```bash
PRODUCT_VERSION=9.3.1 BUILD_NUMBER=42 \
  BUILDX_BAKE_ENTITLEMENTS_FS=0 \
  docker buildx bake packages \
  --allow=fs.read=.. \
  --allow=fs=./deploy/packages
```

This produces `euro-office-documentserver_9.3.1-42_<arch>.deb` and the equivalent `.rpm`.

## Troubleshooting

### Cache layer lock errors

When building with a warm cache, multiple targets may attempt to write the same
cache layer in parallel, producing errors like:

```
ERROR: (*service).Write failed: rpc error: code = Unavailable desc = ref layer-sha256:... locked
```

These are transient and BuildKit retries them automatically — the build completes
successfully. If the errors cause an actual build failure, disable cache writes
for that run:

```bash
BUILDX_BAKE_ENTITLEMENTS_FS=0 docker buildx bake \
  --allow=fs.read=.. \
  --load \
  --set "*.cache-to="
```

### Broken build cache

If a build stalls or fails with errors about missing paths inside the build cache
(e.g. `cannot change to '/build-cache1/third_party/workdir/icu/icu'`), prune the
BuildKit cache and retry:

```bash
docker buildx prune -a
```
