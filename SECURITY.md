# Security policy

This repository is a personal portfolio site. It is static, has no backend, no
database, no authentication and no user input — the contact route is a
`mailto:` link. The realistic risk is a supply-chain problem in a build
dependency, or a misconfiguration in the response headers.

## Reporting a vulnerability

Email **ritishsaini1995@gmail.com** with `SECURITY` in the subject.

Please include what you found, how to reproduce it, and what you think the
impact is. I will acknowledge within **72 hours** and tell you what I intend to
do about it. If you would rather report privately through GitHub, open a
[security advisory](https://github.com/MaXiMo000/portfolio/security/advisories/new).

Please do not open a public issue for anything exploitable.

## What is in scope

- The response headers served by the deployed site (CSP, HSTS, frame-ancestors)
- Anything that causes the site to load or execute third-party code
- Build or dependency issues that would affect anyone cloning this repository

## What is not

- Findings that require a compromised browser, extension or local machine
- Missing headers that have no effect on a static page with no cookies
- Automated scanner output with no demonstrated impact

## How this repository defends itself

CI is gated by [carabiner](https://github.com/MaXiMo000/carabiner), the
repository security scanner in this portfolio. Every push and pull request is
scanned with `carabiner scan --all`, results are uploaded as SARIF, and the
drill re-runs weekly. GitHub Actions are pinned to commit SHAs and the default
token is read-only.

The deployed site sets `Content-Security-Policy: default-src 'none'` with
everything else `'self'`. Fonts are self-hosted; there are no third-party
requests of any kind.
