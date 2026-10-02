# Installation Guide

Euro-Office Document Server can be installed in several ways depending on your environment and requirements.

## Supported platforms

| Platform | Version | Package |
|---|---|---|
| Ubuntu | 24.04 LTS | `.deb` |
| Debian | 12 (Bookworm) | `.deb` |
| Fedora | 41+ (tested on 44) | `.rpm` |
| Rocky Linux | 9 | `.rpm` |
| Docker | — | Container image |

## Choose your installation method

<div class="grid cards" markdown>

- :fontawesome-brands-ubuntu: **Ubuntu (deb)**

    ---

    Install from a `.deb` package on Ubuntu 24.04 LTS. Suitable for bare-metal and VMs.

    [:octicons-arrow-right-24: Ubuntu installation](ubuntu.md)

- :fontawesome-brands-docker: **Docker**

    ---

    Run the official container image. Quickest way to get started.

    [:octicons-arrow-right-24: Docker installation](docker.md)

- :fontawesome-brands-debian: **Debian (deb)**

    ---

    Install from a `.deb` package on Debian 12 (Bookworm).

    [:octicons-arrow-right-24: Debian installation](debian.md)

- :fontawesome-brands-fedora: **Fedora / Rocky Linux (rpm)**

    ---

    Install from an `.rpm` package on Fedora 41+ or Rocky Linux 9. Tested on Fedora 44 and Rocky Linux 9.

    [:octicons-arrow-right-24: Fedora / Rocky Linux installation](fedora.md)

</div>

## Verify your installation

Once installed, use the built-in example app to confirm the editor works end-to-end in a browser.

[:octicons-arrow-right-24: Testing with the example app](example.md)

## Running behind a reverse proxy

For production deployments you typically place the document server behind a reverse proxy that terminates TLS and forwards requests to it. The [document-server-proxy](https://github.com/Euro-Office/document-server-proxy) project provides a ready-made reverse proxy setup you can use as a starting point.

## Which method should I use?

| | Docker | Ubuntu (deb) | Debian (deb) | Fedora / Rocky (rpm) |
|---|---|---|---|---|
| Recommended for production | Yes | Yes | Yes | |
| Easiest to update | Yes | | | |
| Full OS control | | Yes | Yes | Yes |
| Nextcloud integration | Yes | Yes | Yes | Yes |