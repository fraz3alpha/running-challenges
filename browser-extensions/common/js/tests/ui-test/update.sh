export USER_AGENT='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'
export TARGET_ROOT_DIR="`pwd`/supporting-data/sites"
export NGINX_CONF_D_ROOT_DIR="`pwd`/supporting-data/nginx/conf.d"

# Parkrun events in Russia are suspended, add  "parkrun.ru" back when they reappear
declare -a PARKRUN_HOSTNAMES=( "parkrun.org.uk" "parkrun.com.de" "parkrun.pl" "parkrun.jp" "parkrun.us" "parkrun.com.au" "parkrun.co.nz" "parkrun.ca" "parkrun.ie" "parkrun.co.za" "parkrun.us" "parkrun.sg" "parkrun.it" "parkrun.dk" "parkrun.se" "parkrun.fi" "parkrun.fr" "parkrun.lt" "parkrun.no" "parkrun.my" "parkrun.co.nl" "parkrun.co.at" )
# 1309364: Andy Taylor, me
# 482: Danny Norman, has done most things, and at one point, all the running badges
# 88720: Phillip Whettlock, who helped out and has done nearly every volunteer role
# 2705084: Duncan Booth, who has done lead bike, but hasn't run at all - which causes a bug that will need to be fixed!
# 999999: Jakub WOLSKI, as of 2023-06-29, they have done no parkruns, which we want as a testcase. Given this is so old, it's a fair bet that this profile is not active and probably will never get any events associated with it
declare -a PARKRUNNER_IDS=("1309364" "482" "88720" "2705084" "999999")

# Fetch the common files
mkdir -p "${TARGET_ROOT_DIR}/images.parkrun.com/contents/"
# Fetch the events JSON file, and output it in a friendly way, in order, so that the diffs are logical
curl --fail -H "user-agent: ${USER_AGENT}" https://images.parkrun.com/events.json -o "${TARGET_ROOT_DIR}/images.parkrun.com/contents/events.json.temp" && \
  cat "${TARGET_ROOT_DIR}/images.parkrun.com/contents/events.json.temp" | python3 -m json.tool --sort-keys > "${TARGET_ROOT_DIR}/images.parkrun.com/contents/events.json" && \
  rm "${TARGET_ROOT_DIR}/images.parkrun.com/contents/events.json.temp"
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
