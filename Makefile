# Local development helpers. Run `make` to see all targets.

PYTHON       ?= python3
VENV         := .venv
VENV_BIN     := $(VENV)/bin
PIP          := $(VENV_BIN)/pip
MKDOCS       := $(VENV_BIN)/mkdocs
STAMP        := $(VENV)/.installed
REQUIREMENTS := requirements.txt
NODE_STAMP   := node_modules/.package-lock.json

.DEFAULT_GOAL := help

.PHONY: help install api test serve build check whitelabel-check clean clean-venv

help:  ## Show this help
	@awk 'BEGIN {FS = ":.*##"; printf "Usage:\n  make \033[36m<target>\033[0m\n\nTargets:\n"} \
		/^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

install: $(STAMP)  ## Create venv and install pinned dependencies

$(STAMP): $(REQUIREMENTS)
	@test -d $(VENV) || $(PYTHON) -m venv $(VENV)
	$(PIP) install --upgrade pip
	$(PIP) install -r $(REQUIREMENTS)
	@touch $(STAMP)

$(NODE_STAMP): package.json package-lock.json
	npm ci

api: $(NODE_STAMP)  ## Generate the API reference into docs/api (sources pinned in api-refs.yml)
	node scripts/gen-api.mjs

test: $(NODE_STAMP)  ## Run the API generator tests
	node --test "scripts/*.test.mjs"

serve: install api  ## Live preview at http://127.0.0.1:8000
	$(MKDOCS) serve

build: install api  ## Production build into ./site (strict)
	$(MKDOCS) build --strict

check: build  ## Strict build (alias for `build`, kept for CI parity)

whitelabel-check: install api  ## Build with example overrides and grep for brand leaks
	@BRAND_NAME=Acme \
	BRAND_SHORT_NAME=Acme \
	BRAND_TAGLINE='Office for everyone' \
	BRAND_COMPANY='Acme Inc.' \
	BRAND_CLI=acme \
	BRAND_PRODUCT_SLUG=acme \
	BRAND_PACKAGE_PATH_NAME=acme \
	BRAND_IMAGE=acme/documentserver \
	BRAND_URL=https://acme.example \
	BRAND_REPO=https://github.com/acme \
	BRAND_REPO_URL=https://github.com/acme/documentation \
	BRAND_REPO_NAME=acme/documentation \
	BRAND_DOCS_URL=https://docs.acme.example \
	BRAND_PRIMARY_COLOR='deep purple' \
	$(MKDOCS) build --strict
	@echo "--- Stray brand strings (should be empty) ---"
	@! grep -RIo '.\{0,40\}\(Euro-Office\|eurooffice\).\{0,40\}' site/ --include='*.html' \
		| grep -v 'edit/main\|raw/main\|whitelabel/docs-rebrand\|github.com/Euro-Office/\|Euro-Office source code' \
		| sort -u | grep .

clean:  ## Remove built site and generated API pages
	rm -rf site docs/api

clean-venv: clean  ## Remove built site and venv
	rm -rf $(VENV)
