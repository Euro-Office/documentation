"""mkdocs-macros entrypoint.

Loads brand.yml and exposes its values as `{{ brand.* }}` inside every
markdown page. Environment variables override values from brand.yml so the
same source tree can build differently-branded artifacts in CI without
editing committed files.
"""
import os
from pathlib import Path

import yaml

BRAND_FILE = Path(__file__).parent / "brand.yml"

ENV_OVERRIDES = {
    "name": "BRAND_NAME",
    "short_name": "BRAND_SHORT_NAME",
    "tagline": "BRAND_TAGLINE",
    "company": "BRAND_COMPANY",
    "product_slug": "BRAND_PRODUCT_SLUG",
    "package_path_name": "BRAND_PACKAGE_PATH_NAME",
    "cli": "BRAND_CLI",
    "image": "BRAND_IMAGE",
    "url": "BRAND_URL",
    "repo": "BRAND_REPO",
    "docs_url": "BRAND_DOCS_URL",
}


def _load_brand():
    with BRAND_FILE.open() as fh:
        config = yaml.safe_load(fh) or {}
    brand = config.get("brand", {})
    for key, env_var in ENV_OVERRIDES.items():
        value = os.environ.get(env_var)
        if value:
            brand[key] = value
    return brand


def define_env(env):
    brand = _load_brand()
    env.variables["brand"] = brand
    env.conf.setdefault("extra", {})["brand"] = brand
