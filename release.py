#!/usr/bin/python

from subprocess import check_output
import os, sys

args = sys.argv[1:]

# print check_output(["git", "svn", "rebase"])

if not os.path.exists("dist") and not "no_build" in args:
    print "building..."
    print check_output(["grunt", "build"])
else:
    print "build exists."

# print check_output(["rsync", "-r", "dist/*", "johanrox@k2.spraakdata.gu.se:/var/www/html_sb/korp"], shell=True)

target = "korp"
if "lab" in args or "labb" in args:
    target = "korplabb"

print "syncing to server, target: %s" % target

print check_output("rsync -r dist/* johanrox@k2.spraakdata.gu.se:/var/www/html_sb/" + target, shell=True)

if not "no_clean" in args:
    print check_output(["grunt", "clean"])

print
print
print "Done."
print