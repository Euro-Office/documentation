# Installing Plugins

Plugins extend the editors with extra panels and tools. Once installed on the
server, a plugin is available to all users. For a list of plugins known to work
with Euro-Office, see [Plugins](../integration/plugins.md).

Plugins live in the `sdkjs-plugins` directory of the document server:

```
/var/www/euro-office/documentserver/sdkjs-plugins/
```

## Package install (deb/rpm)

1. Place the plugin in the plugins directory, each plugin in its own folder:

    ```bash
    sudo git clone https://github.com/example/my-plugin \
      /var/www/euro-office/documentserver/sdkjs-plugins/my-plugin
    ```

2. Register it and reload the editors:

    ```bash
    sudo documentserver-pluginsmanager.sh
    ```

    This fixes file ownership, restarts the document service, and flushes the
    editor cache so the plugin appears.

## Docker

Copy the plugin into the running container and register it:

```bash
docker cp my-plugin euro-office:/var/www/euro-office/documentserver/sdkjs-plugins/
docker exec euro-office documentserver-pluginsmanager.sh
```

!!! note
    Plugins copied into a container are lost when the container is recreated. To
    keep them, mount the plugin on a host volume and re-run the register command
    after recreating the container, or bake it into a custom image.
