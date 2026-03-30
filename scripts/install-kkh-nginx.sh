#!/bin/bash
# Install host Nginx config for Taman Kehati on the KKH server.

set -euo pipefail

SOURCE_CONF="${1:-deploy-package/nginx/kkh-host.conf}"
TARGET_CONF="/etc/nginx/sites-available/tamankehati"
TARGET_LINK="/etc/nginx/sites-enabled/tamankehati"

if [ ! -f "${SOURCE_CONF}" ]; then
    echo "Config file not found: ${SOURCE_CONF}"
    exit 1
fi

sudo cp "${SOURCE_CONF}" "${TARGET_CONF}"
sudo ln -sfn "${TARGET_CONF}" "${TARGET_LINK}"
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

echo "KKH host Nginx config installed successfully"
