#!/usr/bin/python

from subprocess import check_output
import os, sys

args = sys.argv[1:]

print check_output(["svn", "up"])

if not os.path.exists("dist") and not "no_build" in args:
    print "building..."
    print check_output(["yeoman", "build"])
else:
    print "build exists."
print "syncing to server."

# print check_output(["rsync", "-r", "dist/*", "johanrox@k2.spraakdata.gu.se:/var/www/html_sb/korp"], shell=True)
print check_output("rsync -r dist/* johanrox@k2.spraakdata.gu.se:/var/www/html_sb/korp", shell=True)

if not "no_clean" in args:
    print check_output(["yeoman", "clean"])

print
print
print "Done."