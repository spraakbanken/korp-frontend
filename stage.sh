#!/bin/sh
git svn rebase && rsync --delete -r dist/ johanrox@k2.spraakdata.gu.se:/var/www/html_sb/korplabb