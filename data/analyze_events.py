import json
from collections import Counter

def load_json(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        return json.load(f)

def analyze_events(events):
    print(f"Anzahl Events insgesamt: {len(events)}")

    # Alle Themen sammeln
    themen = [event.get('thema', '') for event in events if event.get('thema')]
    thema_counts = Counter(themen)
    print("\nTop 5 häufigste Themen:")
    for thema, count in thema_counts.most_common(5):
        print(f"  {thema}: {count} mal")

    # Alle PLZs sammeln
    plz_list = [event.get('plz', '') for event in events if event.get('plz')]
    plz_counts = Counter(plz_list)
    print("\nTop 5 PLZ mit den meisten Events:")
    for plz, count in plz_counts.most_common(5):
        print(f"  {plz}: {count} Events")

    # Von-Bis Zeiten analysieren
    zeiten = [(event.get('von', ''), event.get('bis', '')) for event in events if event.get('von') and event.get('bis')]
    zeiten_counts = Counter(zeiten)
    print("\nTop 3 häufigste Zeitintervalle (von - bis):")
    for (von, bis), count in zeiten_counts.most_common(3):
        print(f"  {von} - {bis}: {count} mal")

def main():
    filename = 'optimized_events.json'  # JSON-Datei hier anpassen
    events = load_json(filename)
    analyze_events(events)

if __name__ == "__main__":
    main()
