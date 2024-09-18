#!/bin/bash

DIR=$(dirname "$0")

# CSV header corresponding to lines in the metrics
echo "Commit,Version,Date,TS,JS,TS%,RepoSize,LibSize,TestLoc,Deps,Window,Directives,Components"

# Check out each tagged version and run metrics
for TAG in $(git tag); do
    git checkout -q "$TAG"
    DATE=$(git show --no-patch --format=%cs)
    # Output as CSV rows
    "$DIR"/stats-get.sh -q | paste -sd , -
done
