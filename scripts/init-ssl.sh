#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: $0 <domain>"
    exit 1
fi

DOMAIN=$1

mkdir -p ./certs
mkdir -p ./certbot/www

WAIT_TIME=3600

docker compose -f docker-compose.prod.yml run --rm certbot \
    certonly --webroot \
    --webroot-path /var/www/certbot \
    --email admin@${DOMAIN} \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d ${DOMAIN}

docker compose -f docker-compose.prod.yml exec nginx nginx -s reload 