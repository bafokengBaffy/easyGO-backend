#!/bin/bash
# automate-redis-integration.sh - Orchestrates local config and remote server setup

# 1. Configuration - EDIT THESE OR PASS AS ARGUMENTS
REMOTE_USER=${1:-"root"}
REMOTE_IP=${2:-"YOUR_REMOTE_IP"}
REDIS_PASSWORD=${3:-"SuperStrongPassword123!"}
USE_TLS=${4:-"--tls"} # Set to empty string "" to disable TLS

echo "🚀 Starting Full Redis Automation..."

# 2. Update Local .env File
echo "📝 Updating local .env configuration..."
if [ -f ".env" ]; then
    # Remove existing Redis entries to avoid duplicates
    sed -i '/REDIS_/d' .env
    
    # Append new configuration
    cat >> .env <<EOF
REDIS_HOST=$REMOTE_IP
REDIS_PORT=6379
REDIS_PASSWORD=$REDIS_PASSWORD
REDIS_TLS=$( [[ "$USE_TLS" == "--tls" ]] && echo "true" || echo "false" )
REDIS_URL=redis://$REMOTE_IP:6379
EOF
    echo "✅ Local .env updated."
else
    echo "❌ .env file not found. Skipping local update."
fi

# 3. Prepare Remote Server
echo "📤 Uploading setup script to remote server ($REMOTE_IP)..."
scp ./setup-remote-redis.sh $REMOTE_USER@$REMOTE_IP:/tmp/setup-remote-redis.sh

echo "🛠️ Executing remote configuration..."
# We pass '0.0.0.0' to the script to allow connections from your specific backend IP if known, or ANY.
ssh $REMOTE_USER@$REMOTE_IP "bash /tmp/setup-remote-redis.sh 0.0.0.0 $REDIS_PASSWORD $USE_TLS"

# 4. Clean up
ssh $REMOTE_USER@$REMOTE_IP "rm /tmp/setup-remote-redis.sh"

echo "------------------------------------------------"
echo "🎉 Automation Complete!"
echo "Remote IP: $REMOTE_IP"
echo "Password: $REDIS_PASSWORD"
echo "TLS Enabled: $( [[ "$USE_TLS" == "--tls" ]] && echo "Yes" || echo "No" )"
echo "------------------------------------------------"
echo "You can now test your backend connection with:"
echo "npm run env:check"