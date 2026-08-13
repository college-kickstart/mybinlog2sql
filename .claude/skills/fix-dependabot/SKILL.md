---
name: fix-dependabot
description: Use when given a GitHub Dependabot alerts URL or asked to assess or fix dependency vulnerabilities in this repository.
argument-hint: <Dependabot alerts URL, optionally filtered with ?q=>
---

# Fix Dependabot Alerts

Fix the requested alerts with the smallest safe dependency change. Assess actual exposure instead of treating the raw alert count as application risk.

## Workflow

1. Parse the URL and extract the repository plus any `q=` filters such as `severity:`, `package:`, `ecosystem:`, or `manifest:`. No filter means all open alerts.
2. Fetch every open alert, then split them into in-scope and remaining alerts. Group in-scope alerts by manifest and package; one version change may resolve several advisories.
3. Trace each vulnerable package with `pnpm why <package>`. Record whether it is direct, transitive, development-only, and reachable in this repository's usage.
4. Prefer updating the direct parent that owns the vulnerable subtree. Use an override only when the parent cannot resolve a patched version and compatibility has been verified.
5. Run `pnpm install`, verify resolved versions with `pnpm why`, and run `pnpm test` against the configured MySQL server.
6. Run `pnpm audit` and report both fixed and remaining advisories. Explain practical exposure for remaining alerts, especially development-server vulnerabilities that are not reachable in normal use.

## Verification Fallback

Tests require a reachable MySQL server configured through `.env` or the defaults in `AGENTS.md`. If unavailable, run `node --check` on changed JavaScript files and state clearly that the database-backed tests were not run.

## Pull Request Report

When a pull request is requested, include:

- Fixed alerts: severity, package, old and new versions, advisory ID.
- Remaining alerts: every open advisory, patched version, dependency path, and exposure assessment.
- Verification: exact commands and results, including any unavailable database test.

Do not create a branch, commit, push, or open a pull request unless the user explicitly requests those actions.
