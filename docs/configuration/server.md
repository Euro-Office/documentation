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

These are read by the container entrypoint and written into `local.json` and the nginx
configuration at start-up. The four variables that limit file sizes are documented
separately under [Size limits](#size-limits).

#### Authentication

| Variable | Default | Description |
|---|---|---|
| `JWT_ENABLED` | `true` | Enable JWT validation |
| `JWT_SECRET` | generated | Shared JWT secret. When unset, a random 32-character secret is generated and stored in `/var/www/{{ brand.package_path_name }}/Data/.private/jwt_secret` |
| `JWT_SECRET_INBOX` / `JWT_SECRET_OUTBOX` | `JWT_SECRET` | Separate secrets per direction |
| `JWT_HEADER` | `Authorization` | HTTP header carrying the token |
| `JWT_HEADER_INBOX` / `JWT_HEADER_OUTBOX` | `JWT_HEADER` | Separate headers per direction |
| `JWT_IN_BODY` | `false` | Accept the token in the request body |
| `JWT_ENABLED_INBOX` / `JWT_ENABLED_OUTBOX` | `JWT_ENABLED` | Enable JWT per direction |

#### Database

| Variable | Default | Description |
|---|---|---|
| `DB_TYPE` | `postgres` | Database engine. The standalone image supports `postgres` only; other engines require the cluster image |
| `DB_HOST` | `localhost` | Database host |
| `DB_PORT` | `5432` | Database port |
| `DB_NAME` | `eurooffice` | Database name |
| `DB_USER` | `eurooffice` | Database user |
| `DB_PWD` | — | Database password |

!!! note "`DB_PASSWORD` is deprecated"
    `DB_PASSWORD` is a deprecated alias for `DB_PWD`. It still works, but the container
    writes `WARNING: DB_PASSWORD is deprecated, use DB_PWD instead` to its standard error
    stream at start-up. `DB_PWD` wins if both are set.

#### Redis

| Variable | Default | Description |
|---|---|---|
| `REDIS_SERVER_HOST` | `localhost` | Redis host |
| `REDIS_SERVER_PORT` | `6379` | Redis port |
| `REDIS_SERVER_USER` | — | Redis username for ACL-based authentication. Only written to the configuration when set |
| `REDIS_SERVER_PASS` | — | Redis password. Only written to the configuration when set |
| `REDIS_SERVER_DB` | — | Redis database number. Only written to the configuration when set |

#### RabbitMQ

| Variable | Default | Description |
|---|---|---|
| `AMQP_HOST` | `localhost` | RabbitMQ host |
| `AMQP_PORT` | `5672` | RabbitMQ port |
| `AMQP_USER` / `AMQP_PWD` | `guest` | RabbitMQ credentials |
| `AMQP_VHOST` | `/` | Virtual host name. A leading slash is added automatically if you omit it |
| `AMQP_URI` | — | Complete AMQP connection URI. Takes precedence over all other `AMQP_*` variables |

!!! note
    The container only points the Document Server at an external broker when `AMQP_URI`
    is set or `AMQP_HOST` differs from `localhost`. Otherwise the RabbitMQ instance
    bundled in the image is used.

#### WOPI

| Variable | Default | Description |
|---|---|---|
| `WOPI_ENABLED` | `false` | Enable WOPI protocol support. An RSA key pair is generated in `/var/www/{{ brand.package_path_name }}/Data` on first start |

#### Outbound requests

These control how the Document Server fetches documents from storage such as Nextcloud.

| Variable | Default | Description |
|---|---|---|
| `ALLOW_PRIVATE_IP_ADDRESS` | `false` | Allow fetching documents from private IPs |
| `ALLOW_META_IP_ADDRESS` | `false` | Allow fetching documents from meta-private IPs (169.254.0.0/16) |
| `USE_UNAUTHORIZED_STORAGE` | `false` | Disable TLS certificate validation for outbound requests to storage |

!!! warning "`USE_UNAUTHORIZED_STORAGE` disables certificate validation"
    `USE_UNAUTHORIZED_STORAGE=true` sets `rejectUnauthorized: false` on every outbound
    HTTPS connection the Document Server makes. The certificate chain, the host name, and
    the expiry date of the storage server are no longer checked, so any machine on the
    network path can impersonate your Nextcloud instance and read or modify the documents
    in transit. It has no effect on plain HTTP connections, which never present a
    certificate.

    Only use it for self-signed certificates in a trusted network, and prefer adding the
    certificate authority to the container's trust store instead.

#### HTTPS and TLS termination

| Variable | Default | Description |
|---|---|---|
| `SSL_CERTIFICATE_PATH` | — | Path inside the container to the TLS certificate |
| `SSL_KEY_PATH` | — | Path inside the container to the matching private key |
| `SSL_DHPARAM_PATH` | — | Path to a Diffie-Hellman parameter file. When unset or unreadable, the `ssl_dhparam` directive is removed |
| `SSL_VERIFY_CLIENT` | `off` | Value for the nginx `ssl_verify_client` directive (client certificate verification) |
| `ONLYOFFICE_HTTPS_HSTS_ENABLED` | `true` | Send an HSTS header. When `false`, the `max-age` directive is removed |
| `ONLYOFFICE_HTTPS_HSTS_MAXAGE` | `31536000` | HSTS max-age in seconds (default 1 year) |

!!! important "The HSTS and client-verification variables need a certificate"
    `SSL_DHPARAM_PATH`, `SSL_VERIFY_CLIENT`, and both `ONLYOFFICE_HTTPS_HSTS_*` variables
    are only applied when `SSL_CERTIFICATE_PATH` and `SSL_KEY_PATH` are both set **and**
    both files exist inside the container. Without them the container serves plain HTTP
    and these four variables have no effect at all.

#### Nginx

| Variable | Default | Description |
|---|---|---|
| `NGINX_WORKER_PROCESSES` | `1` | Number of nginx worker processes |
| `NGINX_WORKER_CONNECTIONS` | `768` | Value for the nginx `worker_connections` directive. When unset, the value from the base image's `nginx.conf` is left unchanged |
| `NGINX_ACCESS_LOG` | `false` | Write an access log to `/var/log/{{ brand.package_path_name }}/documentserver/nginx.access.log` |
| `NGINX_CLIENT_MAX_BODY_SIZE` | `100m` | Maximum size of an inbound request body — see [Size limits](#size-limits) |
| `SECURE_LINK_SECRET` | generated | Secret used for the nginx secure link URLs. When unset, a random 20-character secret is generated and stored in `/var/www/{{ brand.package_path_name }}/Data/.private/secure_link_secret` |

#### Metrics

| Variable | Default | Description |
|---|---|---|
| `METRICS_ENABLED` | `false` | Enable StatsD metrics collection and start the metrics service |
| `METRICS_HOST` | `localhost` | StatsD host |
| `METRICS_PORT` | `8125` | StatsD port |
| `METRICS_PREFIX` | `ds.` | Prefix prepended to every metric name |

!!! note
    `METRICS_HOST`, `METRICS_PORT`, and `METRICS_PREFIX` are only written to the
    configuration when `METRICS_ENABLED=true`.

#### Logging and optional services

| Variable | Default | Description |
|---|---|---|
| `DS_LOG_LEVEL` | `WARN` | log4js level for the default category, for example `ERROR`, `WARN`, `INFO`, or `DEBUG` |
| `PLUGINS_ENABLED` | `true` | Enable editor plugins |
| `GENERATE_FONTS` | `true` | Regenerate the font cache on startup |
| `ADMINPANEL_ENABLED` | `false` | Start the administration panel service |
| `EXAMPLE_ENABLED` | `false` | Start the bundled example application at `/example/`. Do not enable it on a public instance |

### Size limits

Four variables limit file sizes, and they apply to two independent paths through the
Document Server. Which variables matter depends on which path the file takes — raising
the wrong pair has no effect.

#### Documents the server downloads

When a user opens or converts a document that is already stored in Nextcloud, the
Document Server fetches the file itself over HTTP from Nextcloud. Nothing is uploaded
from the browser, so neither the nginx request body limit nor the internal request body
limit is involved. Two variables apply:

**1. The server downloads the file** — `FILECONVERTER_MAX_DOWNLOAD_BYTES` is the maximum
number of bytes the Document Server will fetch. Default is `524288000` (500 MB). A larger
document fails to open:

```bash
-e FILECONVERTER_MAX_DOWNLOAD_BYTES=838860800
```

**2. The server unzips the archive** — `FILECONVERTER_INPUT_LIMIT_UNCOMPRESSED` limits
the *uncompressed* size of the XML inside the office file's ZIP container. Default is
`500MB`:

```bash
-e FILECONVERTER_INPUT_LIMIT_UNCOMPRESSED=800MB
```

For example, a user opens a **200 MB `.pptx`**. The 500 MB download limit is already
sufficient, so no change is needed there. But a 200 MB presentation with embedded images,
shapes, or animations can hold 800 MB of uncompressed XML, which exceeds the 500 MB
default — so only `FILECONVERTER_INPUT_LIMIT_UNCOMPRESSED` has to be raised.

!!! note "`FILECONVERTER_MAX_DOWNLOAD_BYTES` takes no unit suffix"
    It must be a plain byte count. A value such as `800MB` is rejected: the container
    writes a warning to its standard error stream at start-up, silently keeps the
    built-in default, and starts normally. Check the container log after changing it.

!!! note "`FILECONVERTER_INPUT_LIMIT_UNCOMPRESSED` replaces the whole limit list"
    It accepts a size suffix and applies the same value to all four format groups the
    Document Server knows — `docx`, `xlsx`, `pptx`, and `vsdx` and their variants. It
    replaces the whole limit list rather than patching a single entry, so a format group
    added by a future release would lose its own default until this variable is updated.

#### Files posted to the server

These limits apply to requests that carry a file in the request body — inserting an image
into an open document, saving a document back, and conversion or command requests posted
to the Document Server. They do **not** apply to opening a stored document.

**1. Nginx accepts the request body** — `NGINX_CLIENT_MAX_BODY_SIZE` must be higher than
the payload. Default is `100m`; a larger body is rejected with
`413 Request Entity Too Large`:

```bash
-e NGINX_CLIENT_MAX_BODY_SIZE=250m
```

**2. The Document Server parses the body** — `MAX_FILE_SIZE` is the internal request body
limit in bytes. Default is `104857600` (100 MB):

```bash
-e MAX_FILE_SIZE=268435456
```

Both have to be raised together. Nginx rejects the request first, so raising only
`MAX_FILE_SIZE` changes nothing.

#### Summary

| Variable | Default | Applies to |
|---|---|---|
| `FILECONVERTER_MAX_DOWNLOAD_BYTES` | `524288000` | Documents the server downloads from Nextcloud |
| `FILECONVERTER_INPUT_LIMIT_UNCOMPRESSED` | `500MB` | Uncompressed XML inside any office file the server opens |
| `NGINX_CLIENT_MAX_BODY_SIZE` | `100m` | Request bodies posted to the server (image inserts, save-back, conversion) |
| `MAX_FILE_SIZE` | `104857600` | Request bodies posted to the server (image inserts, save-back, conversion) |

!!! note "Persisting generated secrets"
    `JWT_SECRET` and `SECURE_LINK_SECRET` are generated on first start when unset, and the
    WOPI key pair is generated when `WOPI_ENABLED=true`. All of it lives under
    `/var/www/{{ brand.package_path_name }}/Data`, which is a separate tree from
    `/var/lib/{{ brand.package_path_name }}/documentserver`. Mount it as a volume to keep the values stable
    across container recreation, or set the secrets explicitly — see
    [persistent data](../installation/docker.md#persistent-data). A regenerated JWT secret
    no longer matches the one configured in the Nextcloud app, and the connection stays
    broken until the new value is copied over.

!!! warning "JWT secret length"
    When using the Nextcloud integration, the JWT secret must be at least
    **32 characters**. A shorter secret will cause token generation to fail with
    "JWT secret key is too short". Generate a suitable secret with:

    ```bash
    openssl rand -hex 32
    ```
