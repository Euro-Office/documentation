# Testing with the built-in example app

Euro-Office ships a Node.js example application that lets you open and edit documents in the browser. It is intended for testing and verification only — do not expose it on a public server.

## Step 1 — Start the example service

```bash
sudo systemctl start ds-example
systemctl is-active ds-example
```

Expected output: `active`

## Step 2 — Configure the example app

The example app needs to know its own URL so the document server can fetch and save files correctly. Edit `/etc/euro-office/documentserver-example/local.json`:

```bash
sudo tee /etc/euro-office/documentserver-example/local.json > /dev/null << 'EOF'
{
  "server": {
    "siteUrl": "/",
    "exampleUrl": "http://localhost/example/",
    "token": {
      "enable": true,
      "secret": "REPLACE_WITH_YOUR_JWT_SECRET",
      "authorizationHeader": "Authorization"
    }
  }
}
EOF
```

Replace `REPLACE_WITH_YOUR_JWT_SECRET` with the JWT secret from the document server:

```bash
sudo grep -A1 '"browser"' /etc/euro-office/documentserver/local.json | grep '"string"'
```

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

**1. nginx listen port** — edit `/etc/euro-office/documentserver/nginx/ds.conf`:

```nginx
listen 0.0.0.0:<port>;
listen [::]:<port> default_server;
```

**2. `exampleUrl`** — update `/etc/euro-office/documentserver-example/local.json`:

```json
"exampleUrl": "http://localhost:<port>/example/"
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
