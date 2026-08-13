# Node test runner and dependency cleanup

-- Sisyphus (GPT-5.6 Sol), 2026-08-13

Replaced Vitest with Node's built-in test runner, removing the Vite and esbuild transitive dependency tree. Removed the `packageManager` pin and updated the test documentation.

Adapted the useful Dependabot workflow from PR #7 into a repository skill focused on dependency paths, actual exposure, minimal fixes, and complete reporting.

Verification: all 8 database-backed tests pass, the focused test command works, and `pnpm audit` reports no known vulnerabilities.
