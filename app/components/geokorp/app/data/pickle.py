import cPickle, sys, json
output = {}
placeTypePrio = ("city", "town", "village") # "hamlet"
prioMap = {}
for line in sys.stdin:
    if line.startswith("Running node"): continue
    name, lat, lon, placeType = line.split(";")
    placeType = placeType.rstrip()
    # if name.lower() in output :
    #     placeTypePrio.index(placeType)
    #     prioMap
    # else:
    prevPrio = prioMap.get(name.lower(), len(placeTypePrio))
    try:
        prio = placeTypePrio.index(placeType)
    except:
        print "not in:", placeType
        continue

    if prio < prevPrio:
        output[name.lower()] = (float(lat), float(lon))
        prioMap[name.lower()] = prio
        
    






# cPickle.dump(output, open("places.pickle", "w"))
json.dump(output, open("osm-places.json", "w"), indent=2)
