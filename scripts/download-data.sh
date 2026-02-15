#!/usr/bin/env bash
set -euo pipefail

DATA_DIR="scripts/raw-data"
mkdir -p "$DATA_DIR"

echo "=== Downloading Land Registry Price Paid Data (complete) ==="
echo "This file is ~4.3GB and may take a while..."
curl -L -o "$DATA_DIR/pp-complete.csv" \
  "http://prod.publicdata.landregistry.gov.uk.s3-website-eu-west-1.amazonaws.com/pp-complete.csv"

echo ""
echo "=== Downloading UK Postcode District Polygons ==="
if [ ! -d "$DATA_DIR/uk-postcode-polygons" ]; then
  git clone --depth 1 https://github.com/missinglink/uk-postcode-polygons.git "$DATA_DIR/uk-postcode-polygons"
else
  echo "Already cloned, skipping."
fi

echo ""
echo "=== Downloads complete ==="
echo "Land Registry CSV: $DATA_DIR/pp-complete.csv"
echo "Postcode polygons: $DATA_DIR/uk-postcode-polygons/geojson/"
