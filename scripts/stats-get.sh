#!/bin/bash

# Add `-q` to skip labels
while getopts "q" flag; do
    case $flag in
    q) OPT_QUIET=1 ;;
    esac
done

function label() {
    # Say label unless -q was given
    [ -z $OPT_QUIET ] && echo -ne "$1:\t"
    # Say value if present
    [ -n "$2" ] && echo $2
}

WC_JS=$(find app -type f -name '*.js' | xargs wc -l --total=only)
WC_TS=$(find app -type f -name '*.ts' | xargs wc -l --total=only)
TS_RATIO=$(node -pe "Math.round($WC_TS / ($WC_TS + $WC_JS) * 100)")

# TODO The git commands output control chars, and they bork the label strings
label "Commit hash"
git show --no-patch --format="%h"

label "Tag"
git tag --points-at HEAD | grep "^v"

label "Date"
git show --no-patch --format=%cs

label "TypeScript lines of code" $WC_TS
label "JavaScript lines of code" $WC_JS
label "Ratio of TypeScript" $TS_RATIO%

label "Size of repo (KB)"
git ls-files -z | xargs -0 du --apparent-size -c | tail -n1 | cut -f1

label "Size of lib/ (KB)"
du --apparent-size -s app/lib/ | cut -f1

label "Test lines of code"
find test/ -type f | xargs wc -l --total=only

label "Direct dependencies"
cat package.json | jq '.dependencies * .devDependencies | keys | length'

label "Assignments to \`window\`"
grep -roE 'window\.\w+ =' app/scripts/ | grep -v window.location | wc -l

label "AngularJS directives"
grep -r .directive\( app/scripts/ | wc -l

label "AngularJS components"
grep -r .component\( app/scripts/ | wc -l
