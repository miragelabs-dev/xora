#!/bin/sh

# Configure nginx based on SSL availability
if [ ! -f /etc/nginx/certs/live/xora.social/fullchain.pem ]; then
    echo "SSL certificates not found. Using HTTP-only configuration..."
    cp -f /etc/nginx/nginx.certbot.conf /etc/nginx/nginx.conf
else
    echo "SSL certificates found. Using HTTPS configuration..."
    cp -f /etc/nginx/nginx.prod.conf /etc/nginx/nginx.conf
fi

# Start nginx with periodic reload
echo "Starting nginx..."
while :; do 
    sleep 6h & wait ${!}
    if [ -f /etc/nginx/certs/live/xora.social/fullchain.pem ]; then
        echo "Reloading nginx with HTTPS configuration..."
        cp -f /etc/nginx/nginx.prod.conf /etc/nginx/nginx.conf
    fi
    nginx -s reload
done & nginx -g "daemon off;"