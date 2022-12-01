#!/bin/bash

export WORKSPACE=$1
export STORE=$2
export LAYER=$3

# Publish a new mosaic (publica toda la capa, rompe la configuración si xiste)
curl -v -u admin:geoserver -XPUT \
    -H "Content-type: application/zip" \
    --data-binary @init_dev.zip \
    "http://k8s-ide-845572b3dc-594062474.us-east-1.elb.amazonaws.com/geoserver/rest/workspaces/${WORKSPACE}/coveragestores/${STORE}/file.imagemosaic?configure=none"

