import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import os

# Deine Ziel-URL
URL = 'https://www.berlin.de/polizei/service/versammlungsbehoerde/versammlungen-aufzuege/'

def get_cache_filename():
    # current date + hour, e.g. response_2025-06-13_15.html
    now = datetime.now()
    return f"response_{now.strftime('%Y-%m-%d_%H')}.html"

def fetch_or_load(url):
    cache_file = get_cache_filename()

    if os.path.exists(cache_file):
        print(f"Loading response from cache file: {cache_file}")
        with open(cache_file, 'r', encoding='utf-8') as f:
            return f.read()
    else:
        print("Cache not found or expired, fetching new response...")
        response = requests.get(url)
        response.raise_for_status()
        with open(cache_file, 'w', encoding='utf-8') as f:
            f.write(response.text)
        return response.text

# Usage
html = fetch_or_load(URL)

# Parse HTML
soup = BeautifulSoup(html, 'html.parser')

# Finde die Tabelle
table = soup.find('table', class_='result table bordered-table zebra-striped')

if not table:
    print("Tabelle nicht gefunden.")
    exit()

# Ergebnisse sammeln
events = []

# Gehe durch alle Zeilen
rows = table.find_all('tr')

def safe_get(row, header):
    cell = row.find('td', headers=header)
    return cell.get_text(strip=True) if cell else ""
    
def is_event_empty(event):
    return all(not v.strip() for v in event.values())

for i in range(0, len(rows), 1):
    try:
        row = rows[i]

        # Hole die Zellen
        datum = safe_get(row,'Datum')
        von = safe_get(row, 'Von')
        bis = safe_get(row, 'Bis')
        thema = safe_get(row, 'Thema')
        plz = safe_get(row, 'PLZ')
        ort = safe_get(row, 'Versammlungsort')
        strecke = safe_get(row, 'Aufzugsstrecke')

    
        event = {
            'datum': datum,
            'von': von,
            'bis': bis,
            'thema': thema,
            'plz': plz,
            'versammlungsort': ort,
            'aufzugsstrecke': strecke
        }

        if not is_event_empty(event): 
            events.append(event)
    except Exception as e:
        print(f"Fehler beim Parsen einer Zeile: {e}")
        continue

with open('events.json', 'w', encoding='utf-8') as f:
    json.dump(events, f, ensure_ascii=False, indent=2)

print(f"{len(events)} Einträge gespeichert in events.json")

