#!/usr/bin/env python3
"""Creates or updates this repo's Weblate project and components.

This is the replacement for `crowdin.yml`. Weblate keeps component settings in
its own database rather than in the repository, which means the configuration is
invisible to code review and easy to change by accident in the UI. Declaring it
in i18n/weblate.json instead keeps the mapping in version control, and
re-running this script makes the server match the file.

Idempotent: existing objects are PATCHed to match, never recreated, so no
translation or history is lost.

    export WEBLATE_URL=https://weblate.mysterria.net
    export WEBLATE_API_TOKEN=...            # Weblate -> your profile -> API access
    python scripts/provision_weblate.py --dry-run
    python scripts/provision_weblate.py
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

MANIFEST = Path(__file__).resolve().parent.parent / "i18n" / "weblate.json"

USER_AGENT = "mysterria-weblate-provision/1.0 (+https://mysterria.net)"

# Repointing any of these at a live component throws away its history instead of
# migrating it, so the script refuses and asks for an explicit delete.
DESTRUCTIVE_FIELDS = {"repo", "filemask", "template", "file_format"}

for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(encoding="utf-8", errors="replace")


class Weblate:
    def __init__(self, base: str, token: str, dry_run: bool) -> None:
        self.base = base.rstrip("/")
        self.token = token
        self.dry_run = dry_run

    def _call(self, method: str, path: str, payload: dict | None = None) -> dict:
        url = path if path.startswith("http") else f"{self.base}{path}"
        data = json.dumps(payload).encode() if payload is not None else None
        request = urllib.request.Request(url, data=data, method=method)
        request.add_header("Authorization", f"Token {self.token}")
        request.add_header("Content-Type", "application/json")
        # weblate.mysterria.net is proxied through Cloudflare, which answers the
        # default "Python-urllib/3.x" agent with a 403 and error code 1010
        # (blocked browser signature) before the request ever reaches Weblate.
        # Identifying the client properly is enough to pass.
        request.add_header("User-Agent", USER_AGENT)
        try:
            with urllib.request.urlopen(request, timeout=300) as response:
                body = response.read()
                return json.loads(body) if body else {}
        except urllib.error.HTTPError as error:
            detail = error.read().decode(errors="replace")[:800]
            raise RuntimeError(f"{method} {url} -> HTTP {error.code}\n{detail}") from error

    def get(self, path: str) -> dict | None:
        try:
            return self._call("GET", path)
        except RuntimeError as error:
            if "HTTP 404" in str(error):
                return None
            raise

    def create(self, path: str, payload: dict) -> dict:
        if self.dry_run:
            print(f"    [dry-run] POST {path}")
            return {}
        return self._call("POST", path, payload)

    def patch(self, path: str, payload: dict) -> dict:
        if self.dry_run:
            print(f"    [dry-run] PATCH {path} {sorted(payload)}")
            return {}
        return self._call("PATCH", path, payload)


def strip_notes(definition: dict) -> dict:
    """Drops the documentation-only keys, which Weblate would reject."""
    return {key: value for key, value in definition.items() if not key.startswith("_")}


def inject_credentials(definition: dict) -> dict:
    """Puts git credentials into the URLs named by `_inject_credentials`.

    Weblate's GITHUB_CREDENTIALS cover the pull-request API and the push remote,
    but NOT the origin clone - that uses the `repo` URL exactly as given. A
    private repository over HTTPS therefore fails to clone with "terminal prompts
    disabled", which Weblate reports as the confusing "push URL seems to miss
    credentials".

    The alternative is an SSH deploy key. This is preferred because it needs no
    extra key to manage, and because the credentials stay out of the manifest:
    the token is read from the environment here and only ever lands in Weblate's
    own database, which masks it in the UI.
    """
    spec = definition.get("_inject_credentials")
    if not spec:
        return definition

    user = os.environ.get(spec["user_env"], "")
    token = os.environ.get(spec["token_env"], "")
    if not token:
        raise RuntimeError(
            f"{spec['token_env']} is not set, and {definition['slug']} needs it to "
            f"clone a private repository. Export it and re-run."
        )

    prefix = f"{urllib.parse.quote(user, safe='')}:{urllib.parse.quote(token, safe='')}@"
    out = dict(definition)
    for field in spec["fields"]:
        url = out.get(field)
        if not url or "@" in url.split("//", 1)[-1].split("/", 1)[0]:
            continue  # empty, or already carries credentials
        scheme, _, rest = url.partition("//")
        out[field] = f"{scheme}//{prefix}{rest}"
    return out


def drifted(existing: dict, desired: dict) -> dict:
    """Fields whose live value differs from the manifest.

    Weblate echoes relations back as nested objects (source_language becomes a
    dict), so only scalars are compared. Comparing the rest would report false
    drift on every single run.
    """
    changes = {}
    for key, want in desired.items():
        have = existing.get(key)
        if isinstance(have, (dict, list)):
            continue
        if isinstance(want, bool) or isinstance(have, bool):
            if bool(have) != bool(want):
                changes[key] = want
        elif str(have) != str(want):
            changes[key] = want
    return changes


def _same_target(live: str | None, want: str | None) -> bool:
    """Whether two git URLs point at the same place, ignoring any credentials."""
    def bare(url: str | None) -> str:
        if not url:
            return ""
        scheme, _, rest = url.partition("//")
        host, _, path = rest.partition("/")
        return f"{scheme}//{host.rpartition('@')[2]}/{path}"
    return bare(live) == bare(want)


def sync_component(weblate: Weblate, project_slug: str, definition: dict) -> None:
    slug = definition["slug"]
    print(f"component /{project_slug}/{slug}/")
    # The component DETAIL endpoint is /api/components/<project>/<slug>/.
    # /api/projects/<project>/components/ is the LIST endpoint - a GET of
    # <slug> under it 404s even when the component exists, which silently
    # turned every re-run into a create attempt.
    live = weblate.get(f"/api/components/{project_slug}/{slug}/")

    if live is None:
        weblate.create(f"/api/projects/{project_slug}/components/", definition)
        print("    created - Weblate is now cloning and scanning the repository")
        return

    changes = drifted(live, definition)

    # A component whose manifest repo is "weblate://<project>/<component>" shares
    # another component's clone. Weblate resolves that on read: it echoes back the
    # parent's real repo, push, vcs and branch. None of those are comparable to
    # what the manifest says, so all of them are dropped rather than reported as
    # drift - which is what made every linked component print a false refusal.
    if str(definition.get("repo", "")).startswith("weblate://"):
        if live.get("linked_component"):
            for field in ("repo", "push", "vcs", "branch", "push_branch"):
                changes.pop(field, None)
        else:
            print("    WARNING: manifest says this shares another component's clone,")
            print("    but Weblate reports it as standalone. Check it in the UI.")

    # A URL carrying injected credentials comes back with them still in it, so a
    # plain string comparison against the credential-free manifest value reports
    # drift on every run. Compare only the part that identifies the target.
    for field in ("repo", "push"):
        if field in changes and _same_target(live.get(field), definition.get(field)):
            del changes[field]
    blocked = {key: value for key, value in changes.items() if key in DESTRUCTIVE_FIELDS}
    if blocked:
        print(f"    REFUSING to change {sorted(blocked)} on an existing component.")
        print("    That discards translation history. Delete it in the UI and re-run")
        print("    if the change is really intended.")
        changes = {k: v for k, v in changes.items() if k not in blocked}

    if changes:
        weblate.patch(f"/api/components/{project_slug}/{slug}/", changes)
        print(f"    updated: {sorted(changes)}")
    elif not blocked:
        print("    already matches")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true",
                        help="report what would change, write nothing")
    # The plugin repo is private, so Weblate cannot clone it until
    # WEBLATE_GITHUB_TOKEN is set in the server's .env. Creating the project on
    # its own lets permissions and the glossary be set up while that is pending.
    parser.add_argument("--skip-components", action="store_true",
                        help="create or update the project only")
    args = parser.parse_args()

    token = os.environ.get("WEBLATE_API_TOKEN")
    if not token:
        print("error: WEBLATE_API_TOKEN is not set", file=sys.stderr)
        return 2
    base = os.environ.get("WEBLATE_URL", "https://weblate.mysterria.net")

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    project = strip_notes(manifest["project"])
    slug = project["slug"]

    weblate = Weblate(base, token, args.dry_run)

    try:
        print(f"project /{slug}/")
        existing = weblate.get(f"/api/projects/{slug}/")
        if existing is None:
            weblate.create("/api/projects/", project)
            print("    created")
        else:
            changes = drifted(existing, project)
            if changes:
                weblate.patch(f"/api/projects/{slug}/", changes)
                print(f"    updated: {sorted(changes)}")
            else:
                print("    already matches")

        if args.skip_components:
            print("\n--skip-components: stopping before components.")
            return 0

        for component in manifest["components"]:
            sync_component(weblate, slug, strip_notes(inject_credentials(component)))
    except RuntimeError as error:
        print(f"\nerror: {error}", file=sys.stderr)
        return 1

    print("\nDone. Check which languages were picked up before inviting anyone:")
    print(f"  {base}/projects/{slug}/")
    print("Traditional Chinese must NOT be listed - it is generated, not translated.")
    print("See the _comment block in i18n/weblate.json.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
