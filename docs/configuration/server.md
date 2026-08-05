# Server Configuration

Euro-Office Document Server is configured in one of two ways depending on how it
was installed:

- **Package install (deb/rpm)** — edit a JSON config file on disk.
- **Docker** — set environment variables; the container writes the config file for you on startup.

Both end up writing the same file: `local.json`.

## The configuration file

Settings live in `/etc/{{ brand.package_path_name }}/documentserver/`, loaded in this order, with
later files overriding earlier ones:

```
default.json  →  production-linux.json  →  local.json
```

!!! warning
    Do not edit `default.json` or `production-linux.json`. They are replaced on
    upgrade. Put all of your changes in `local.json`.

Create `local.json` next to `default.json` and include only the keys you are
changing, keeping the full nested structure. For example, to set the JWT secret
and point at an external PostgreSQL database:

```json
{
  "services": {
    "CoAuthoring": {
      "secret": {
        "inbox":  { "string": "at-least-32-chars-long-for-hs256" },
        "outbox": { "string": "at-least-32-chars-long-for-hs256" },
        "session": { "string": "at-least-32-chars-long-for-hs256" }
      },
      "sql": {
        "type": "postgres",
        "dbHost": "db.internal",
        "dbName": "eurooffice",
        "dbUser": "eurooffice",
        "dbPass": "your-password"
      }
    }
  }
}
```

The JWT secret must be at least **32 characters** long. This is required by the
HS256 signing algorithm used by the document server and the Nextcloud integration.
A secret shorter than 32 characters will be rejected when signing or verifying
tokens. Generate a suitable secret with:

```bash
openssl rand -hex 32
```

Restart the server to apply changes:

```bash
sudo supervisorctl restart all
```

## Common settings

| Setting | Key path in `local.json` |
|---|---|
| JWT enabled (incoming) | `services.CoAuthoring.token.enable.browser`, `…token.enable.request.inbox` |
| JWT enabled (outgoing) | `services.CoAuthoring.token.enable.request.outbox` |
| JWT secret | `services.CoAuthoring.secret.{inbox,outbox,session}.string` |
| JWT header / in-body | `services.CoAuthoring.token.inbox.header`, `…token.inbox.inBody` |
| Database | `services.CoAuthoring.sql.{type,dbHost,dbPort,dbName,dbUser,dbPass}` |
| Redis | `services.CoAuthoring.redis.{host,port}` |
| RabbitMQ | `rabbitmq.url` |
| WOPI | `wopi.enable` |
| Allow private-IP requests | `services.CoAuthoring.request-filtering-agent.allowPrivateIPAddress` |

## Docker

In Docker you do not edit `local.json` directly. Set environment variables and
the container generates `local.json` on startup. To change a setting later,
update the variable and recreate the container.

```bash
docker run -d \
  --name {{ brand.package_path_name }} \
  --restart=unless-stopped \
  -p 80:80 \
  -e JWT_SECRET=at-least-32-chars-long-for-hs256 \
  -e DB_TYPE=postgres \
  -e DB_HOST=db.internal \
  -e DB_NAME=eurooffice \
  -e DB_USER=eurooffice \
  -e DB_PWD=your-password \
  ghcr.io/euro-office/documentserver:latest
```

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `JWT_ENABLED` | `true` | Enable JWT validation |
| `JWT_SECRET` | random | Shared JWT secret (see note below) |
| `JWT_SECRET_INBOX` / `JWT_SECRET_OUTBOX` | `JWT_SECRET` | Separate secrets per direction |
| `JWT_HEADER` | `Authorization` | HTTP header carrying the token |
| `JWT_HEADER_INBOX` / `JWT_HEADER_OUTBOX` | `JWT_HEADER` | Separate headers per direction |
| `JWT_IN_BODY` | `false` | Accept the token in the request body |
| `JWT_ENABLED_INBOX` / `JWT_ENABLED_OUTBOX` | `JWT_ENABLED` | Enable JWT per direction |
| `DB_TYPE` | `postgres` | Database engine. The standalone image supports `postgres` only; other engines require the cluster image |
| `DB_HOST` | `localhost` | Database host |
| `DB_PORT` | `5432` | Database port |
| `DB_NAME` | `eurooffice` | Database name |
| `DB_USER` | `eurooffice` | Database user |
| `DB_PWD` | — | Database password |
| `AMQP_HOST` | `localhost` | RabbitMQ host |
| `AMQP_PORT` | `5672` | RabbitMQ port |
| `AMQP_USER` / `AMQP_PWD` | `guest` | RabbitMQ credentials |
| `REDIS_SERVER_HOST` | `localhost` | Redis host |
| `REDIS_SERVER_PORT` | `6379` | Redis port |
| `REDIS_SERVER_PASS` | — | Redis password |
| `WOPI_ENABLED` | `false` | Enable WOPI protocol support |
| `PLUGINS_ENABLED` | `true` | Enable editor plugins |
| `METRICS_ENABLED` | `false` | Send StatsD metrics |
| `METRICS_HOST` | `localhost` | StatsD host |
| `METRICS_PORT` | `8125` | StatsD port |
| `METRICS_PREFIX` | `ds.` | StatsD metric name prefix |
| `GENERATE_FONTS` | `true` | Regenerate the font cache on startup |
| `ALLOW_PRIVATE_IP_ADDRESS` | `false` | Allow fetching documents from private IPs |
| `NGINX_WORKER_PROCESSES` | `1` | Number of nginx worker processes |
| `NGINX_CLIENT_MAX_BODY_SIZE` | `100m` | Nginx client max body size (upload limit for nginx) |
| `NGINX_ACCESS_LOG` | `false` | Enable nginx access log |
| `FILECONVERTER_MAX_DOWNLOAD_BYTES` | `524288000` | Max file download size for the FileConverter in bytes (default 500 MB) |
| `FILECONVERTER_INPUT_LIMIT_UNCOMPRESSED` | `500MB` | Max uncompressed zip size for office files (docx, xlsx, pptx, vsdx) |
| `MAX_FILE_SIZE` | `104857600` | Max temp file upload size in bytes (default 100 MB) |
| `ALLOW_META_IP_ADDRESS` | `false` | Allow fetching documents from meta-private IPs (169.254.0.0/16) |
| `USE_UNAUTHORIZED_STORAGE` | `false` | Allow fetching documents from HTTP (non-TLS) storage |
| `SSL_VERIFY_CLIENT` | `off` | Enable SSL client certificate verification |
| `ONLYOFFICE_HTTPS_HSTS_ENABLED` | `true` | Enable HSTS headers |
| `ONLYOFFICE_HTTPS_HSTS_MAXAGE` | `31536000` | HSTS max-age in seconds |

!!! tip "Size limits — what they mean for your users"
    Each limit guards a different stage of the file lifecycle. Imagine a user tries to
    open a **200 MB `.pptx`** file:

    **1. Nginx accepts the upload** — `NGINX_CLIENT_MAX_BODY_SIZE` must be higher than
    the file. Default is `100m`. With a 200 MB file the user gets
    `413 Request Entity Too Large`. Set it to `250m`:

    ```bash
    -e NGINX_CLIENT_MAX_BODY_SIZE=250m
    ```

    **2. Document Server temp file** — `MAX_FILE_SIZE` gates the internal upload buffer
    (bytes). Default is `104857600` (100 MB). A 200 MB file fails here too. Set it to
    `268435456` (256 MB):

    ```bash
    -e MAX_FILE_SIZE=268435456
    ```

    **3. FileConverter downloads the file** — `FILECONVERTER_MAX_DOWNLOAD_BYTES` is the
    max bytes the converter will fetch (default `524288000` = 500 MB). Already
    sufficient for a 200 MB file. No change needed.

    **4. FileConverter unzips the archive** — `FILECONVERTER_INPUT_LIMIT_UNCOMPRESSED`
    checks the internal XML size. A 200 MB `.pptx` on disk might contain 800 MB of
    uncompressed XML data (especially with embedded images, shapes, or animations).
    The 500 MB default may be too low. Set it to `800MB`:

    ```bash
    -e FILECONVERTER_INPUT_LIMIT_UNCOMPRESSED=800MB
    ```

    | Stage | Variable | Value for 200 MB PPTX |
    |---|---|---|
    | Nginx upload | `NGINX_CLIENT_MAX_BODY_SIZE` | `250m` |
    | Temp file buffer | `MAX_FILE_SIZE` | `268435456` (bytes) |
    | Converter download | `FILECONVERTER_MAX_DOWNLOAD_BYTES` | `524288000` (default OK) |
    | Uncompressed XML size | `FILECONVERTER_INPUT_LIMIT_UNCOMPRESSED` | `800MB` (if needed) |

    Office files are ZIP archives containing XML. The uncompressed limit protects
    against files that blow up the converter's memory when extracted. Adjust all four
    if your users work with large documents.

!!! note "Persisting the JWT secret"
    If `JWT_SECRET` is not set, a random secret is generated on first start and
    stored under `/var/www/{{ brand.package_path_name }}/Data/.private/`. Mount the `Data`
    directory as a volume to keep it stable across container restarts, or set
    `JWT_SECRET` explicitly.

!!! warning "JWT secret length"
    When using the Nextcloud integration, the JWT secret must be at least
    **32 characters**. A shorter secret will cause token generation to fail with
    "JWT secret key is too short". Generate a suitable secret with:

    ```bash
    openssl rand -hex 32
    ```
