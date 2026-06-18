Redis Remote Integration
========================

This document explains how to run the included automation to enable remote Redis access on a server and update the local `web-backend` configuration.

Prerequisites
--
- SSH key access from this machine to the remote host (no interactive password prompts).
- The remote user must have `sudo` privileges.
- Backup your remote `/etc/redis/redis.conf` before running automation.

Quick steps
--
1. Edit `./.env` and replace `YOUR_REMOTE_IP` and `PLEASE_SET_REDIS_PASSWORD` with your real values.
2. Ensure your SSH key works: `ssh REMOTE_USER@REMOTE_IP`.
3. Run the wrapper script (it will prompt for confirmation):

```bash
bash scripts/run-redis-integration.sh root 203.0.113.5 SuperSecurePass123! --tls
```

What the automation does
--
- Uploads `setup-remote-redis.sh` to `/tmp` on the remote host.
- Runs it with provided client IP binding, sets `requirepass`, optionally generates TLS certs, opens UFW port 6379, and restarts Redis.
- Updates local `.env` with the provided Redis settings.

Security notes
--
- DO NOT expose Redis to the internet without IP restrictions, strong passwords, and TLS.
- Consider using managed Redis (ElastiCache, Memorystore, Redis Cloud) where possible.

If you want me to run the automation from this environment, provide SSH access details or confirm SSH key connectivity and I'll proceed.
