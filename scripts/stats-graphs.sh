#!/bin/bash

# Lines in JS/TS files
cat ../fe-stats.csv | qsvlite select Date,JS,TS | graph - --xcol 1 --yrange 0:40000 --ylabel Lines -o ../fe-stats-ts.png

# Size (KB) of full repo vs lib/
cat ../fe-stats.csv | qsvlite select Date,RepoSize,LibSize | qsvlite slice -s 2 | graph - -x 1 --ylabel KB -o ../fe-stats-size.png

# Counts of direct dependences, global window vars, AngularJS Directives and Components
cat ../fe-stats.csv | qsvlite select Date,Deps,Window,Directives,Components | graph - --xcol 1 --ylabel Count -o ../fe-stats-count.png

