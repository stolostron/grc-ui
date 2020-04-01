###############################################################################
# Licensed Materials - Property of IBM Copyright IBM Corporation 2017, 2019. All Rights Reserved.
# U.S. Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP
# Schedule Contract with IBM Corp.
#
# Contributors:
#  IBM Corporation - initial API and implementation
###############################################################################

include build/Configfile

-include $(shell curl -H 'Authorization: token ${GITHUB_TOKEN}' -H 'Accept: application/vnd.github.v4.raw' -L https://api.github.com/repos/open-cluster-management/build-harness-extensions/contents/templates/Makefile.build-harness-bootstrap -o .build-harness-bootstrap; echo .build-harness-bootstrap)

default::
	@echo "Build Harness Bootstrapped"

install:
	npm install

copyright-check:
	./build/copyright-check.sh $(TRAVIS_BRANCH) $(TRAVIS_PULL_REQUEST_BRANCH)

lint:
	npm run lint

prune:
	npm prune --production

build-prod:
	npm run build:production

unit-test:
	if [ ! -d "test-output" ]; then \
		mkdir test-output; \
	fi
	npm test

e2e-test:
	npm install
	docker network create --subnet 10.10.0.0/16 test-network
	docker pull quay.io/open-cluster-management/grc-ui:3.6.0-PR36-fcc3b830b0c0cf89cb26f5d04da254aca2261c10
	docker pull quay.io/open-cluster-management/grc-ui-api:3.6.0-PR10-0f126ba12cb0b059f37b54e418225fa0e27ffd5d
	docker run --network test-network -d -e NODE_ENV=development -e SERVICEACCT_TOKEN=7sE8Q9sHK28IZn6OCnLmFGd7pmg9tfag0SaHK9s_bjk -e API_SERVER_URL=https://api.chocolate.dev08.red-chesterfield.com:6443 --name grcuiapi --ip 10.10.0.5 -t -i -p 4000:4000 quay.io/open-cluster-management/grc-ui-api:3.6.0-PR10-0f126ba12cb0b059f37b54e418225fa0e27ffd5d
	docker run --network test-network --ip 10.10.0.6 -d -e NODE_ENV=development -e SERVICEACCT_TOKEN=7sE8Q9sHK28IZn6OCnLmFGd7pmg9tfag0SaHK9s_bjk -e headerUrl=$(headerUrl) -e OAUTH2_REDIRECT_URL=$(OAUTH2_REDIRECT_URL) -e grcUiApiUrl=https://10.10.0.5:4000/grcuiapi -e OAUTH2_CLIENT_ID=$(OAUTH2_CLIENT_ID) -e OAUTH2_CLIENT_SECRET=$(OAUTH2_CLIENT_SECRET) -e API_SERVER_URL=$(API_SERVER_URL) --name grcui -t -i -p 3000:3000 quay.io/open-cluster-management/grc-ui:3.6.0-PR36-fcc3b830b0c0cf89cb26f5d04da254aca2261c10
	docker container ls -a
	npm run test:e2e

e2e-logs:
	docker ps -a --no-trunc
	docker ps -aq | xargs -L 1 docker logs
