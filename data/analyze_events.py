import numpy as np
import json
from collections import Counter

def load_json(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        return json.load(f)

def analyze_events(events):
    print(f"Anzahl Events insgesamt: {len(events)}")

    nested_nested = [item["way_points"] for item in events]
    nested = [item for sublist in nested_nested for item in sublist]
    locations = [item for sublist in nested for item in sublist] 
    unique_locations = np.sort(list(set(locations)))
    for location in unique_locations:
        print(location)
    print(str(len(locations)) + " locations")
    print(str(len(unique_locations)) + " different locations")

def main():
    filename = 'events.json'  # JSON-Datei hier anpassen
    events = load_json(filename)
    analyze_events(events)

if __name__ == "__main__":
    main()
