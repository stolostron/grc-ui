#!/bin/bash

###############################################################################
# Copyright (c) 2020 Red Hat, Inc.
###############################################################################
echo "Initiating tests..."

if [ -z "$BROWSER" ]; then
  echo "BROWSER not exported; setting to 'chrome' (options available: 'chrome', 'firefox')"
  export BROWSER="chrome"
fi

# Load test config mounted at /resources/cypressEnvConfig.yaml
OPTIONS_FILE=/resources/cypressEnvConfig.yaml
USER_OPTIONS_FILE=./cypressEnvConfig.yaml
if [ -f $OPTIONS_FILE ]; then
  echo "Using test config from '/resources/cypressEnvConfig.yaml' file."
  export CYPRESS_OPTIONS_HUB_BASEDOMAIN=`yq r $OPTIONS_FILE 'options.hub.baseDomain'`
  export CYPRESS_OPTIONS_HUB_USER=`yq r $OPTIONS_FILE 'options.hub.user'`
  export CYPRESS_OPTIONS_HUB_PASSWORD=`yq r $OPTIONS_FILE 'options.hub.password'`
elif [ -f $USER_OPTIONS_FILE ]; then
  echo "Using test config from '$USER_OPTIONS_FILE' file."
  export CYPRESS_OPTIONS_HUB_BASEDOMAIN=`yq r $USER_OPTIONS_FILE 'options.hub.baseDomain'`
  export CYPRESS_OPTIONS_HUB_USER=`yq r $USER_OPTIONS_FILE 'options.hub.user'`
  export CYPRESS_OPTIONS_HUB_PASSWORD=`yq r $USER_OPTIONS_FILE 'options.hub.password'`
else
  echo -e "Options file does not exist, using test config from travis e2e testing environment variables.\n"
  export CYPRESS_OPTIONS_HUB_BASEDOMAIN=$BASE_DOMAIN
  export CYPRESS_OPTIONS_HUB_USER=$OC_CLUSTER_USER
  export CYPRESS_OPTIONS_HUB_PASSWORD=$OC_HUB_CLUSTER_PASS
fi

export CYPRESS_OPTIONS_BASE_URL=https://multicloud-console.apps.$CYPRESS_OPTIONS_HUB_BASEDOMAIN
export CYPRESS_OPTIONS_HUB_CLUSTER_URL=$OC_HUB_CLUSTER_URL

echo -e "Running tests with the following environment:\n"
echo -e "\tCYPRESS_OPTIONS_HUB_BASEDOMAIN : $CYPRESS_OPTIONS_HUB_BASEDOMAIN"
echo -e "\tCYPRESS_OPTIONS_BASE_URL   : $CYPRESS_OPTIONS_BASE_URL"
echo -e "\tCYPRESS_OPTIONS_HUB_CLUSTER_URL   : $CYPRESS_OPTIONS_HUB_CLUSTER_URL"
echo -e "\tCYPRESS_OPTIONS_HUB_USER       : $CYPRESS_OPTIONS_HUB_USER"

echo -e "\nLogging into Kube API server\n"
oc login --server=${CYPRESS_OPTIONS_HUB_CLUSTER_URL} -u $CYPRESS_OPTIONS_HUB_USER -p $CYPRESS_OPTIONS_HUB_PASSWORD --insecure-skip-tls-verify

testCode=0

# We are caching the cypress binary for containerization, therefore it does not need npx. However, locally we need it.
HEADLESS="--headless"
if [[ "$LIVE_MODE" == true ]]; then
  HEADLESS=""
fi

if [ "$NODE_ENV" == "dev" ]; then
  npx cypress run --browser $BROWSER $HEADLESS --spec ./tests/cypress/tests/*.spec.js --reporter cypress-multi-reporters  
elif [ "$NODE_ENV" == "debug" ]; then
  npx cypress open --browser $BROWSER --config numTestsKeptInMemory=0
else 
  cypress run --browser $BROWSER $HEADLESS --spec ./tests/cypress/tests/*.spec.js --reporter cypress-multi-reporters
fi

