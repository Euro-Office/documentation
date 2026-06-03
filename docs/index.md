---
hide:
  - navigation
  - toc
---

# {{ brand.name }} Documentation

> {{ brand.tagline }}

{{ brand.name }} is a self-hostable document server — documents, spreadsheets,
presentations, and PDFs — designed to integrate with a platform such as Nextcloud.

It is not a standalone application; it requires a compatible storage backend to provide the user interface and file storage.

<div class="grid cards" markdown>

-   :material-rocket-launch:{ .lg .middle } **Quickstart**

    ---

    Get {{ brand.name }} running and connected to your platform in minutes.

    [:octicons-arrow-right-24: Install with Docker](installation/docker.md)

-   :material-package-down:{ .lg .middle } **Install**

    ---

    Docker, Docker Compose, Debian/Ubuntu, and RHEL/Fedora installation paths.

    [:octicons-arrow-right-24: Installation guide](installation/docker.md)

-   :material-code-tags:{ .lg .middle } **Develop**

    ---

    Build {{ brand.name }} from source, run the dev environment, contribute.

    [:octicons-arrow-right-24: Developer setup](development/setup.md)


</div>

## What's inside

- **[Introduction](introduction/overview.md)** — what {{ brand.name }} is and how its pieces fit together.
- **[Installation](installation/docker.md)** — production deployment via Docker, packages, and native installs.
- **[Integration](integration/nextcloud.md)** — connecting {{ brand.name }} to Nextcloud and other DMS platforms.
- **[Development](development/setup.md)** — building {{ brand.name }} from source.
