"""
Retrieves devices and sensors from HyperCat and re-arranges them
into a suitable output JSON

writes a file, devices.json, into the dir the script is run from
"""


import urllib2
import json
base = "http://iostp.org:8080"
req = urllib2.urlopen(base + "/cat/feeds")
res = json.loads(req.read())

master_schools = {
    "Writhlington School": {'lat': 51.287450, 'lng': -2.431117},
    "Hayesfield School Girls School Brougham Hayes": {'lat': 51.379604, 'lng': -2.374676},
    "Hayesfield School Girls School Upper Oldfield Park": {'lat': 51.376278, 'lng': -2.372687},
    "East Barnet School": {'lat': 51.643764, 'lng': -0.154755},
    "The Kings School Peterborough": {'lat': 52.581136, 'lng': -0.239092},
    "Bury St Edmunds County Upper School": {'lat': 52.256741, 'lng': 0.701115},
    "Alder Grange Community Technology School": {'lat': 53.708685, 'lng': -2.282684},
    "North Liverpool Academy": {'lat': 53.424507, 'lng': -2.963805},
    "Blue Coat School, Birmingham": {'lat': 52.460269, 'lng': -1.939606},
    "East Barnet": {'lat': 51.631068, 'lng': -0.1512709999999515},
    "Horringer Court Middle School": {'lat': 52.2356282, 'lng': 0.6877680999999711},
    "Intel Offices, Kildare": {'lat': 53.372051, 'lng': -6.513069},
    "Other": {'lat': 0, 'lng': 0}
}

# keys we want, and new keys for output JSON
mapping = {
    u"urn:X-xively:rels:hasStatus": "status",
    u"urn:X-xively:rels:hasTitle:en": "title",
    u"url:X-xively:rels:locationName": "locationName",
    u"url:X-xively:resl:hasId": "feedID",
    u"urn:X-xively:rels:tags": "tags",
    u"urn:X-xively:rels:lastUpdated": "lastUpdate",
    u"urn:X-xively:rels:deviceSerial": "serial",
    u"http://www.w3.org/2003/01/geo/wgs84_pos#lat": "lat",
    u"http://www.w3.org/2003/01/geo/wgs84_pos#long": "lng",
    u"urn:X-tsbiot:rels:hasDescription:en": "description"
}


def fix_coords(entry):
    """ Convert coordinates to floats or set them to None """
    if entry:
        # replace zero-length latitude with None
        if not len(entry):
            entry = None
        # Otherwise, convert coordinates to floats
        else:
            entry = float(entry)
    return entry


def test_circle(centre_y, centre_x, test_y, test_x):
    """ Test whether a point falls inside or on a circle """
    # 0.001 = 111.32m in decimal degrees, so the circle has a diameter of ~1km
    radius = 0.0045
    return (test_x - centre_x) ** 2 + (test_y - centre_y) ** 2 <= radius ** 2

output = []
wanted_keys = set(mapping.keys())
for feed in res[u'items']:
    available_keys = wanted_keys.intersection(
        set([value[u'rel'] for value in feed[u'i-object-metadata']]))
    output_keys = [mapping.get(av_key) for av_key in list(available_keys)]
    output_values = []
    for k in list(available_keys):
        # ugly, ugly hack. But then, I didn't design the feed format
        output_values.append(
            [value[u'val'] for value in feed[u'i-object-metadata'] if value['rel'] == k][0])
    output_keys.append("feed_url")
    output_values.append(base + feed['href'])
    output.append(dict(zip(output_keys, output_values)))
for entry in output:
    entry['tags'] = entry['tags'].split(',')
# output to file
with open("./data/output.json", "w") as f:
    f.write(json.dumps(output))
# cleanup steps
for entry in output:
    # try to get the location from the description, if it doesn't exist yet
    if not entry.get("locationName"):
        try:
            entry['locationName'] = entry.get('description').split(":")[1]
        except (IndexError, AttributeError):
            entry['locationName'] = None
    # get rid of weird leading WXX stuff in locations
    try:
        if entry.get("locationName").startswith("W"):
            entry['locationName'] = entry['locationName'].split("-")[1].lstrip()
    except (AttributeError, IndexError):
        pass
    entry['lat'] = fix_coords(entry.get('lat'))
    entry['lng'] = fix_coords(entry.get('lng'))
unique_school_names = set(master_schools.keys())

# Build list of schools that have a matching master list entry
# Build list of schools that have a non-matching master list entry, but lat + lng
# Try to match second list against known lat + lng, or assign 'Other' name
# Combine first and second lists

matched = [entry for entry in output if entry['locationName'] in unique_school_names]
unmatched = [entry for entry in output if entry['locationName'] not in unique_school_names]
with_coords = [entry for entry in output if entry.get('lat') \
    and entry.get('lng')\
    and entry['locationName'] not in unique_school_names]
for school in with_coords:
    for name, coords in master_schools.items():
        if test_circle(coords['lat'], coords['lng'], school['lat'], school['lng']):
            school['locationName'] = name
            school['lat'] = coords['lat']
            school['lng'] = coords['lng']
        else:
            school['locationName'] = 'Other'
combined = matched + with_coords
# Retrieve sensor count for each device
for entry in combined:
    try:
        entry['sensor_count'] = len(
            json.loads(urllib2.urlopen(entry['feed_url']).read()))
    except urllib2.HTTPError:
        entry['sensor_count'] = 0

output_dict = {
    "total_sensors": 0,
    "total_sensors_live": 0,
    "total_sensors_frozen": 0,
    "total_devices": 0,
    "total_devices_live": 0,
    "total_devices_frozen": 0,
    "locations": 0,
    "total_missions_done": 0,
    "total_missions": 0,
    "school_data": [],
}

output_dict['total_sensors'] = sum([feed['sensor_count'] for feed in combined])
output_dict['total_sensors_live'] = sum(
    [feed['sensor_count'] for feed in combined if feed['status'] == 'live'])
output_dict['total_sensors_frozen'] = sum(
    [feed['sensor_count'] for feed in combined if feed['status'] == 'frozen'])
output_dict['total_devices'] = len(combined)
output_dict['total_devices_live'] = len([c for c in combined if c['status'] == 'live'])
output_dict['total_devices_frozen'] = len([c for c in combined if c['status'] == 'frozen'])
output_dict['locations'] = len(set([c['locationName'] for c in combined]))

for entry in unique_school_names:
    output_dict['school_data'].append({
        "name": entry,
        'sensors': int(sum(
            [feed['sensor_count'] for feed in combined if feed['locationName'] == entry])),
        'sensors_live': int(sum(
            [feed['sensor_count'] for feed in combined if
            feed['status'] == 'live' and feed['locationName'] == entry])),
        'sensors_frozen': int(sum(
            [feed['sensor_count'] for feed in combined if
            feed['status'] == 'frozen' and feed['locationName'] == entry])),
        'devices': len([c for c in combined if c['locationName'] == entry]),
        'devices_live': len(
            [c for c in combined if c['status'] == 'live' and c['locationName'] == entry]),
        'devices_frozen': len(
            [c for c in combined if c['status'] == 'frozen' and c['locationName'] == entry]),
        "location": {
            "lat": master_schools[entry]['lat'],
            "lng": master_schools[entry]['lng']
        }
    })
with open("./data/devices.json", "w") as o:
    o.write(json.dumps(output_dict))
