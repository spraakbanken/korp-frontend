import json

files = []
files.append(open("osm-places.json"))
files.append(open("lsi-places.json"))

items = {}
for file in files:
    data = json.load(file)
    for attr, value in data.items():
        items[attr.lower()] = value

json.dump(items, open("places.json", "w"), indent=2)


