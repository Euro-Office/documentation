# Command-line Tools

Euro-Office Document Server ships a set of `documentserver-*` helper scripts for
administration. On a package install they are on the `PATH` (in `/usr/bin`) and
run as root:

```bash
sudo documentserver-jwt-status.sh
```

In Docker, run them inside the container:

```bash
docker exec euro-office documentserver-jwt-status.sh
```

## Available commands

| Command | Purpose |
|---|---|
| `documentserver-configure.sh` | Configure the database, message broker, Redis, JWT, and port. Package install only |
| `documentserver-jwt-status.sh` | Print the current JWT enabled state, secret, and header |
| `documentserver-generate-allfonts.sh` | Regenerate the font cache. See [Custom fonts](fonts.md) |
| `documentserver-pluginsmanager.sh` | Install and update editor plugins. See [Installing plugins](plugins.md) |
| `documentserver-flush-cache.sh` | Bump the cache tag so browsers reload editor assets |
| `documentserver-update-securelink.sh` | Set or rotate the nginx secure-link secret |
| `documentserver-static-gzip.sh` | Pre-compress static assets and enable nginx `gzip_static` |
| `documentserver-prepare4shutdown.sh` | Drain the server before a graceful shutdown or restart |
| `documentserver-letsencrypt.sh` | Obtain and configure a Let's Encrypt certificate |

## Common tasks

**Check JWT configuration** — confirm whether token validation is on and which secret is in use:

```bash
sudo documentserver-jwt-status.sh
```

**Configure connections** (package install) — point the server at external services:

```bash
sudo documentserver-configure.sh \
  --databasetype postgres \
  --databasehost db.internal \
  --databasename eurooffice \
  --databaseuser eurooffice \
  --databasepassword your-password \
  --jwtsecret at-least-32-chars-long-for-hs256
```

Run `documentserver-configure.sh --help` to see all options. The package
supports `postgres`, `mariadb`, and `mysql`.

**Issue a TLS certificate** — pass the contact email and domain:

```bash
sudo documentserver-letsencrypt.sh admin@example.com docs.example.com
```

**Rotate the secure-link secret** — omit the value to generate a random one:

```bash
sudo documentserver-update-securelink.sh --secure_link_secret a-random-secret-for-nginx-secure-link
```

**Drain before maintenance** — stop accepting new editing sessions before restarting:

```bash
sudo documentserver-prepare4shutdown.sh
```
