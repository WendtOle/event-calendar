import json
import argparse
from thefuzz import fuzz

def load_json(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(data, filename):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def filter_events_fuzzy(events, field, keyword, threshold):
    filtered = []
    for event in events:
        value = event.get(field, "")
        if value:
            score = fuzz.partial_ratio(keyword.lower(), value.lower())
            if score >= threshold:
                filtered.append(event)
    return filtered

def main():
    parser = argparse.ArgumentParser(description="Fuzzy filter JSON events.")
    parser.add_argument("input_file", help="Path to input JSON file")
    parser.add_argument("output_file", help="Path to output JSON file")
    parser.add_argument("field", help="Field to search in")
    parser.add_argument("keyword", help="Keyword to fuzzy match")
    parser.add_argument("--threshold", type=int, default=80, help="Fuzzy match threshold (default: 80)")

    args = parser.parse_args()

    events = load_json(args.input_file)
    filtered = filter_events_fuzzy(events, args.field, args.keyword, args.threshold)

    print(f"Gefundene Einträge: {len(filtered)}")
    for event in filtered:
        print(json.dumps(event, indent=2, ensure_ascii=False))

    save_json(filtered, args.output_file)
    print(f"Gefilterte Events gespeichert in: {args.output_file}")

if __name__ == "__main__":
    main()
