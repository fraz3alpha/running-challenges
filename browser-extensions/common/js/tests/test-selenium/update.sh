export USER_AGENT='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'
export TARGET_ROOT_DIR="`pwd`/mock-parkrun-sites/sites"
export NGINX_CONF_D_ROOT_DIR="`pwd`/mock-parkrun-sites/nginx/conf.d"

# Parkrun events in Russia are suspended, add  "parkrun.ru" back when they reappear
declare -a PARKRUN_HOSTNAMES=( "parkrun.org.uk" "parkrun.com.de" "parkrun.pl" "parkrun.jp" "parkrun.com.us" "parkrun.com.au" "parkrun.co.nz" "parkrun.ca" "parkrun.ie" "parkrun.co.za" "parkrun.us" "parkrun.sg" "parkrun.it" "parkrun.dk" "parkrun.se" "parkrun.fi" "parkrun.fr" "parkrun.no" "parkrun.my" "parkrun.co.nl" "parkrun.co.at" )
declare -a PARKRUNNER_IDS=("1309364" "472")

# Fetch the common files
mkdir -p "${TARGET_ROOT_DIR}/images.parkrun.com/contents/"
curl --fail -H "user-agent: ${USER_AGENT}" https://images.parkrun.com/events.json -o "${TARGET_ROOT_DIR}/images.parkrun.com/contents/events.json"
sleep 1
mkdir -p "${TARGET_ROOT_DIR}/wiki.parkrun.com/contents/index.php/"
curl --fail -H "user-agent: ${USER_AGENT}" https://wiki.parkrun.com/index.php/Technical_Event_Information -o "${TARGET_ROOT_DIR}/wiki.parkrun.com/contents/index.php/Technical_Event_Information"
sleep 1

for PARKRUN_HOSTNAME in "${PARKRUN_HOSTNAMES[@]}"
do

    for PARKRUNNER_ID in "${PARKRUNNER_IDS[@]}"
    do

        mkdir -p "${TARGET_ROOT_DIR}/${PARKRUN_HOSTNAME}/contents/parkrunner/${PARKRUNNER_ID}/all/"

        # Do the curls, but with a short sleep, so that we don't make a lot of requests to the servers in a short time
        curl --fail -H "user-agent: ${USER_AGENT}" https://www.${PARKRUN_HOSTNAME}/parkrunner/${PARKRUNNER_ID}/all/ -o "${TARGET_ROOT_DIR}/${PARKRUN_HOSTNAME}/contents/parkrunner/${PARKRUNNER_ID}/all/index.html"
        sleep 1
        curl --fail -H "user-agent: ${USER_AGENT}" https://www.${PARKRUN_HOSTNAME}/parkrunner/${PARKRUNNER_ID}/ -o "${TARGET_ROOT_DIR}/${PARKRUN_HOSTNAME}/contents/parkrunner/${PARKRUNNER_ID}/index.html"
        sleep 1

    done

    # Write out the Nginx configuration file for this server
    CONF_FILE="${NGINX_CONF_D_ROOT_DIR}/${PARKRUN_HOSTNAME}.conf"
    echo "Writing out Nginx conf file to ${CONF_FILE}"

    cat > "${CONF_FILE}" << EOL
server {
    listen  443 ssl;
    server_name www.${PARKRUN_HOSTNAME};

    ssl_certificate     /etc/nginx/cert/cert.pem;
    ssl_certificate_key /etc/nginx/cert/key.pem;

    location / {
        root /usr/share/nginx/html/${PARKRUN_HOSTNAME}/contents;
        add_header X-Running-Challenges mock-server;
        index index.html;
    }
}

EOL

done
