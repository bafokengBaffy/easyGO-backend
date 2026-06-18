# Redis Integration Report

Date: 2026-06-17

## Summary

We prepared automation to integrate a remote Redis instance with the `web-backend`. Remote server changes have NOT been executed yet — only local repo updates and helper scripts were added.

## Actions completed

- Inspected and reviewed `automate-redis-integration.sh` and `setup-remote-redis.sh`.
- Updated local `./.env` with placeholder Redis values to be replaced before running automation.
- Added a safe wrapper script: `./scripts/run-redis-integration.sh` (prompts for confirmation and reminds about SSH keys).
- Added `README-redis-integration.md` with instructions and security notes.

## Files changed/added

- `./.env` — updated Redis placeholders
- `./scripts/run-redis-integration.sh` — new wrapper for safe execution
- `./README-redis-integration.md` — new instructions and security notes
- `./setup-remote-redis.sh` — reviewed (remote script that will run on server)
- `./automate-redis-integration.sh` — reviewed (uploads and executes the remote script)

## Current status

- Local config: updated with placeholders (not containing secrets).
- Remote configuration: NOT applied. No modifications have been made to any remote `/etc/redis/redis.conf` from this environment.

## What I need from Cynthia Moroka to finish

Provide the following and confirm SSH key access from this machine (passwordless or agent):

- REMOTE_USER (e.g., `root`)
- REMOTE_IP or hostname
- REDIS_PASSWORD (strong, 20+ chars recommended)
- TLS choice: `--tls` to enable TLS certificate generation, or leave blank to disable
- Confirm: `ssh REMOTE_USER@REMOTE_IP` works without an interactive password prompt

## How to run (from repo root)

Run locally (prompts for confirmation):

```bash
bash scripts/run-redis-integration.sh <REMOTE_USER> <REMOTE_IP> <REDIS_PASSWORD> [--tls]
# Example:
bash scripts/run-redis-integration.sh root 203.0.113.5 SuperSecurePass123! --tls
```

The wrapper runs `automate-redis-integration.sh`, which will:
- update local `.env` (already prepared),
- `scp` `setup-remote-redis.sh` to `/tmp` on the remote host,
- `ssh` to run the remote script with the provided args,
- remove the uploaded script and print a summary.

## Post-run checks (I will perform / you can run)

- From this machine: `redis-cli -h <REMOTE_IP> -p 6379 -a <REDIS_PASSWORD> ping` (or TLS-enabled client if TLS used). Expect `PONG`.
- Verify `/etc/redis/redis.conf` on the server contains `requirepass <PASSWORD>` and TLS settings if enabled.
- Confirm firewall rules allow connections from backend only.

## Security notes

- Do NOT expose Redis to the public internet without IP whitelisting, a strong password, and TLS.
- Prefer running Redis inside a private VPC or using a managed Redis service for production workloads.

## Next steps

1. Cynthia supplies the requested connection details and confirms SSH key access.
2. Run the wrapper script (I can run it from this environment if SSH access is confirmed).
3. Run the post-run checks and update `.env` with final values.

Report file location: [reports/redis-integration-report.md](reports/redis-integration-report.md#L1)
