# Security Policy

## Supported Versions

Security fixes and advisories are actively applied to the current minor release line of `sloppy`:

| Version | Supported |
| --- | --- |
| `1.1.x` | Supported |
| `< 1.1.0` | Unsupported |

## Reporting a Vulnerability

Please do **not** open public GitHub issues for suspected security vulnerabilities.

Report vulnerabilities privately through GitHub Security Advisories:

- [Submit a private vulnerability report](https://github.com/Pavanspoojary/sloppy/security/advisories/new)

Include as much detail as possible so the report can be reproduced and triaged quickly:

- Affected package (`@sloppy-ai/core`, `@sloppy-ai/cli`, `@sloppy-ai/mcp`, `@sloppy-ai/verify`, `@sloppy-ai/kit`, `@sloppy-ai/playground`, or `action.yml`)
- Minimal reproduction steps or proof-of-concept input
- Potential impact (for example: path traversal, command injection, unsafe file writes during `sloppy fix`, or CI bypass)

## Response Timeline

- **Acknowledgment**: Within 48 hours of submission
- **Initial assessment**: Within 7 days, including severity classification and remediation plan
- **Fix & coordinated disclosure**: Patches are released to `main` alongside a GitHub Security Advisory once verified

## Security Practices

- Static code scanning runs on every push and pull request via CodeQL and Sloppy's OASIS SARIF 2.1.0 output.
- Dependency and GitHub Actions updates are monitored continuously through Dependabot alerts and automated version updates.
- Secret scanning and push protection are enabled on the repository.
- Automated edits in `sloppy fix` enforce a `--before` / `--kept` wiring guard and write only inside targeted project files.
