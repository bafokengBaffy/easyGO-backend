#!/usr/bin/env bash
# run-redis-integration.sh - Wrapper to safely run automate-redis-integration.sh

set -e

if [ "$#" -lt 3 ]; then
  echo "Usage: $0 <REMOTE_USER> <REMOTE_IP> <REDIS_PASSWORD> [--tls]"
  echo "Example: $0 root 203.0.113.5 SuperSecurePass123! --tls"
  exit 1
fi

REMOTE_USER=$1
REMOTE_IP=$2
REDIS_PASSWORD=$3
USE_TLS=${4:-"--tls"}

echo "About to run remote Redis integration with the following settings:" 
echo "  Remote user: $REMOTE_USER"
echo "  Remote IP:   $REMOTE_IP"
echo "  TLS flag:    $USE_TLS"
echo "*** Ensure your SSH key is loaded and ssh $REMOTE_USER@$REMOTE_IP works without password prompts."

read -p "Proceed? (y/N) " yn
case "$yn" in
    [Yy]*)
        bash ./automate-redis-integration.sh "$REMOTE_USER" "$REMOTE_IP" "$REDIS_PASSWORD" "$USE_TLS"
        ;;
    *)
        echo "Aborted by user." ;;
esac

echo "Done. If the script completed, verify Redis is reachable and update .env if needed."
