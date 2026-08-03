# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| `main` branch | ✅ Active |

## Reporting a vulnerability

This project is a client-side-only Mermaid diagram extension prototype.
There is no backend, no authentication, no user data storage, and no
production service to exploit. All rendering runs in the browser.

If you find a security issue (e.g. XSS in the SVG renderer, a supply-chain
problem in a dependency, or a sensitive data leak in the build output),
please report it privately:

1. **Do not open a public GitHub issue** for a security vulnerability.
2. Email **security@overkillhill.com** with the subject line
   `[mermaid-diagram-bpmn] Security report`.
3. Include a description of the issue, reproduction steps, and the potential
   impact. A CVE reference if applicable.

We will acknowledge receipt within **5 business days** and aim to publish a
fix or advisory within **30 days** of confirmed severity.

## Scope

- `app/src/lib/` — parser, layout, renderer (SVG output)
- `app/src/` — React frontend
- `skills/` — Markdown SKILL.md files (no execution surface)

Out of scope: GitHub Actions configuration issues that do not affect the
published artifact, third-party Dependabot advisory noise already tracked
via automated PRs.
