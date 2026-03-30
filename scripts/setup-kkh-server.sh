#!/bin/bash
# Prepare the KKH Ubuntu host for the initial Taman Kehati deployment.

set -euo pipefail

SSH_PORT="${SSH_PORT:-5617}"
APP_DIR="${APP_DIR:-/opt/tamankehati}"
DEPLOY_USER="${DEPLOY_USER:-ubuntu}"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

require_root() {
    if [ "${EUID}" -ne 0 ]; then
        echo "Run this script with sudo."
        exit 1
    fi
}

install_docker() {
    if command -v docker >/dev/null 2>&1; then
        log "Docker already installed"
        return
    fi

    log "Installing Docker Engine"
    apt-get update
    apt-get install -y ca-certificates curl gnupg
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "${VERSION_CODENAME}") stable" | \
      tee /etc/apt/sources.list.d/docker.list >/dev/null
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
}

configure_firewall() {
    if ! command -v ufw >/dev/null 2>&1; then
        log "Installing ufw"
        apt-get update
        apt-get install -y ufw
    fi

    log "Configuring UFW for SSH ${SSH_PORT}, HTTP 8080, HTTPS 443"
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow "${SSH_PORT}/tcp"
    ufw allow 8080/tcp
    ufw allow 443/tcp
    ufw --force enable
    ufw status verbose
}

prepare_app_dir() {
    log "Preparing application directory at ${APP_DIR}"
    mkdir -p "${APP_DIR}/backups" "${APP_DIR}/logs"
    chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "${APP_DIR}"
}

require_root
install_docker
usermod -aG docker "${DEPLOY_USER}" || true
prepare_app_dir
configure_firewall

log "Server preparation complete"
log "Next steps:"
log "1. Copy the repository or deployment bundle into ${APP_DIR}"
log "2. Create ${APP_DIR}/.env from env.production.example"
log "3. Run ./scripts/deploy-kkh.sh from ${APP_DIR}"
