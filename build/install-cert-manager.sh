#!/bin/bash
# Copyright (c) 2020 Red Hat, Inc.

if [ $(oc get ns cert-manager | grep Active | wc -l | tr -d '[:space:]') -eq 1 ]; then
    echo "Cert manager already installed"
else 
    echo "Install cert manager on managed"
    oc apply --validate=false -f https://github.com/jetstack/cert-manager/releases/download/v1.0.1/cert-manager.yaml
fi