#!/bin/bash

# Copyright (c) 2020 Red Hat, Inc.

# From the grc-ui project directory, invoke as:
#     ./build/rbac-clean.sh

RBAC_DIR=${1:-.}/tests/e2e/yaml/rbac_test

if [ ! -d ${RBAC_DIR} ]; then
  echo "Error: Directory ${RBAC_DIR} does not exist."
  exit 1
fi

oc delete -n openshift-config secret e2e-users || true
IDPROVIDERS=($(oc get oauth cluster -o jsonpath='{.spec.identityProviders[*].name}'))
for index in ${!IDPROVIDERS[@]}; do
  if [ ${IDPROVIDERS[${index}]} == "grc-e2e-htpasswd" ]; then
    oc patch -n openshift-config oauth cluster --type json -p '[{"op": "remove","path": "/spec/identityProviders/'${index}'"}]'
  fi
done
oc delete -k ${RBAC_DIR} || true