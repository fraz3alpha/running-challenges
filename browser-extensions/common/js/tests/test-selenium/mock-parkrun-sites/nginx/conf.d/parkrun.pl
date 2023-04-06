server {
    listen  443 ssl;
    server_name www.parkrun.pl;

    ssl_certificate     /etc/nginx/cert/cert.pem;
    ssl_certificate_key /etc/nginx/cert/key.pem;

    location / {
        root /usr/share/nginx/html/parkrun.pl/contents;
        index index.html;
    }
}