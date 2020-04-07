#!/bin/bash
docker network create --subnet 10.10.0.0/16 test-network
docker pull quay.io/open-cluster-management/grc-ui:${COMPONENT_VERSION}${COMPONENT_TAG_EXTENSION}
docker pull quay.io/open-cluster-management/grc-ui-api:dev
export SELENIUM_USER=$OC_CLUSTER_USER
export SELENIUM_PASSWORD=$OC_CLUSTER_PASS
export SERVICEACCT_TOKEN=`/home/travis/build/open-cluster-management/grc-ui/build-harness/vendor/oc whoami --show-token`
echo $SERVICEACCT_TOKEN
echo "docker run --network test-network -d --ip 10.10.0.5 -t -i -p 4000:4000 --name grcuiapi -e NODE_ENV=development -e SERVICEACCT_TOKEN=$SERVICEACCT_TOKEN -e API_SERVER_URL=$API_SERVER_URL quay.io/open-cluster-management/grc-ui-api:dev"
docker run --network test-network -d --ip 10.10.0.5 -t -i -p 4000:4000 --name grcuiapi -e NODE_ENV=development -e SERVICEACCT_TOKEN=$SERVICEACCT_TOKEN -e API_SERVER_URL=$API_SERVER_URL quay.io/open-cluster-management/grc-ui-api:dev
echo "docker run --network test-network -d --ip 10.10.0.6 -t -i -p 3000:3000 --name grcui -e NODE_ENV=development -e SERVICEACCT_TOKEN=$SERVICEACCT_TOKEN -e headerUrl=$headerUrl -e OAUTH2_REDIRECT_URL=$OAUTH2_REDIRECT_URL -e grcUiApiUrl=https://10.10.0.5:4000/grcuiapi -e OAUTH2_CLIENT_ID=$OAUTH2_CLIENT_ID -e OAUTH2_CLIENT_SECRET=$OAUTH2_CLIENT_SECRET -e API_SERVER_URL=$API_SERVER_URL quay.io/open-cluster-management/grc-ui:${COMPONENT_VERSION}${COMPONENT_TAG_EXTENSION}"
docker run --network test-network -d --ip 10.10.0.6 -t -i -p 3000:3000 --name grcui -e NODE_ENV=development -e SERVICEACCT_TOKEN=$SERVICEACCT_TOKEN -e headerUrl=$headerUrl -e OAUTH2_REDIRECT_URL=$OAUTH2_REDIRECT_URL -e grcUiApiUrl=https://10.10.0.5:4000/grcuiapi -e OAUTH2_CLIENT_ID=$OAUTH2_CLIENT_ID -e OAUTH2_CLIENT_SECRET=$OAUTH2_CLIENT_SECRET -e API_SERVER_URL=$API_SERVER_URL quay.io/open-cluster-management/grc-ui:${COMPONENT_VERSION}${COMPONENT_TAG_EXTENSION}
docker container ls -a
npm run test:e2e