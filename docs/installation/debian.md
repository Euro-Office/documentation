# Installing Euro-Office on Debian

This guide covers installing Euro-Office Document Server on Debian 12 (Bookworm) from a GitHub release package.

## System requirements

- Debian 12 (Bookworm) — arm64 or amd64
- 10 GB disk space minimum
- 4 GB RAM minimum

## Step 1 — Enable the contrib component

The `ttf-mscorefonts-installer` package required by Euro-Office lives in Debian's
`contrib` component, which is not enabled by default. Edit `/etc/apt/sources.list`
and add `contrib` to each line:

```
deb http://deb.debian.org/debian bookworm main contrib
deb http://deb.debian.org/debian bookworm-updates main contrib
deb http://deb.debian.org/debian-security/ bookworm-security main contrib
```

Then update the package index:

```bash
sudo apt-get update
```

## Step 2 — Install prerequisites

All prerequisites are available in the default Debian 12 repositories — no extra
package sources required:

```bash
sudo apt-get install -y postgresql redis-server rabbitmq-server nginx supervisor
```

## Step 3 — Create the database

The post-install script connects to PostgreSQL during installation. Create the user
and database first:

```bash
sudo -u postgres psql -c "CREATE USER ds WITH PASSWORD 'ds';"
sudo -u postgres psql -c "CREATE DATABASE ds OWNER ds;"
```

## Step 4 — Pre-seed the installer answers

```bash
echo "ds ds/db-type select postgres
ds ds/db-host string localhost
ds ds/db-port string 5432
ds ds/db-user string ds
ds ds/db-pwd password ds
ds ds/db-name string ds" | sudo debconf-set-selections
```

## Step 5 — Download the package

Download the latest release from [GitHub Releases](https://github.com/Euro-Office/DocumentServer/releases):

```bash
# Replace <version> and <arch> with your values, e.g. 9.3.1-rc.1 and amd64 or arm64
wget "https://github.com/Euro-Office/DocumentServer/releases/download/v<version>/euro-office-documentserver_<version>_<arch>.deb" \
  -O /tmp/euro-office-documentserver.deb
```

**Available architectures:** `amd64`, `arm64`

## Step 6 — Install the package

```bash
sudo apt-get install -y /tmp/euro-office-documentserver.deb
```

The installer generates fonts, WOPI keys, and JS caches. This takes a minute. A
successful install ends with:

```
Congratulations, the Euro-Office DocumentServer has been installed successfully!
```

## Step 7 — Verify

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

## Updating

Download the new release package and reinstall:

```bash
wget "https://github.com/Euro-Office/DocumentServer/releases/download/v<new-version>/euro-office-documentserver_<new-version>_<arch>.deb" \
  -O /tmp/euro-office-documentserver.deb
sudo apt-get install -y /tmp/euro-office-documentserver.deb
```

## Uninstalling

```bash
sudo apt-get remove --purge euro-office-documentserver
sudo -u postgres psql -c "DROP DATABASE ds;"
sudo -u postgres psql -c "DROP USER ds;"
```
