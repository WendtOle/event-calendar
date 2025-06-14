import json
from collections import Counter

def load_json(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        return json.load(f)

def analyze_events(events):
    print(f"Anzahl Events insgesamt: {len(events)}")

    strecke_nested = [event.get('aufzugsstrecke', '').split(" - ") for event in events if event.get('aufzugsstrecke')]
    points = [point for sublist in strecke_nested for point in sublist]
    
    groups = []

    for point in points:
        found_group = None
        for group in groups:
            score = fuzz.ratio(group,point)
                if score >= FUZZY_THRESHOLD:
                    found_group = group
                    break
        if not found_group:
            groups.append(point)
            found_group["datum"].append(event.get("datum", ""))
        else:
            grouped.append({
                "key": event_key,
                "thema": event_thema,
                "datum": [event.get("datum", "")]
            })

    for point in points[:10]:
        print("--------")
        print(point)
        print()

def main():
    filename = 'optimized_events.json'  # JSON-Datei hier anpassen
    events = load_json(filename)
    analyze_events(events)

if __name__ == "__main__":
    main()
