FROM postgres:18-alpine

# Install PostGIS extension
RUN apk add --no-cache postgis

# Custom configuration mount points
COPY postgresql.conf /etc/postgresql/postgresql.conf

# Ensure proper permissions
RUN mkdir -p /docker-entrypoint-initdb.d && chown -R postgres:postgres /docker-entrypoint-initdb.d/