# Installation Guide

Euro-Office Document Server can be installed in several ways depending on your environment and requirements.

!!! tip "Euro-Office or Nextcloud Office?"
    Nextcloud Office is the signed and supported distribution of Euro-Office for production use, while Euro-Office builds are community builds for testing and contributing. See [Choose a build](releases.md) for details.

## Downloads

### :material-monitor: Desktop apps

Desktop editors for working on documents offline, on Windows, macOS, and Linux.

=== "Nextcloud Office"

    Signed builds, recommended for managed devices.

    | Operating system | Architecture | Package | |
    |---|---|---|---|
    | :fontawesome-brands-windows: Windows | x64, arm64 | `.exe` (signed) | [Download](https://github.com/nextcloud-releases/Office-DesktopEditors/releases/latest){ .md-button .md-button--primary } |
    | :fontawesome-brands-apple: macOS | Apple Silicon | `.dmg` (signed) | [Download](https://github.com/nextcloud-releases/Office-DesktopEditors/releases/latest){ .md-button .md-button--primary } |
    | :fontawesome-brands-ubuntu: :fontawesome-brands-debian: Linux (Ubuntu, Debian) | x86_64, aarch64 | `.deb` | [Download](https://github.com/nextcloud-releases/Office-DesktopEditors/releases/latest){ .md-button .md-button--primary } [Repository](#nextcloud-office-package-repository){ .md-button } |
    | :fontawesome-brands-fedora: Linux (Fedora) | x86_64, aarch64 | `.rpm` | [Download](https://github.com/nextcloud-releases/Office-DesktopEditors/releases/latest){ .md-button .md-button--primary } [Repository](#nextcloud-office-package-repository){ .md-button } |

=== "Euro-Office"

    Unsigned community builds.

    | Operating system | Architecture | Package | |
    |---|---|---|---|
    | :fontawesome-brands-windows: Windows | x64, arm64 | `.exe`, `.zip` | [Download](https://github.com/Euro-Office/DesktopEditors/releases/latest){ .md-button } |
    | :fontawesome-brands-apple: macOS | Apple Silicon | `.dmg` | [Download](https://github.com/Euro-Office/DesktopEditors/releases/latest){ .md-button } |
    | :fontawesome-brands-ubuntu: :fontawesome-brands-debian: Linux (Ubuntu, Debian) | amd64, arm64 | `.deb` | [Download](https://github.com/Euro-Office/DesktopEditors/releases/latest){ .md-button } |
    | :fontawesome-brands-fedora: Linux (Fedora) | x86_64, aarch64 | `.rpm` | [Download](https://github.com/Euro-Office/DesktopEditors/releases/latest){ .md-button } |
    | :fontawesome-brands-linux: Linux (other) | x86_64, aarch64 | `.tar.xz` | [Download](https://github.com/Euro-Office/DesktopEditors/releases/latest){ .md-button } |

### :material-server: Document Server

The Document Server is not a standalone application. It provides the editors and collaboration backend, and needs a platform that stores the files and provides the user interface, such as [Nextcloud](../integration/nextcloud.md).

=== "Nextcloud Office"

    Packages are available from the [package repository](#nextcloud-office-package-repository) and on [nextcloud-releases/Office-DocumentServer](https://github.com/nextcloud-releases/Office-DocumentServer/releases). The container image is not available yet, use the Euro-Office image until then.

    | Platform | Architecture | Package | |
    |---|---|---|---|
    | :fontawesome-brands-ubuntu: Ubuntu 24.04 LTS, :fontawesome-brands-debian: Debian 12 | amd64, arm64 | `.deb` | [Download](https://github.com/nextcloud-releases/Office-DocumentServer/releases){ .md-button .md-button--primary } [Repository](#nextcloud-office-package-repository){ .md-button } |
    | :fontawesome-brands-fedora: Fedora 41+ | x86_64, aarch64 | `.rpm` | [Download](https://github.com/nextcloud-releases/Office-DocumentServer/releases){ .md-button .md-button--primary } [Repository](#nextcloud-office-package-repository){ .md-button } |
    | :fontawesome-brands-docker: Docker | amd64, arm64 | Container image | Coming soon |

=== "Euro-Office"

    | Platform | Architecture | Package | | |
    |---|---|---|---|---|
    | :fontawesome-brands-ubuntu: Ubuntu 24.04 LTS, :fontawesome-brands-debian: Debian 12 | amd64, arm64 | `.deb` | [Download](https://github.com/Euro-Office/DocumentServer/releases/latest){ .md-button .md-button--primary } | [Ubuntu docs](ubuntu.md){ .md-button } [Debian docs](debian.md){ .md-button } |
    | :fontawesome-brands-fedora: Fedora 41+ | x86_64, aarch64 | `.rpm` | [Download](https://github.com/Euro-Office/DocumentServer/releases/latest){ .md-button .md-button--primary } | [Documentation](fedora.md){ .md-button } |
    | :fontawesome-brands-docker: Docker | amd64, arm64 | Container image | [Download](https://github.com/Euro-Office/DocumentServer/pkgs/container/documentserver){ .md-button .md-button--primary } | [Documentation](docker.md){ .md-button } |

Download buttons open the latest release, pick the file for your architecture there.

### :material-package-variant: Nextcloud Office package repository

Nextcloud Office provides signed APT and DNF repositories at [`https://download.nextcloud.com/office/repo`](https://download.nextcloud.com/office/repo/) for the Document Server (`nextcloud-office-documentserver`) and the Desktop Editors (`nextcloud-office-nextcloudoffice`). Installing from the repository keeps your packages up to date with regular system updates.

=== "Ubuntu / Debian"

    ```bash
    sudo install -d -m 0755 /etc/apt/keyrings
    sudo curl -fsSL https://download.nextcloud.com/office/repo/nextcloud-office.asc \
      -o /etc/apt/keyrings/nextcloud-office.asc
    echo "deb [signed-by=/etc/apt/keyrings/nextcloud-office.asc] https://download.nextcloud.com/office/repo/deb stable main" \
      | sudo tee /etc/apt/sources.list.d/nextcloud-office.list
    sudo apt-get update
    ```

    Install the Desktop Editors with `sudo apt-get install nextcloud-office-nextcloudoffice`. For the Document Server, follow the [Ubuntu](ubuntu.md) or [Debian](debian.md) guide.

=== "Fedora"

    ```bash
    sudo tee /etc/yum.repos.d/nextcloud-office.repo > /dev/null << 'EOF'
    [nextcloud-office]
    name=Nextcloud Office
    baseurl=https://download.nextcloud.com/office/repo/rpm/stable/$basearch
    enabled=1
    gpgcheck=1
    repo_gpgcheck=1
    gpgkey=https://download.nextcloud.com/office/repo/nextcloud-office.asc
    EOF
    sudo rpm --import https://download.nextcloud.com/office/repo/nextcloud-office.asc
    ```

    Install the Desktop Editors with `sudo dnf install nextcloud-office-nextcloudoffice`. For the Document Server, follow the [Fedora](fedora.md) guide.

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

## Running behind a reverse proxy

For production deployments you typically place the document server behind a reverse proxy that terminates TLS and forwards requests to it. The [document-server-proxy](https://github.com/Euro-Office/document-server-proxy) project provides a ready-made reverse proxy setup you can use as a starting point.

## Which method should I use?

| | Docker | Ubuntu (deb) | Debian (deb) | Fedora (rpm) |
|---|---|---|---|---|
| Easiest to update | Yes | | | |
| Full OS control | | Yes | Yes | Yes |
| Nextcloud integration | Yes | Yes | Yes | Yes |
