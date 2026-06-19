# Server Configuration

Euro-Office Document Server is configured in one of two ways depending on how it
was installed:

- **Package install (deb/rpm)** — edit a JSON config file on disk.
- **Docker** — set environment variables; the container writes the config file for you on startup.

Both end up writing the same file: `local.json`.

## The configuration file

Settings live in `/etc/euro-office/documentserver/`, loaded in this order, with
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
        "inbox":  { "string": "your-secret" },
        "outbox": { "string": "your-secret" },
        "session": { "string": "your-secret" }
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
  --name euro-office \
  --restart=unless-stopped \
  -p 80:80 \
  -e JWT_SECRET=your-secret \
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
| `JWT_IN_BODY` | `false` | Accept the token in the request body |
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
| `GENERATE_FONTS` | `true` | Regenerate the font cache on startup |
| `ALLOW_PRIVATE_IP_ADDRESS` | `false` | Allow fetching documents from private IPs |
| `NGINX_WORKER_PROCESSES` | `1` | Number of nginx worker processes |

!!! note "Persisting the JWT secret"
    If `JWT_SECRET` is not set, a random secret is generated on first start and
    stored under `/var/www/euro-office/Data/.private/`. Mount the `Data`
    directory as a volume to keep it stable across container restarts, or set
    `JWT_SECRET` explicitly.
