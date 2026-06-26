# Testing with the built-in example app

Euro-Office ships a Node.js example application that lets you open and edit documents in the browser. It is intended for testing and verification only — do not expose it on a public server.

## Step 1 — Start the example service

```bash
sudo systemctl start ds-example
systemctl is-active ds-example
```

Expected output: `active`

## Step 2 — Configure the example app

The example app needs to know its own URL so the document server can fetch and save files correctly. Edit `/etc/{{ brand.package_path_name }}/documentserver-example/local.json`:

```bash
sudo tee /etc/{{ brand.package_path_name }}/documentserver-example/local.json > /dev/null << 'EOF'
{
  "server": {
    "siteUrl": "/",
    "exampleUrl": "http://YOUR_SERVER_IP/example",
    "token": {
      "enable": true,
      "secret": "REPLACE_WITH_YOUR_JWT_SECRET",
      "authorizationHeader": "Authorization"
    }
  }
}
EOF
```

Replace `YOUR_SERVER_IP` with the server's IP address or hostname. Do not add a trailing slash.

!!! tip "localhost vs server IP"
    If you are running the server directly on your local machine (not in a container or VM), you can use `http://localhost/example` as the `exampleUrl`. In all other cases — including LXD/LXC containers, VMs, and remote servers — use the actual IP address. Using `localhost` in those environments causes the document server to generate malformed callback URLs.

**Get the JWT secret:**

=== "deb install (Ubuntu)"
    The installer generates a JWT secret automatically. Look it up with:
    ```bash
    sudo grep -A1 '"browser"' /etc/{{ brand.package_path_name }}/documentserver/local.json | grep '"string"'
    ```

=== "rpm install (Fedora)"
    Use the secret you set manually in Step 9 of the Fedora installation guide.

Then restart the example service:

```bash
sudo systemctl restart ds-example
```

## Step 3 — Open the example in your browser

```
http://<your-server-ip>/example/
```

You should see a file list. Click **Create** to open a blank document in the editor.

## Running on a non-standard port

If nginx is configured to listen on a port other than 80, update two settings:

**1. nginx listen port** — edit `/etc/{{ brand.package_path_name }}/documentserver/nginx/ds.conf`:

```nginx
listen 0.0.0.0:<port>;
listen [::]:<port> default_server;
```

**2. `exampleUrl`** — update `/etc/{{ brand.package_path_name }}/documentserver-example/local.json`:

```json
"exampleUrl": "http://YOUR_SERVER_IP:<port>/example"
```

Then reload nginx and restart the example:

```bash
sudo systemctl reload nginx
sudo systemctl restart ds-example
```

## Disabling the example app

```bash
sudo systemctl stop ds-example
sudo systemctl disable ds-example
```
