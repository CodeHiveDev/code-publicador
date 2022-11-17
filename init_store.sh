#!/bin/bash

export WORKSPACE=$1
export STORE=$2
export LAYER=$3

# Publish a new mosaic (publica toda la capa, rompe la configuración si xiste)
curl -v -u admin:geoserver -XPUT \
    -H "Content-type: application/zip" \
    --data-binary @init.zip \
    "http://localhost:8080/geoserver/rest/workspaces/${WORKSPACE}/coveragestores/${STORE}/file.imagemosaic?configure=none"

