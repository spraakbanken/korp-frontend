#!/usr/bin/python

'''
this is a first attempt at a build script. it's unfinished. don't use it.
'''


import os
from lxml import etree
from codecs import open
parser = etree.HTMLParser()
from lxml.cssselect import CSSSelector
link_sel = CSSSelector('link[href$=css]')

tree = etree.parse(open("index.html"), parser=parser).getroot()

def concat(urls, comment, after=""):
    return "\n".join(map(lambda url: ("%s-----%s%s\n" % (comment[0],url,comment[1])) + open(url, encoding="utf-8").read() + after, urls))

with open("dist/korp.js", "w") as f:
    f.write(concat(tree.xpath("//script/@src"), ("//", ""), ";"))

with open("dist/korp.css", "w") as f:
    f.write(concat(map(lambda x: x.get('href'), link_sel(tree)), ("/*", "*/")))
    
