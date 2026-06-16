# Troubleshooting

Common issues when running the local dev environment, and how to resolve them.

## Git: hundreds of "modified" files in VS Code (Windows + WSL2)

**Symptom:** VS Code (on Windows, opening the repo over `\\wsl.localhost\`) shows
hundreds of modified files and doesn't reflect real changes.

**Cause:** Windows VS Code uses the **Windows `git.exe`** with its own global config
(`C:\Users\<you>\.gitconfig`), typically `core.autocrlf=true` and no `safe.directory`.
Reading LF files (from the WSL ext4 filesystem) with `autocrlf=true` and no
`.gitattributes` flags hundreds of files as modified, and "dubious ownership" prevents
correct status. The WSL git sees only the real changes.

**Fix.** In **PowerShell/CMD on Windows** (not WSL), then reload VS Code:

```powershell
git config --global core.autocrlf false
git config --global core.filemode false
git config --global --add safe.directory '*'
```

Apply the same in WSL for terminal consistency:

```bash
git config --global --add safe.directory '*'
git config --global core.filemode false
git config --global core.autocrlf false
```

!!! tip
    Opening the project with the **WSL** extension (VS Code runs its server inside WSL
    and uses the WSL git) avoids the whole class of host↔guest discrepancies.

## Git: "dubious ownership"

The container writes into the `/develop` bind-mount with its own UID; a build running as
another UID can leave submodules owned by a foreign user. Fix ownership **without sudo**
from the container (the bind-mount writes to the host):

```bash
HUID=$(id -u); HGID=$(id -g)
docker exec -u root eo bash -lc "chown -R $HUID:$HGID /develop/sdkjs"
```

## Git: build-generated files keep dirtying the tree

The `web-apps` build rewrites `apps/*/main/locale/*.json` (English backfill via
`merge_and_check.py`), regenerates `icons.svg`, and bumps the `build` number in
`build/*.json`. None of this should be committed. Hide them locally (reversible):

```bash
cd web-apps
git ls-files 'apps/*/main/locale/*.json'                   | xargs git update-index --skip-worktree
git ls-files 'apps/*/main/resources/img/toolbar/icons.svg' | xargs git update-index --skip-worktree
# revert with: … | xargs git update-index --no-skip-worktree
```

!!! note
    In [`front-dev-live`](hot-reload.md) mode nothing is compiled, so the tree does not
    get dirtied while you develop the front-end.

## Submodule branches

Submodules in *detached HEAD* is normal, but to commit you'll want named branches. Keep
them on the commit the superproject pins (the coherent `v…-rc` set) rather than moving
individual submodules to `develop`/`main`, which can diverge and break cross-component
compatibility:

```bash
# in a submodule already at the pinned commit:
git checkout -B <branch-name> HEAD     # named branch at the current commit, code unchanged
```

## `npm ci` aborts with `EUSAGE`

`npm ci` is strict: it aborts if `package.json` and `package-lock.json` aren't perfectly
consistent. This happens when the lock was generated on a different npm version or
**platform** (a lock made on Windows/macOS lacks the Linux optional binaries). Always
regenerate the lock **inside the Linux container**:

```bash
docker compose exec eo bash -lc 'cd /develop/web-apps/build && npm install --package-lock-only'
docker compose exec eo bash -lc 'cd /develop/web-apps/build && npm ci --dry-run >/dev/null && echo "LOCK OK"'
git -C web-apps add build/package-lock.json
git -C web-apps commit -m "build: regenerate package-lock.json inside Linux container"
```

Never hand-edit the lock; regenerate it in the same commit whenever `package.json` changes.

## Nextcloud returns 500 after running `occ` as root

!!! danger "Always run `occ` as `www-data`"
    Apache runs as `www-data`. Running `occ` as **root** creates root-owned files under
    `config/`, `data/`, `apps/` → Apache can no longer read/write its config → 500.

Use an alias so you never slip:

```bash
alias occ='docker compose -f ~/repos/DocumentServer/develop/docker-compose.yml exec -u www-data nextcloud php occ'
```

Recovery sequence:

```bash
cd ~/repos/DocumentServer/develop
docker compose exec -u www-data nextcloud php occ maintenance:mode --on || true
docker compose exec -u root nextcloud bash -c '
  chown -R www-data:www-data /var/www/html/config /var/www/html/data /var/www/html/apps
  find /var/www/html/custom_apps -maxdepth 1 -mindepth 1 ! -name {{ brand.product_slug }} \
    -exec chown -R www-data:www-data {} +'
docker compose restart nextcloud
docker compose exec -u www-data nextcloud php occ maintenance:repair --include-expensive
docker compose exec -u www-data nextcloud php occ maintenance:mode --off
docker compose exec -u www-data nextcloud php occ status
```

Read the exact error if it persists:

```bash
docker compose exec nextcloud tail -n 50 /var/www/html/data/nextcloud.log
```

## FAQ

- **"I edit and don't see the change."** Compiled mode ([§ rebuild](hot-reload.md)):
  you missed the `ds-cache.conf` re-tag or a hard reload. Source mode: check Network
  serves unversioned modules with `no-store`.
- **"It doesn't reload on its own."** Is the live-reload server alive?
  `docker compose exec eo cat /tmp/livereload.log` should log `change:` on save.
- **"`Asc is not defined` / version prefix in URLs."** `api.js` is being served compiled —
  make sure source mode is active and clear the service worker + site data.
- **"+ New buttons gone in Nextcloud."** The integration app isn't enabled, or the
  handshake with the document server failed — see
  [Nextcloud integration](../integration/nextcloud.md#local-development).
