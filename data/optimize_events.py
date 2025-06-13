from collections import defaultdict
import json
from thefuzz import fuzz

FUZZY_THRESHOLD = 90

def load_json(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        return json.load(f)

def group_events(events):

    grouped = []

    for event in events:
        event_thema = event.get("thema", "")
        event_key = (
            event.get("von", ""),
            event.get("bis", ""),
            event.get("plz", ""),
            event.get("versammlungsort", ""),
            event.get("aufzugsstrecke", "")
        )
        # Versuche passende Gruppe zu finden
        found_group = None
        for group in grouped:
            # Key muss passen
            if group["key"] == event_key:
                # Fuzzy-Vergleich vom Thema
                score = fuzz.ratio(event_thema, group["thema"])
                if score >= FUZZY_THRESHOLD:
                    found_group = group
                    break
        if found_group:
            found_group["datum"].append(event.get("datum", ""))
        else:
            grouped.append({
                "key": event_key,
                "thema": event_thema,
                "datum": [event.get("datum", "")]
            })

    result = []
    for group in grouped:
        res = {
            "von": group["key"][0],
            "bis": group["key"][1],
            "plz": group["key"][2],
            "versammlungsort": group["key"][3],
            "aufzugsstrecke": group["key"][4],
            "thema": group["thema"],
            "datum": group["datum"]
        }
        result.append(res)
    return result

def main():
    filename = 'events.json'  # JSON-Datei hier anpassen
    events = load_json(filename)
    grouped = group_events(events)
    with open('optimized_events.json', 'w', encoding='utf-8') as f:
        json.dump(grouped, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()
