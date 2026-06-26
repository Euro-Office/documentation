# Installing Custom Fonts

Euro-Office Document Server ships with a built-in font set. To make additional fonts available in the editors, add them to the server and regenerate the font cache.

Supported formats: TrueType (`.ttf`, `.tte`), OpenType (`.otf`, `.otc`, `.ttc`), and Web Open Font Format (`.woff`, `.woff2`).

## Bare-metal (deb/rpm)

1. Copy your font files to `/usr/share/fonts/`:

    ```bash
    sudo cp myfont.ttf /usr/share/fonts/
    ```

2. Regenerate the font cache:

    ```bash
    sudo documentserver-generate-allfonts.sh
    ```

The new fonts appear in the editor font list. No restart is required.

## Docker

Mount a host directory with your fonts into the container and let it regenerate the cache on startup:

```bash
docker run -d \
  --name {{ brand.package_path_name }} \
  --restart=unless-stopped \
  -p 80:80 \
  -e JWT_ENABLED=true \
  -e JWT_SECRET=at-least-32-chars-long-for-hs256 \
  -v /path/on/your/host/fonts:/usr/share/fonts/custom \
  ghcr.io/euro-office/documentserver:latest
```

Fonts are picked up automatically because `GENERATE_FONTS` is enabled by default. To add fonts to a running container, drop the files into the host directory and restart it:

```bash
docker restart {{ brand.package_path_name }}
```
