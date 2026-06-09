# Installation Guide

Euro-Office Document Server can be installed in several ways depending on your environment and requirements.

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

- :fontawesome-brands-fedora: **Fedora (rpm)**

    ---

    Install from an `.rpm` package on Fedora 41+. Tested on Fedora 44.

    [:octicons-arrow-right-24: Fedora installation](fedora.md)

</div>

## Verify your installation

Once installed, use the built-in example app to confirm the editor works end-to-end in a browser.

[:octicons-arrow-right-24: Testing with the example app](example.md)

## Which method should I use?

| | Docker | Ubuntu (deb) | Debian (deb) | Fedora (rpm) |
|---|---|---|---|---|
| Recommended for production | Yes | Yes | Yes | |
| Easiest to update | Yes | | | |
| Full OS control | | Yes | Yes | Yes |
| Nextcloud integration | Yes | Yes | Yes | Yes |
