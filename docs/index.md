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

    Docker, Ubuntu (deb), and Fedora (rpm) installation guides.

    [:octicons-arrow-right-24: Installation guide](installation/index.md)

-   :material-code-tags:{ .lg .middle } **Develop**

    ---

    Build {{ brand.name }} from source, run the dev environment, contribute.

    [:octicons-arrow-right-24: Developer setup](development/setup.md)

-   :material-hammer-wrench:{ .lg .middle } **Build**

    ---

    Build the Docker image and distribution packages from source.

    [:octicons-arrow-right-24: Building from source](development/building.md)

</div>

## What's inside

- **[Introduction](introduction/overview.md)** — what {{ brand.name }} is and how its pieces fit together.
- **[Installation](installation/index.md)** — production deployment via Docker, Ubuntu (deb), and Fedora (rpm).
- **[Integration](integration/nextcloud.md)** — connecting {{ brand.name }} to Nextcloud and other DMS platforms.
- **[Development](development/building.md)** — building {{ brand.name }} from source.
