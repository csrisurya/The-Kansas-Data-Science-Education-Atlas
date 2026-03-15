import json, os
base = '/Users/srisurya/Documents/01. academic/01. Kansas State University/02. BA - ICS/ATLAS/Dashboard/The-Kansas-Data-Science-Education-Atlas'
with open(os.path.join(base, 'frontend/public/geojson-counties-fips.json')) as f:
    data = json.load(f)
ks = [feat for feat in data['features'] if feat.get('properties',{}).get('STATE') == '20']
ks.sort(key=lambda f: f['properties']['NAME'])
out = {'type': 'FeatureCollection', 'features': ks}
outpath = os.path.join(base, 'frontend/public/kansas-counties.geojson')
with open(outpath, 'w') as f:
    json.dump(out, f)
print(f'Wrote {len(ks)} counties, {os.path.getsize(outpath)/1024:.1f} KB')
for feat in ks[:5]:
    print(f'  {feat["id"]}: {feat["properties"]["NAME"]}')
print('  ...')
for feat in ks[-3:]:
    print(f'  {feat["id"]}: {feat["properties"]["NAME"]}')
