# Installing Euro-Office on Ubuntu

This guide covers installing Euro-Office Document Server on Ubuntu 24.04 LTS (Noble) from a GitHub release package.

## System requirements

- Ubuntu 24.04 LTS (arm64 or amd64)
- 10 GB disk space minimum
- 4 GB RAM minimum

## Step 1 — Install prerequisites

Euro-Office requires PostgreSQL, Redis, RabbitMQ, Nginx, and Supervisor. Install them before the package:

```bash
sudo apt-get update
sudo apt-get install -y postgresql redis-server rabbitmq-server nginx supervisor
```

## Step 2 — Create the database

The post-install script connects to PostgreSQL during installation. Create the user and database first:

```bash
sudo -u postgres psql -c "CREATE USER ds WITH PASSWORD 'ds';"
sudo -u postgres psql -c "CREATE DATABASE ds OWNER ds;"
```

## Step 3 — Pre-seed the installer answers

The package installer asks for database connection details non-interactively. Pre-seed the answers so the post-install script can configure itself without a prompt:

```bash
echo "ds ds/db-type select postgres
ds ds/db-host string localhost
ds ds/db-port string 5432
ds ds/db-user string ds
ds ds/db-pwd password ds
ds ds/db-name string ds" | sudo debconf-set-selections
```

## Step 4 — Download the package

Download the latest release from [GitHub Releases](https://github.com/Euro-Office/DocumentServer/releases):

```bash
# Replace <version> and <arch> with your values, e.g. 9.3.1-rc.1 and amd64 or arm64
wget "https://github.com/Euro-Office/DocumentServer/releases/download/v<version>/{{ brand.package_path_name }}-documentserver_<version>_<arch>.deb" \
  -O /tmp/{{ brand.package_path_name }}-documentserver.deb
```

**Available architectures:** `amd64`, `arm64`

## Step 5 — Install the package

```bash
sudo apt-get install -y /tmp/{{ brand.package_path_name }}-documentserver.deb
```

The installer will generate fonts, WOPI keys, and JS caches. This takes a minute. A successful install ends with:

```
Congratulations, the Euro-Office DocumentServer has been installed successfully!
```

## Step 6 — Verify

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
wget "https://github.com/Euro-Office/DocumentServer/releases/download/v<new-version>/{{ brand.package_path_name }}-documentserver_<new-version>_<arch>.deb" \
  -O /tmp/{{ brand.package_path_name }}-documentserver.deb
sudo apt-get install -y /tmp/{{ brand.package_path_name }}-documentserver.deb
```

## Uninstalling

```bash
sudo apt-get remove --purge {{ brand.package_path_name }}-documentserver
sudo -u postgres psql -c "DROP DATABASE ds;"
sudo -u postgres psql -c "DROP USER ds;"
```
