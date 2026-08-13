---
name: fix-dependabot
description: Fix GitHub Dependabot alerts from an alerts URL, verify with tests, and open a PR that also calls out every remaining open vulnerability. Use when the user pastes a github.com/<owner>/<repo>/security/dependabot URL or asks to fix dependency vulnerabilities.
argument-hint: <dependabot alerts URL, optionally with a ?q= filter like severity:critical>
---

# Fix Dependabot vulnerabilities

Take a Dependabot alerts URL, fix the alerts it scopes to, and open a PR that lists both what was fixed and every vulnerability still open afterwards.

## 1. Parse the URL

- Extract `<owner>/<repo>` from `github.com/<owner>/<repo>/security/dependabot`.
- Extract the `q=` query parameter (it may be URL-encoded, e.g. `is%3Aopen+severity%3Acritical`). Recognized filters: `severity:<level>`, `package:<name>`, `ecosystem:<name>`, `manifest:<path>`. No `q=` (or only `is:open`) means fix **all** open alerts.

## 2. Fetch the alerts

```bash
gh api 'repos/<owner>/<repo>/dependabot/alerts?state=open&per_page=100' \
  --jq '.[] | {number, severity: .security_advisory.severity, package: .dependency.package.name, ecosystem: .dependency.package.ecosystem, manifest: .dependency.manifest_path, patched: .security_vulnerability.first_patched_version.identifier, summary: .security_advisory.summary, ghsa: .security_advisory.ghsa_id}'
```

Split the full list into **in-scope** (matches the URL filter) and **out-of-scope** alerts. Group in-scope alerts by `(manifest, package)` — many alerts often collapse into one version bump; take the **highest** `first_patched_version` in each group. A bump can also incidentally fix out-of-scope alerts: re-resolving one package's subtree may pull other flagged packages past their patched versions. After installing, check what each flagged package resolved to (`pnpm why <package>`) — anything now at/above its patched version counts as fixed, not remaining.

## 3. Create a branch

Branch off `main`, e.g. `fix/dependabot-<scope>`. Never commit to `main` directly.

## 4. Apply fixes

This repo is a **single pnpm project** — the only manifest is the root `pnpm-lock.yaml`, owned by the root `package.json`. All dependencies come from the public npm registry; no auth tokens are needed. pnpm is pinned via the `packageManager` field in `package.json` (pnpm 10.x).

- Direct dependency (anything listed in `package.json`): edit its range to `^<patched>`, then `pnpm install`.
- Transitive dependency: try `pnpm update <package>`; if the lockfile still resolves a vulnerable version (the parent's range doesn't allow the patched version), add an entry to `pnpm.overrides` in `package.json` (pnpm 10 reads overrides from there) and run `pnpm install`.
- Verify what actually resolved: `pnpm why <package>` (shows every version in the tree and who pulls it in).

Prefer the smallest bump that reaches the patched version. For major bumps, read the changelog for breaking changes relevant to how the repo uses the package.

## 5. Verify

```bash
pnpm install
pnpm vitest run
```

There is no typecheck, lint, or build step — the test suite is the whole verification story. **Tests hit a real MySQL server** (no mocks): `db.js` connects at import time using `.env` / defaults (`DB_HOST` localhost, `DB_PORT` 3308, `DB_USER` root, `DB_PASS` secret, `DB_NAME` ck_test), and `getColumnMap` runs `DESCRIBE` against tables seeded by `schema.sql`. Check reachability first (`nc -z localhost 3308`). If no MySQL server is reachable:

- Still confirm `pnpm install` completes cleanly and the lockfile resolves the patched versions.
- Sanity-check syntax with `node --check` on the `.js` files.
- Say explicitly in the PR that the test suite could not run and why.

If a bump breaks something, fix the breakage in the same PR when small; otherwise report it and leave that alert in the "remaining" list with an explanation.

## 6. Open the PR

Commit the `package.json` + `pnpm-lock.yaml` changes (and any compat fixes) with a `fix(deps): …` message — there is no release automation in this repo, but that matches the existing commit style. Push and create the PR with `gh pr create` (CODEOWNERS auto-assigns reviewers). The PR body must contain:

1. **Fixed** — a table: alert #, severity, package, manifest, old → new version, GHSA id/summary.
2. **Remaining open vulnerabilities** — a table of every alert still open after this PR (out-of-scope alerts minus any incidentally fixed), with severity, package, manifest, and the patched version an upgrade would need. If none remain, say so explicitly.
3. How the fixes were verified (tests run and their results, or why they couldn't run).

Dependabot takes a few minutes to re-scan after merge; don't wait for alert states to flip.
