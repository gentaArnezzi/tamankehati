#!/bin/bash
# Restore a PostgreSQL backup into the production container.

set -euo pipefail

DUMP_FILE="${1:-}"
FORCE_RESTORE="${FORCE_RESTORE:-false}"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

if [ -z "${DUMP_FILE}" ]; then
    echo "Usage: ./scripts/restore-database.sh /path/to/backup.sql[.gz|.dump]"
    exit 1
fi

if [ ! -f "${DUMP_FILE}" ]; then
    echo "Backup file not found: ${DUMP_FILE}"
    exit 1
fi

if [ -f ".env" ]; then
    set -a
    . ./.env
    set +a
fi

DB_NAME="${POSTGRES_DB:-kehati_db}"
DB_USER="${POSTGRES_USER:-kehati_user}"
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-}"

if [ -z "${POSTGRES_CONTAINER}" ]; then
    if docker ps --format '{{.Names}}' | grep -q '^kehati-postgres-prod$'; then
        POSTGRES_CONTAINER="kehati-postgres-prod"
    elif docker ps --format '{{.Names}}' | grep -q '^tamankehati-postgres-prod$'; then
        POSTGRES_CONTAINER="tamankehati-postgres-prod"
    else
        echo "Postgres container not found."
        exit 1
    fi
fi

if [ "${FORCE_RESTORE}" != "true" ]; then
    echo "Set FORCE_RESTORE=true to acknowledge overwrite risk before restoring ${DUMP_FILE}."
    exit 1
fi

log "Restoring ${DUMP_FILE} into ${POSTGRES_CONTAINER}/${DB_NAME}"

case "${DUMP_FILE}" in
    *.sql.gz)
        gzip -dc "${DUMP_FILE}" | docker exec -i "${POSTGRES_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}"
        ;;
    *.sql)
        docker exec -i "${POSTGRES_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}" < "${DUMP_FILE}"
        ;;
    *.dump|*.backup)
        cat "${DUMP_FILE}" | docker exec -i "${POSTGRES_CONTAINER}" pg_restore -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists --no-owner --no-privileges
        ;;
    *)
        echo "Unsupported backup format: ${DUMP_FILE}"
        exit 1
        ;;
esac

log "Database restore completed"
