# Installing Plugins

Plugins extend the editors with extra panels and tools. Once installed on the
server, a plugin is available to all users of that document server. This guide
applies to self-hosted Euro-Office installations.

Plugins live in the `sdkjs-plugins` directory of the document server:

```
/var/www/{{ brand.package_path_name }}/documentserver/sdkjs-plugins/
```

## Finding plugins

!!! note "No app directory yet"

    Euro-Office does not yet have an in-product app directory for browsing and
    installing plugins. Until then, install plugins manually as described below.
    For a curated list of plugins known to work with Euro-Office, see
    [Plugins](../integration/plugins.md).

Because Euro-Office is a fork of ONLYOFFICE, plugins built for the ONLYOFFICE
editors are generally compatible. Each plugin is a folder containing a
`config.json` manifest and its assets. The upstream plugins are maintained
together in one repository, with each plugin under
[`sdkjs-plugins/content`](https://github.com/ONLYOFFICE/onlyoffice.github.io/tree/master/sdkjs-plugins/content)
(`wordscounter`, `thesaurus`, `translator`, and others). Before installing,
check that the plugin supports your editor version.

## Package install (deb/rpm)

1. Get the plugin folder you want. Since the upstream plugins live in a single
   repository, clone it and copy the individual plugin into the plugins
   directory:

    ```bash
    git clone --depth 1 https://github.com/ONLYOFFICE/onlyoffice.github.io
    sudo cp -r onlyoffice.github.io/sdkjs-plugins/content/wordscounter \
      /var/www/{{ brand.package_path_name }}/documentserver/sdkjs-plugins/
    ```

    For a plugin distributed in its own repository, clone it directly into a
    folder under `sdkjs-plugins/` instead.

2. Register it and reload the editors:

    ```bash
    sudo documentserver-pluginsmanager.sh
    ```

    This fixes file ownership, restarts the document service, and flushes the
    editor cache so the plugin appears.

## Docker

Mount the plugin from the host so it survives container recreation. Clone the
plugin folder to a directory on the host and bind-mount it into the document
server's `sdkjs-plugins` directory:

```bash
git clone --depth 1 https://github.com/ONLYOFFICE/onlyoffice.github.io
cp -r onlyoffice.github.io/sdkjs-plugins/content/wordscounter \
  /path/on/your/host/plugins/wordscounter
```

```bash
docker run -d \
  --name {{ brand.package_path_name }} \
  --restart=unless-stopped \
  -p 80:80 \
  -e JWT_ENABLED=true \
  -e JWT_SECRET=at-least-32-chars-long-for-hs256 \
  -v /path/on/your/host/plugins/wordscounter:/var/www/{{ brand.package_path_name }}/documentserver/sdkjs-plugins/wordscounter \
  ghcr.io/euro-office/documentserver:latest
```

Mount each plugin into its own subdirectory under `sdkjs-plugins/` rather than
mounting over the whole directory, which would hide the built-in plugins. After
starting the container, register the plugin so the editors pick it up:

```bash
docker exec {{ brand.package_path_name }} documentserver-pluginsmanager.sh
```

!!! tip
    Mounting keeps the plugin on the host, so it persists when the container is
    recreated. You only need to re-run the register command after recreating the
    container.

## Per-user plugins from the editor

The above installs a plugin server-wide for every user. The editors also include
a built-in **Plugins** tab with a plugin manager, where individual users can add
plugins for their own session without server access. This is useful for testing
a plugin before deploying it for everyone.

## Removing a plugin

Remove the plugin's folder and re-register so the editors stop loading it.

=== "Package install"

    ```bash
    sudo rm -rf /var/www/{{ brand.package_path_name }}/documentserver/sdkjs-plugins/wordscounter
    sudo documentserver-pluginsmanager.sh
    ```

=== "Docker"

    Remove the `-v` mount for the plugin and recreate the container, then delete
    the plugin folder from the host:

    ```bash
    rm -rf /path/on/your/host/plugins/wordscounter
    ```
