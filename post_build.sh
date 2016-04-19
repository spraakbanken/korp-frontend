VERSION=$(python -c 'import json; print json.load(open("package.json"))["version"]')
DATE=$(date "+%Y%m%dT%H%M%S")
zip -rq - dist | \
    ssh fkkorp@k2.spraakdata.gu.se \
        "cat > /export/htdocs_sb/pub/korp.dist/korp-frontend-$VERSION-$DATE-dist.zip"

echo "post-build complete."