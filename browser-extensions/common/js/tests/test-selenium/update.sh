export USER_AGENT='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'
export TARGET_ROOT_DIR="`pwd`/mock-parkrun-sites/sites"

curl -H "user-agent: ${USER_AGENT}" https://www.parkrun.org.uk/parkrunner/1309364/all/ -o "${TARGET_ROOT_DIR}/parkrun.org.uk/contents/parkrunner/1309364/all/index.html"
curl -H "user-agent: ${USER_AGENT}" https://www.parkrun.org.uk/parkrunner/1309364/ -o "${TARGET_ROOT_DIR}/parkrun.org.uk/contents/parkrunner/1309364/index.html"

curl -H "user-agent: ${USER_AGENT}" https://www.parkrun.com.de/parkrunner/1309364/all/ -o "${TARGET_ROOT_DIR}/parkrun.com.de/contents/parkrunner/1309364/all/index.html"
curl -H "user-agent: ${USER_AGENT}" https://www.parkrun.com.de/parkrunner/1309364/ -o "${TARGET_ROOT_DIR}/parkrun.com.de/contents/parkrunner/1309364/index.html"