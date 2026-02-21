#!/usr/bin/env python3
"""
export-wp-urls.py — WordPress URL Inventory for Redirect Mapping

Exports all published WordPress URLs to a CSV file for manual redirect mapping
into Sanity. The CSV output is used to populate redirect documents in Studio.

Usage:
    python scripts/export-wp-urls.py

Output:
    scripts/wp_urls.csv

    Columns: url, type, slug, wp_id

    Types exported:
        - page               → /{slug}/
        - post               → /{slug}/  (WP default) or /blog/{slug}/ (if custom)
        - gem                → /gems/{slug}/      (CPT — confirm key with WP admin)
        - case_study         → /case-studies/{slug}/  (CPT)
        - tag                → /tag/{slug}/
        - category           → /category/{slug}/
        - case_study_category → /case-study-category/{slug}/  (confirm taxonomy base)

Configuration:
    Set WP_BASE_URL below (or export WP_BASE_URL env var) to your WordPress site.
    The WP REST API must be publicly accessible (no auth required for published content).

    If your CPT slugs or taxonomy bases differ from the defaults below,
    update the CPT_REST_BASES and TAXONOMY_REST_BASES dictionaries.

Requirements:
    Python 3.8+
    No external dependencies (uses urllib from stdlib only)

Notes:
    - Only published content is exported
    - Pagination is handled automatically (100 items per page)
    - Failed endpoints are logged as warnings, not fatal errors
    - Run from the monorepo root: python scripts/export-wp-urls.py
"""

import csv
import json
import os
import sys
import time
import urllib.error
import urllib.request
from urllib.parse import urlencode

# ─── Configuration ─────────────────────────────────────────────────────────────

# WordPress site base URL — override with WP_BASE_URL env var
WP_BASE_URL = os.environ.get("WP_BASE_URL", "https://sugartown.io").rstrip("/")

# REST API base
API_BASE = f"{WP_BASE_URL}/wp-json/wp/v2"

# Output file — relative to repo root
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "wp_urls.csv")

# Request timeout (seconds)
REQUEST_TIMEOUT = 15

# Delay between paginated requests (be polite to the server)
REQUEST_DELAY = 0.25

# ─── CPT REST API routes ────────────────────────────────────────────────────────
# Key: CSV type label  →  Value: WP REST API route slug (plural)
# Confirm these with: GET /wp-json/wp/v2/types
CPT_REST_BASES = {
    "post":       "posts",        # Built-in
    "page":       "pages",        # Built-in
    "gem":        "gems",         # CPT — confirm with WP admin
    "case_study": "case-studies", # CPT — confirm with WP admin
}

# ─── Taxonomy REST API routes ───────────────────────────────────────────────────
# Key: CSV type label  →  Value: (REST route slug, URL base prefix)
# Confirm these with: GET /wp-json/wp/v2/taxonomies
TAXONOMY_REST_BASES = {
    "tag":                  ("tags",                   "/tag/"),
    "category":             ("categories",             "/category/"),
    "case_study_category":  ("case-study-categories",  "/case-study-category/"),
}

# ─── URL builders ───────────────────────────────────────────────────────────────

def build_post_url(wp_type: str, slug: str) -> str:
    """Build the WordPress frontend URL for a post/CPT item."""
    url_map = {
        "post":       f"/{slug}/",
        "page":       f"/{slug}/",
        "gem":        f"/gems/{slug}/",
        "case_study": f"/case-studies/{slug}/",
    }
    prefix = url_map.get(wp_type, f"/{wp_type}/{slug}/")
    return f"{WP_BASE_URL}{prefix}"

def build_taxonomy_url(url_base: str, slug: str) -> str:
    """Build the WordPress frontend URL for a taxonomy term archive."""
    return f"{WP_BASE_URL}{url_base}{slug}/"

# ─── HTTP helpers ───────────────────────────────────────────────────────────────

def fetch_json(url: str) -> object:
    """Fetch and parse JSON from a URL. Raises urllib.error.HTTPError on failure."""
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "sugartown-wp-export/1.0 (migration tool)",
            "Accept": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as resp:
        return json.loads(resp.read().decode("utf-8"))

def fetch_all_pages(endpoint: str, extra_params: dict | None = None) -> list[dict]:
    """
    Fetch all paginated items from a WP REST API endpoint.
    Uses per_page=100 and iterates through pages until empty.
    """
    items = []
    page = 1
    params = {"per_page": 100, "status": "publish", **(extra_params or {})}

    while True:
        params["page"] = page
        url = f"{endpoint}?{urlencode(params)}"

        try:
            batch = fetch_json(url)
        except urllib.error.HTTPError as e:
            if e.code == 400 and page > 1:
                # WP returns 400 when page > total_pages — we're done
                break
            raise

        if not batch:
            break

        items.extend(batch)

        if len(batch) < 100:
            # Last page
            break

        page += 1
        time.sleep(REQUEST_DELAY)

    return items

# ─── Export functions ───────────────────────────────────────────────────────────

def export_post_type(writer: csv.DictWriter, wp_type: str, rest_route: str) -> int:
    """Export all published items for a post type (posts, pages, CPTs)."""
    endpoint = f"{API_BASE}/{rest_route}"
    print(f"  Fetching {wp_type} ({rest_route})...", end=" ", flush=True)

    try:
        items = fetch_all_pages(endpoint)
    except urllib.error.HTTPError as e:
        print(f"⚠️  HTTP {e.code} — skipping (CPT may not be registered or REST-enabled)")
        return 0
    except Exception as e:
        print(f"⚠️  Error: {e} — skipping")
        return 0

    count = 0
    for item in items:
        slug = item.get("slug", "")
        wp_id = item.get("id", "")
        if not slug:
            continue
        writer.writerow({
            "url":   build_post_url(wp_type, slug),
            "type":  wp_type,
            "slug":  slug,
            "wp_id": wp_id,
        })
        count += 1

    print(f"{count} items")
    return count

def export_taxonomy(
    writer: csv.DictWriter,
    label: str,
    rest_route: str,
    url_base: str,
) -> int:
    """Export all term archive URLs for a taxonomy."""
    endpoint = f"{API_BASE}/{rest_route}"
    print(f"  Fetching {label} ({rest_route})...", end=" ", flush=True)

    try:
        # Taxonomy endpoints don't use status=publish — all terms are always active
        items = fetch_all_pages(endpoint, extra_params={"hide_empty": False})
    except urllib.error.HTTPError as e:
        print(f"⚠️  HTTP {e.code} — skipping (taxonomy may not be registered or REST-enabled)")
        return 0
    except Exception as e:
        print(f"⚠️  Error: {e} — skipping")
        return 0

    count = 0
    for item in items:
        slug = item.get("slug", "")
        wp_id = item.get("id", "")
        if not slug:
            continue
        writer.writerow({
            "url":   build_taxonomy_url(url_base, slug),
            "type":  label,
            "slug":  slug,
            "wp_id": wp_id,
        })
        count += 1

    print(f"{count} terms")
    return count

# ─── Main ──────────────────────────────────────────────────────────────────────

def main():
    print()
    print("🗂️   Sugartown — WordPress URL Inventory")
    print("══════════════════════════════════════════════")
    print(f"   Source: {WP_BASE_URL}")
    print(f"   Output: {OUTPUT_FILE}")
    print()

    # Sanity-check: can we reach the WP REST API?
    print("  Checking WP REST API...", end=" ", flush=True)
    try:
        fetch_json(f"{WP_BASE_URL}/wp-json/")
        print("✅")
    except Exception as e:
        print(f"❌\n\n  Cannot reach WP REST API at {WP_BASE_URL}/wp-json/")
        print(f"  Error: {e}")
        print(f"\n  Set WP_BASE_URL env var if your site is at a different URL:")
        print(f"  WP_BASE_URL=https://example.com python scripts/export-wp-urls.py\n")
        sys.exit(1)

    print()

    fieldnames = ["url", "type", "slug", "wp_id"]
    total = 0

    with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()

        print("📄  Post Types:")
        for label, route in CPT_REST_BASES.items():
            total += export_post_type(writer, label, route)

        print()
        print("🏷️   Taxonomies:")
        for label, (route, url_base) in TAXONOMY_REST_BASES.items():
            total += export_taxonomy(writer, label, route, url_base)

    print()
    print("──────────────────────────────────────────────")
    print(f"✅  Done — {total} URLs exported to:")
    print(f"    {OUTPUT_FILE}")
    print()
    print("   Next steps:")
    print("   1. Open wp_urls.csv and review the URL inventory")
    print("   2. For each legacy URL that needs a redirect, create a Redirect")
    print("      document in Sanity Studio (Studio → Redirects → Create)")
    print("   3. Run `pnpm --filter web build:redirects` to generate _redirects")
    print("══════════════════════════════════════════════")
    print()

if __name__ == "__main__":
    main()
