#!/bin/bash
# setup-remote-redis.sh - Automates Redis security and remote access config

set -e

if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root (use sudo)"
   exit 1
fi

REDIS_CONF="/etc/redis/redis.conf"
CLIENT_IP=$1
REDIS_PASS=$2
ENABLE_TLS=$3

if [ -z "$REDIS_PASS" ]; then
    echo "Usage: sudo ./setup-remote-redis.sh <CLIENT_IP_OR_ANY> <STRONG_PASSWORD>"
    echo "Example: sudo ./setup-remote-redis.sh 203.0.113.5 SuperSecurePass123!"
    exit 1
fi

echo "Updating Redis configuration..."

# 1. Bind to all interfaces
sed -i "s/^bind .*/bind 0.0.0.0/" $REDIS_CONF

# 2. Set protected-mode to no (since we are using a password and firewall)
sed -i "s/^protected-mode .*/protected-mode no/" $REDIS_CONF

# 3. Set the password
if grep -q "requirepass" $REDIS_CONF; then
    sed -i "s/^# requirepass .*/requirepass $REDIS_PASS/" $REDIS_CONF
    sed -i "s/^requirepass .*/requirepass $REDIS_PASS/" $REDIS_CONF
else
    echo "requirepass $REDIS_PASS" >> $REDIS_CONF
fi

# 4. Configure TLS if requested
if [ "$ENABLE_TLS" == "--tls" ]; then
    echo "Generating SSL/TLS Certificates..."
    mkdir -p /etc/redis/tls
    chmod 755 /etc/redis/tls

    # Generate CA, Server Key, and Certificate
    openssl genrsa -out /etc/redis/tls/ca.key 4096
    openssl req -x509 -new -nodes -sha256 -key /etc/redis/tls/ca.key -days 3650 -subj "/CN=Redis-CA" -out /etc/redis/tls/ca.crt
    openssl genrsa -out /etc/redis/tls/redis.key 2048
    openssl req -new -sha256 -key /etc/redis/tls/redis.key -subj "/CN=Redis-Server" -out /etc/redis/tls/redis.csr
    openssl x509 -req -in /etc/redis/tls/redis.csr -CA /etc/redis/tls/ca.crt -CAkey /etc/redis/tls/ca.key -CAcreateserial -out /etc/redis/tls/redis.crt -days 365

    chown -R redis:redis /etc/redis/tls
    chmod 600 /etc/redis/tls/redis.key

    # Update redis.conf for TLS
    # Disable non-TLS port for maximum security or keep it on 0.0.0.0
    sed -i "s/^port .*/port 0/" $REDIS_CONF
    
    # Add TLS settings
    cat >> $REDIS_CONF <<EOF

# TLS Configuration
tls-port 6379
tls-cert-file /etc/redis/tls/redis.crt
tls-key-file /etc/redis/tls/redis.key
tls-ca-cert-file /etc/redis/tls/ca.crt
tls-auth-clients no
EOF

    echo "TLS Certificates generated and Configured."
    echo "NOTE: You will need ca.crt on your client to verify connection if rejectUnauthorized is true."
fi

echo "Configuring Firewall (UFW)..."

if command -v ufw > /dev/null; then
    if [ "$CLIENT_IP" == "ANY" ] || [ "$CLIENT_IP" == "0.0.0.0" ]; then
        ufw allow 6379/tcp
        echo "Firewall: Allowed port 6379 from ANY"
    else
        ufw allow from $CLIENT_IP to any port 6379 proto tcp
        echo "Firewall: Allowed port 6379 from $CLIENT_IP"
    fi
    ufw reload
else
    echo "UFW not found. Please manually open port 6379 in your firewall."
fi

echo "Restarting Redis service..."
systemctl restart redis-server || service redis-server restart

echo "------------------------------------------------"
echo "Redis Setup Complete!"
echo "Host: $(curl -s https://ifconfig.me)"
echo "Port: 6379"
echo "Password: $REDIS_PASS"
echo "------------------------------------------------"