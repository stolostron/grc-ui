#!/bin/bash
set -e
UI_CURRENT_IMAGE=$1

make oc/install
make oc/login

docker network create --subnet 10.10.0.0/16 test-network

make docker/login
export DOCKER_URI=quay.io/open-cluster-management/grc-ui-api:latest-dev
make docker/pull

export SELENIUM_USER=$OC_CLUSTER_USER
export SELENIUM_PASSWORD=$OC_CLUSTER_PASS
export SERVICEACCT_TOKEN=`${BUILD_HARNESS_PATH}/vendor/oc whoami --show-token`
echo "SERVICEACCT_TOKEN=$SERVICEACCT_TOKEN"

docker run --network test-network -d --ip 10.10.0.5 -t -i -p 4000:4000 --name grcuiapi -e NODE_ENV=development -e SERVICEACCT_TOKEN=$SERVICEACCT_TOKEN -e API_SERVER_URL=$OC_CLUSTER_URL $DOCKER_URI
docker run --network test-network -d --ip 10.10.0.6 -t -i -p 3000:3000 --name grcui -e NODE_ENV=development -e SERVICEACCT_TOKEN=$SERVICEACCT_TOKEN -e headerUrl=$headerUrl -e OAUTH2_REDIRECT_URL=$OAUTH2_REDIRECT_URL -e grcUiApiUrl=https://10.10.0.5:4000/grcuiapi -e OAUTH2_CLIENT_ID=$OAUTH2_CLIENT_ID -e OAUTH2_CLIENT_SECRET=$OAUTH2_CLIENT_SECRET -e API_SERVER_URL=$OC_CLUSTER_URL $UI_CURRENT_IMAGE
docker container ls -a

if [$TRAVIS == "true"] 
then
    npm i chromedriver@73
fi

npm run test:e2e