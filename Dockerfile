FROM postgres:18-alpine

# Install PostGIS extension
RUN apk add --no-cache postgis

# Custom configuration mount points
COPY conf/postgresql.conf /etc/postgresql/postgresql.conf
COPY init/ /docker-entrypoint-initdb.d/

# Ensure proper permissions
RUN chown -R postgres:postgres /docker-entrypoint-initdb.d/