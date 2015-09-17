#!/bin/sh
git svn rebase && rsync --delete -r dist/ fkkorp@k2.spraakdata.gu.se:/var/www/html_sb/korp