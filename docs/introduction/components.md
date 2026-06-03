# Components

{{ brand.name }} is composed of several independent repositories. Each is built
and versioned separately; the top-level `DocumentServer` repository ties them
together via git submodules.

| Repository | Purpose |
|---|---|
| `server` | Node.js backend: DocService, FileConverter, AdminPanel, Metrics. |
| `web-apps` | Browser-based editors for documents, spreadsheets, presentations, PDFs, Visio. |
| `sdkjs` | JavaScript SDK implementing the Office Open XML document models. |
| `core` | C++ rendering and conversion engine. |
| `core-fonts` | Font assets bundled with the platform. |
| `DesktopEditors` | Native multi-format office suite for Windows, macOS, Linux. |
| `docker-base` | Base Docker image with build dependencies. |
| `docker-ci` | CI/build automation layers on top of `docker-base`. |
| `document-server-package` | M4-template-based DEB/RPM packaging. |
| `DocumentServer` | Top-level repository; aggregates the above as submodules. |
| `qa-acceptance` | Acceptance test suite for the platform. |

## How to navigate the source

If you are looking for…

- **Backend code (Node.js)** → `server/`
- **Editor UI** → `web-apps/`
- **Document model logic** → `sdkjs/`
- **Format converters / renderers (C++)** → `core/`
- **Build & Docker image definitions** → `DocumentServer/build/`
- **Local development environment** → `DocumentServer/develop/`
- **Packaging (DEB/RPM)** → `document-server-package/`

## Suggested reading order

If you are new to {{ brand.name }}, read in order:

1. [Architecture](architecture.md) — how the components fit together at runtime.
2. [Installation](../installation/docker.md) — production deployment paths in depth.
