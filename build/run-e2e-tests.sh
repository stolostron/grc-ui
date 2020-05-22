#!/bin/bash
# Licensed Materials - Property of IBM
# (c) Copyright IBM Corporation 2020. All Rights Reserved.
# Note to U.S. Government Users Restricted Rights:
# Use, duplication or disclosure restricted by GSA ADP Schedule
# Contract with IBM Corp.
# Copyright (c) 2020 Red Hat, Inc.
set -e
UI_CURRENT_IMAGE=$1

echo "Login hub to clean up"
export OC_CLUSTER_URL=$OC_HUB_CLUSTER_URL
export OC_CLUSTER_PASS=$OC_HUB_CLUSTER_PASS
make oc/login
oc delete policy.policy.mcm.ibm.com -n default --all || true
# placementbindings.mcm.ibm.com throws error when doesn't exist
oc delete placementbindings.mcm.ibm.com  -n default --all || true
oc delete placementrule  -n default --all || true

echo "Logout"
export OC_COMMAND=logout
make oc/command

echo "Login managed to clean up"
export OC_CLUSTER_URL=$OC_MANAGED_CLUSTER_URL
export OC_CLUSTER_PASS=$OC_MANAGED_CLUSTER_PASS
make oc/login
oc delete pod --all -n default || true
oc delete clusterrolebinding -l e2e=true

echo "Logout"
export OC_COMMAND=logout
make oc/command

echo "Login hub again"
export OC_CLUSTER_URL=$OC_HUB_CLUSTER_URL
export OC_CLUSTER_PASS=$OC_HUB_CLUSTER_PASS
make oc/login
export SERVICEACCT_TOKEN=`${BUILD_HARNESS_PATH}/vendor/oc whoami --show-token`
echo "SERVICEACCT_TOKEN=$SERVICEACCT_TOKEN"

# docker network create --subnet 10.10.0.0/16 test-network

make docker/login
export DOCKER_URI=quay.io/open-cluster-management/grc-ui-api:latest-dev
make docker/pull

export SELENIUM_USER=$OC_CLUSTER_USER
export SELENIUM_PASSWORD=$OC_HUB_CLUSTER_PASS

# echo "whoami"
# whoami

# docker run -p 3000:3000 -u root:root -v $(pwd)/test-output:/opt/app-root/src/grc-ui/test-output -e NODE_ENV=development -e SERVICEACCT_TOKEN=$SERVICEACCT_TOKEN -e headerUrl=$headerUrl -e OAUTH2_REDIRECT_URL=$OAUTH2_REDIRECT_URL -e grcUiApiUrl=https://10.10.0.5:4000/grcuiapi -e OAUTH2_CLIENT_ID=$OAUTH2_CLIENT_ID -e OAUTH2_CLIENT_SECRET=$OAUTH2_CLIENT_SECRET -e API_SERVER_URL=$OC_HUB_CLUSTER_URL $UI_CURRENT_IMAGE ls -al
# docker run -p 3000:3000 -u root:root  -v $(pwd)/test-output:/opt/app-root/src/grc-ui/test-output -e NODE_ENV=development -e SERVICEACCT_TOKEN=$SERVICEACCT_TOKEN -e headerUrl=$headerUrl -e OAUTH2_REDIRECT_URL=$OAUTH2_REDIRECT_URL -e grcUiApiUrl=https://10.10.0.5:4000/grcuiapi -e OAUTH2_CLIENT_ID=$OAUTH2_CLIENT_ID -e OAUTH2_CLIENT_SECRET=$OAUTH2_CLIENT_SECRET -e API_SERVER_URL=$OC_HUB_CLUSTER_URL $UI_CURRENT_IMAGE mkdir test-output/test

ls $(pwd)/test-output -al

# docker run -t -i -p 4000:4000 --name grcuiapi -e NODE_ENV=development -e SERVICEACCT_TOKEN=$SERVICEACCT_TOKEN -e API_SERVER_URL=$OC_HUB_CLUSTER_URL $DOCKER_URI
export NODE_ENV=development 
# export SERVICEACCT_TOKEN=$SERVICEACCT_TOKEN 
# export headerUrl=$headerUrl 
# export OAUTH2_REDIRECT_URL=$OAUTH2_REDIRECT_URL 
# export grcUiApiUrl=https://10.10.0.5:4000/grcuiapi 
# export OAUTH2_CLIENT_ID=$OAUTH2_CLIENT_ID 
# export OAUTH2_CLIENT_SECRET=$OAUTH2_CLIENT_SECRET 
export API_SERVER_URL=$OC_HUB_CLUSTER_URL 
npm run start:instrument &

# docker run --network test-network -d --ip 10.10.0.6 -t -i -p 3000:3000 -u root:root --name grcui -v $(pwd)/test-output:/opt/app-root/src/grc-ui/test-output -e NODE_ENV=development -e SERVICEACCT_TOKEN=$SERVICEACCT_TOKEN -e headerUrl=$headerUrl -e OAUTH2_REDIRECT_URL=$OAUTH2_REDIRECT_URL -e grcUiApiUrl=https://10.10.0.5:4000/grcuiapi -e OAUTH2_CLIENT_ID=$OAUTH2_CLIENT_ID -e OAUTH2_CLIENT_SECRET=$OAUTH2_CLIENT_SECRET -e API_SERVER_URL=$OC_HUB_CLUSTER_URL $UI_CURRENT_IMAGE npm run start:instrument
# docker ps -a
# docker inspect grcui

# wait for container to fully started
sleep 10

# npm run test:e2e-headless

# kill the node process to let nyc generate coverage report
pkill node
sleep 10
# docker exec -it grcui pkill node
# sleep 10
ls $(pwd)/test-output -al
