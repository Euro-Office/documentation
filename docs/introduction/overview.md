# Overview

{{ brand.name }} is a self-hostable office suite combining a real-time
collaborative document server, web-based editors for documents, spreadsheets,
presentations, and PDFs, and desktop editors for Windows, macOS, and Linux.

It is a fork of ONLYOFFICE Document Server, maintained independently to ship
on a release schedule and packaging story that fits sovereign-cloud deployments.

## What you get

- **Document server** — real-time collaboration, format conversion, REST API.
- **Web editors** — Word/Excel/PowerPoint-compatible editors that run in any browser.
- **Desktop editors** — native applications for offline editing.
- **DMS-friendly** — Nextcloud integration is first-class; the REST API also
  supports custom DMS integrations.

## What this documentation covers

- Installation across Docker, package managers, and native binaries.
- Configuration of databases, message queues, storage backends, and TLS.
- Integration with Nextcloud and other document-management systems.
- Operating a {{ brand.name }} deployment: monitoring, backups, upgrades.
- Building {{ brand.name }} from source and contributing changes.

## What this documentation does *not* cover

- Code-level API reference
- End user documentation

## Where to go next

- New to {{ brand.name }}? Start with the [architecture overview](architecture.md).
- Ready to run something? Jump to the [Docker installation](../installation/docker.md).
- Building from source? See the [developer setup](../development/setup.md).
