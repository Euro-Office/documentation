# Installing Euro-Office on Fedora

This guide covers installing Euro-Office Document Server on Fedora 41 or later from a GitHub release RPM package.

!!! info "Tested on Fedora 44"
    These steps have been verified end-to-end on Fedora 44.
    Rocky Linux 9 is **not supported** due to a glibc version incompatibility — see [Known issues](#known-issues).

## System requirements

- Fedora 41 or later (x86_64 or aarch64)
- 10 GB disk space minimum
- 4 GB RAM minimum

## Step 1 — Install prerequisites

Enable the RabbitMQ packagecloud repository:

```bash
curl -1sLf 'https://packagecloud.io/rabbitmq/rabbitmq-server/script.rpm.sh' | sudo bash
```

Install all prerequisites:

```bash
sudo dnf install -y \
  postgresql-server postgresql postgresql-contrib \
  valkey \
  rabbitmq-server \
  nginx \
  supervisor
```

Initialize PostgreSQL, then start and enable all services:

```bash
sudo postgresql-setup --initdb
sudo systemctl enable --now postgresql valkey rabbitmq-server nginx supervisor
```

## Step 2 — Configure PostgreSQL authentication

Fedora's PostgreSQL uses `ident` authentication by default, which blocks password-based logins. Edit `/var/lib/pgsql/data/pg_hba.conf` and change `ident` to `md5` on the two `127.0.0.1` and `::1` lines:

```
# before
host    all             all             127.0.0.1/32            ident
host    all             all             ::1/128                 ident

# after
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

Reload PostgreSQL:

```bash
sudo systemctl reload postgresql
```

## Step 3 — Create the database

```bash
sudo -u postgres psql -c "CREATE USER ds WITH PASSWORD 'ds';"
sudo -u postgres psql -c "CREATE DATABASE ds OWNER ds;"
```

## Step 4 — Download the package

Download the latest RPM from [GitHub Releases](https://github.com/Euro-Office/DocumentServer/releases):

```bash
# Replace <version> with your value, e.g. 9.3.1-rc.1
wget "https://github.com/Euro-Office/DocumentServer/releases/download/v<version>/euro-office-documentserver-<version>.x86_64.rpm" \
  -O /tmp/euro-office-documentserver.rpm
```

**Available architectures:** `x86_64`, `aarch64`

## Step 5 — Install the package

The `msttcore-fonts` package is not available in Fedora's repositories. Install with `--nodeps` to skip that dependency:

```bash
sudo rpm -ivh --nodeps /tmp/euro-office-documentserver.rpm
```

## Step 6 — Initialize the database schema

The RPM installer does not run the database schema automatically. Apply it manually:

```bash
sudo -u postgres psql -d ds \
  -f /var/www/onlyoffice/documentserver/server/schema/postgresql/createdb.sql
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ds;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ds;"
```

## Step 7 — Fix the nginx configuration

Fedora's `/etc/nginx/nginx.conf` requires two changes before the document server can serve requests.

**1. The conf.d directory is not included.** Find this line in the `http {}` block:

```nginx
# include /etc/nginx/conf.d/*.conf;
```

Uncomment it:

```nginx
include /etc/nginx/conf.d/*.conf;
```

**2. A default server block intercepts port 80.** Comment out the entire `server {}` block in the same file that listens on port 80 (it starts with `listen 80;` and typically spans 15–20 lines):

```nginx
# server {
#     listen       80;
#     listen       [::]:80;
#     server_name  _;
#     root         /usr/share/nginx/html;
#     ...
# }
```

Test and reload:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## Step 8 — Install OpenSSL and generate JS caches

The cache-generation script requires `openssl`, which is not installed on Fedora by default:

```bash
sudo dnf install -y openssl
sudo /usr/bin/documentserver-flush-cache.sh
```

Without this step the editor will fail to load with a path error like `Cannot GET /9.3.1-/web-apps/…`.

## Step 9 — Configure JWT authentication

The RPM installer does not generate a JWT configuration. Create `/etc/euro-office/documentserver/local.json` with a secret of your choice — all three entries must use the same value:

```bash
sudo tee /etc/euro-office/documentserver/local.json > /dev/null << 'EOF'
{
  "services": {
    "CoAuthoring": {
      "token": {
        "enable": {
          "request": { "inbox": true, "outbox": true },
          "browser": true
        },
        "secret": {
          "inbox": { "string": "REPLACE_WITH_YOUR_SECRET" },
          "outbox": { "string": "REPLACE_WITH_YOUR_SECRET" },
          "browser": { "string": "REPLACE_WITH_YOUR_SECRET" }
        }
      }
    }
  }
}
EOF
```

Note the secret — you will need it when configuring the example app.

## Step 10 — Start the document server services

```bash
sudo systemctl enable --now ds-docservice ds-converter ds-metrics
```

## Step 11 — Verify

Check that all services are running:

```bash
systemctl is-active ds-docservice ds-converter ds-metrics nginx
```

Expected output:

```
active
active
active
active
```

Run the health check:

```bash
curl http://localhost/healthcheck
```

Expected output: `true`

## Optional: Test with the built-in example app

To verify the editor works end-to-end in a browser, follow the [Example App guide](example.md).

!!! note "Use the server IP, not localhost"
    When configuring the example app on Fedora, set `exampleUrl` to the server's actual IP address rather than `localhost` (e.g. `http://192.168.1.10/example`). Using `localhost` causes malformed callback URLs.

    Since you set the JWT secret manually in Step 9, skip the `grep` command and enter that same secret directly.

## Updating

Download the new release RPM and upgrade in place:

```bash
wget "https://github.com/Euro-Office/DocumentServer/releases/download/v<new-version>/euro-office-documentserver-<new-version>.x86_64.rpm" \
  -O /tmp/euro-office-documentserver.rpm
sudo rpm -Uvh --nodeps /tmp/euro-office-documentserver.rpm
sudo /usr/bin/documentserver-flush-cache.sh
```

## Uninstalling

```bash
sudo rpm -e euro-office-documentserver
sudo -u postgres psql -c "DROP DATABASE ds;"
sudo -u postgres psql -c "DROP USER ds;"
```

## Known issues

### Rocky Linux 9 not supported

The RPM package is built on Ubuntu with glibc 2.35. Rocky Linux 9 ships glibc 2.34 — one minor version behind. This causes the font and JS generation step (`AllFonts.js`) to fail silently, leaving the editor broken with no obvious error.

Rocky Linux 10 (which ships with a newer glibc) may work once it is available. Until then, use Fedora 41+ or the [Docker installation](docker.md) instead.
