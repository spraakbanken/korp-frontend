#!/bin/bash

DIR=$(dirname $0)
cd "$DIR"/..
cp scripts/*.sh .
./stats-assemble.sh > ../fe-stats.csv
./stats-graphs.sh
git checkout code-metrics
