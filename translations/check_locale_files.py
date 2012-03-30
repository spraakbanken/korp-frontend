from __future__ import unicode_literals
import os, json
from glob import glob

fileset = ("locale", "corpora")


def check(setname):
    print "checking " + setname
    mapping = dict((fName, set(json.load(open(fName)))) for fName in glob(setname + "*.json"))
    
    def check_key(key, fromLang):
        for fName, json_set in mapping.items():
            if fromLang != fName:
                if key not in json_set:
                    print "The key '%s' is in file %s but not in file %s" % (key, fromLang, fName)
    
    
    for fName, json_set in mapping.items():
        for json_key in json_set:
            check_key(json_key, fName)

print "Ok."

for name in fileset:
    check(name)