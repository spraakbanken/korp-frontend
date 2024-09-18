#!/bin/bash

DIR=$(dirname "$0")

# CSV header corresponding to lines in the metrics
echo "Commit,Version,Date,TS,JS,TS%,lib,test,Dependencies,window,Directives,Components"

# Check out each tagged version and run metrics
# Skip v6.x, it had lots of dependencies checked in
for TAG in $(git tag | grep -v 'v6'); do
    git checkout -q "$TAG"
    DATE=$(git show --no-patch --format=%cs)
    # Output as CSV rows
    "$DIR"/fe-stats-get.sh -q | paste -sd , -
done
