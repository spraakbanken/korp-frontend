#!/bin/bash
set -x

if [ $# -ne 1 ]; then
    echo "Usage: $0 VERSION"
    exit 1
fi

rm -r release
mkdir release

grunt release

grunt clean:server
grunt clean:e2e

# make dist release zip
DIST_NAME="korp-frontend-$1-dist"
cp -r dist/ "release/$DIST_NAME"
cd release
zip --quiet -r "$DIST_NAME.zip" $DIST_NAME
rm -r $DIST_NAME

# make src release zip
SRC_NAME="korp-frontend-$1-src"
mkdir $SRC_NAME

cd ..
CHANGED_FILES="dist/korp.yaml"
INCLUDED_FILES="app/ bower.json LICENSE package.json Gruntfile.js README.md test/"
cp -r $INCLUDED_FILES $CHANGED_FILES "release/$SRC_NAME"
cd release
zip --quiet -r "$SRC_NAME.zip" $SRC_NAME
rm -r $SRC_NAME

