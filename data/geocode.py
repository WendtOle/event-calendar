import requests
import numpy as np
import json
from collections import Counter

def load_json(filename, fallback=None):
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return fallback

def extract_locations(events):
    nested_nested = [item["way_points"] for item in events]
    nested = [item for sublist in nested_nested for item in sublist]
    locations = [item for sublist in nested for item in sublist] 
    unique_locations = np.sort(list(set(locations)))
    return unique_locations


def query_nominatim(query):
    url = "http://localhost:8080/search"
    params = {
        "q": query,
        "format": "json",
    }

    response = requests.get(url, params=params)
    response.raise_for_status()
    results = response.json()

    return results
    results_dict = {}
    for item in results:
        results_dict[item["display_name"]] = {
            "lat": item["lat"],
            "lon": item["lon"],
            "boundingbox": item.get("boundingbox"),
            "type": item.get("type")
        }

    return results_dict

def geocode_locations(locations, location_entries):
    new_location_strings = list(set(locations) - set(location_entries.keys()))
    for location_string in new_location_strings:
        location_entries[location_string] = query_nominatim(location_string)
    return location_entries

def main():
    events = load_json('events.json')
    location_strings = extract_locations(events)
    existing_location_entries = load_json('locations.json', {})
    updated_location_entries = geocode_locations(location_strings, existing_location_entries)
    with open('locations.json', 'w', encoding='utf-8') as f:
        json.dump(updated_location_entries, f, ensure_ascii=False, indent=2)

    print(f"{len(location_strings)} additional entries geocoded")
    print(f"{len(updated_location_entries.keys())} total entries geocoded")

if __name__ == "__main__":
    main()
