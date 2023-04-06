export USER_AGENT='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'
export TARGET_ROOT_DIR="`pwd`/mock-parkrun-sites/sites"

declare -a PARKRUN_HOSTNAMES=( "parkrun.org.uk" "parkrun.com.de" "parkrun.pl" "parkrun.jp" )

for PARKRUN_HOSTNAME in "${PARKRUN_HOSTNAMES[@]}"
do
    mkdir -p "${TARGET_ROOT_DIR}/${PARKRUN_HOSTNAME}/contents/parkrunner/1309364/all/"
    curl -H "user-agent: ${USER_AGENT}" https://www.${PARKRUN_HOSTNAME}/parkrunner/1309364/all/ -o "${TARGET_ROOT_DIR}/${PARKRUN_HOSTNAME}/contents/parkrunner/1309364/all/index.html"
    curl -H "user-agent: ${USER_AGENT}" https://www.${PARKRUN_HOSTNAME}/parkrunner/1309364/ -o "${TARGET_ROOT_DIR}/${PARKRUN_HOSTNAME}/contents/parkrunner/1309364/index.html"
done
