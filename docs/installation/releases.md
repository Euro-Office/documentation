# Choose a build

Euro-Office is available in two distribution tracks: **Nextcloud Office**,
Nextcloud's production-ready distribution, and the **Euro-Office** community
builds. Both are built from the same publicly available source.

## Which build should I use?

|                              | Nextcloud Office                     | Euro-Office                    |
|------------------------------|--------------------------------------|--------------------------------|
| Audience                     | Production, enterprise, institutions | Developers, testers, community |
| Signed Desktop Editors       | Yes                                  | No                             |
| Package repositories         | Yes                                  | No                             |
| Nextcloud integration tested | Yes                                  | Best effort                    |
| Support                      | Nextcloud                            | Community                      |
| Source available             | Yes                                  | Yes                            |

If you want to try out the editors, or deploy them for your users,
Nextcloud Office is the recommended choice.

## Nextcloud Office builds

Nextcloud Office provides builds with additional quality assurance and
integration testing against Nextcloud releases:

- Signed Desktop Editors packages for Windows and macOS, verified for integrity
  and suitable for managed device rollouts
- Document Server and Desktop Editors `.deb`/`.rpm` package repositories
- Tested Nextcloud integration
- Support through Nextcloud's official channels

[Download Nextcloud Office Desktop Editors](https://github.com/nextcloud-releases/Office-DesktopEditors/releases/latest){ .md-button .md-button--primary }

## Euro-Office builds

Community builds are published under the Euro-Office name and are intended for
evaluation, testing, and open-source contribution. They are suitable for
developers and self-hosters who want to track changes closely or contribute to
the project.

Builds are published as GitHub releases and container images:

- Document Server `.deb`/`.rpm` packages: [Euro-Office/DocumentServer releases](https://github.com/Euro-Office/DocumentServer/releases/latest)
- Document Server container images: `ghcr.io/euro-office/documentserver`
- Desktop Editors: [Euro-Office/DesktopEditors releases](https://github.com/Euro-Office/DesktopEditors/releases/latest)

!!! warning
    Euro-Office Desktop Editors packages are not code-signed. Euro-Office builds
    are not recommended for regulated environments or managed device rollouts.
