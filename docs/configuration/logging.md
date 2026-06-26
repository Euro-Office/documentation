# Logging

Euro-Office Document Server uses [log4js](https://log4js-node.github.io/log4js-node/)
for its server-side logs. You control how much is logged with the log level, and
read the output from per-service log files.

## Log level

The level is set in the log4js config:

```
/etc/{{ brand.package_path_name }}/documentserver/log4js/production.json
```

Change `categories.default.level` (default `WARN`) to one of the log4js levels,
from least to most verbose:

```
OFF · FATAL · ERROR · WARN · INFO · DEBUG · TRACE
```

```json
{
  "categories": {
    "default": { "appenders": ["default"], "level": "DEBUG" }
  }
}
```

### Package install (deb/rpm)

Edit `production.json`, then restart the services to apply:

```bash
sudo systemctl restart ds-docservice ds-converter ds-metrics
```

### Docker

Do not edit the file by hand. Set the log level with an environment variable and
recreate the container; the entrypoint writes it into `production.json`:

```bash
docker run -d \
  --name {{ brand.package_path_name }} \
  --restart=unless-stopped \
  -p 80:80 \
  -e DS_LOG_LEVEL=DEBUG \
  ghcr.io/euro-office/documentserver:latest
```

!!! warning
    `DEBUG` and `TRACE` are verbose. Use them to diagnose a problem, then set the
    level back to `WARN` for normal operation.

## Log files

Logs are written per service under `/var/log/{{ brand.package_path_name }}/documentserver/`:

| File | Component |
|---|---|
| `docservice/out.log`, `docservice/err.log` | DocService (collaboration server) |
| `converter/out.log` | FileConverter (document conversion) |
| `metrics/out.log` | Metrics |
| `adminpanel/out.log` | Admin panel |
| `nginx.access.log` | nginx access log |

### Viewing logs in Docker

The application logs are written to the files above inside the container, not to
`docker logs`. Tail them directly:

```bash
docker exec {{ brand.package_path_name }} tail -f /var/log/{{ brand.package_path_name }}/documentserver/docservice/out.log
```

To keep logs on the host, mount the log directory as a volume
(`-v /path/to/logs:/var/log/{{ brand.package_path_name }}/documentserver`) as shown in the
[Docker installation guide](../installation/docker.md#persistent-data).
