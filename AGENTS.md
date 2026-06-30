# documentation — Euro-Office

Guidance for Claude Code (and other AI agents) working in **documentation** — the official Euro-Office documentation site.

## What this repo is
A MkDocs + Material for MkDocs documentation site for the Euro-Office suite (installation, integration, development). Audience: sysadmins, developers, integrators. Canonical URL: `https://docs.euro-office.com`. Auto-deployed on push to `main`. **Whitelabel-capable:** all product/company names come from `brand.yml` — never hardcoded in content.

**Stack:** MkDocs 1.6.1, Material 9.5.49, mkdocs-macros-plugin 1.3.7, pymdown-extensions 10.14, Python 3.12. Run `make install` → `make serve` (dev) / `make build` (CI-equivalent strict build).

## Branding System & Build Constraints
- **`brand.yml` is the single source of truth** for all product strings. `main.py` (mkdocs-macros hook) loads it and exposes every key as `{{ brand.* }}` in Markdown. Any variable can be overridden at build time via `BRAND_*` env vars — this is how whitelabel builds work without touching content.
- **`make whitelabel-check`** builds with "Acme Inc." brand overrides and fails if any `Euro-Office` string leaks through. This runs in CI.
- **`mkdocs build --strict`** fails on broken internal links, missing pages, and unused config keys. Always run `make build` locally before pushing. **CRITICAL FAIL MODE:** Adding a page without a `nav` entry in `mkdocs.yml` causes a strict-mode failure in CI.
- **Pygments is pinned `<2.20`:** A regression in 2.20 breaks the `highlight` extension. Do not unpin.

## Rules
- **Never** hardcode product or company names in content — use `{{ brand.name }}`, `{{ brand.company }}`, etc.
- **Never** add a page without adding it to `nav` in `mkdocs.yml`.
- **Never** commit the generated `site/` directory or push to `gh-pages` manually.
- **Never** unpin Pygments above `<2.20`.

## Findings & Long-tail
No centralized findings store exists in this repository yet. Document edge cases in code comments or GitHub issues until one is established.
