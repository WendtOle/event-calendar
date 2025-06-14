#!/bin/bash -ex

docker run -it \
  -e PBF_URL=https://download.geofabrik.de/europe/germany/berlin-latest.osm.pbf\
  -p 8080:8080 \
  --name nominatim \
  mediagis/nominatim:5.1
