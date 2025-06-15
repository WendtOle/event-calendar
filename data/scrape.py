from thefuzz import fuzz
import re
import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import os

# Deine Ziel-URL
URL = 'https://www.berlin.de/polizei/service/versammlungsbehoerde/versammlungen-aufzuege/'

def get_cache_filename():
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

def safe_get(row, header):
    cell = row.find('td', headers=header)
    return cell.get_text(strip=True) if cell else ""

def is_event_empty(event):
    return len(event['thema'].strip()) == 0

def extract_location(row):
    ort = safe_get(row, 'Versammlungsort')
    if len(ort.strip()) > 0:
        return ort.strip() + " " + safe_get(row, 'PLZ')
    raw = safe_get(row, 'Aufzugsstrecke')
    return raw.strip()

def parse_way_points(row):
    ort = safe_get(row, 'Versammlungsort')
    if len(ort.strip()) > 0:
        return [ort.strip() + " " + safe_get(row, 'PLZ')]
    text = safe_get(row, 'Aufzugsstrecke')
    if len(text) == 0:
        return []
    text = re.sub(r'(\w+)-\s+(\w+)', r'\1\2', text)
    match = re.search(r'neu:\s*(.*)', text, re.IGNORECASE)
    if match:
        new_part = match.group(1)
        new_part = re.split(r'\balt\b\s*:', new_part, flags=re.IGNORECASE)[0]
    else:
        new_part = text
    new_part = re.sub(r'\([^)]*\)', '', new_part)
    raw_orte = [subitem for item in new_part.split(' - ') for subitem in item.split(', ')]
    orte = [ort.strip() for ort in raw_orte if ort.strip()]
    return orte

def parse_row(row): 
    datum = [safe_get(row,'Datum')]
    von = safe_get(row, 'Von')
    bis = safe_get(row, 'Bis')
    thema = safe_get(row, 'Thema')
    location = extract_location(row)
    way_points = parse_way_points(row)

    return {
        'date': datum,
        'time': von + " - " + bis,
        'thema': thema,
        'location': location,
        'way_points': way_points
    }

def get_rows():
    html = fetch_or_load(URL)
    soup = BeautifulSoup(html, 'html.parser')
    table = soup.find('table', class_='result table bordered-table zebra-striped')
    if not table:
        print("Tabelle nicht gefunden.")
        exit()
    return table.find_all('tr')

def is_topic_similar(left,right):
    score = fuzz.ratio(left,right)
    return score >= 90

def main():
    rows = get_rows()
    events = []

    for row in rows:
        try:
            event = parse_row(row)
        except Exception as e:
            print(f"Fehler beim Parsen einer Zeile: {e}")
            continue
        if is_event_empty(event): 
            continue

        matching_event = None
        for existing_event in events:
            if is_topic_similar(existing_event["thema"], event["thema"]):
                matching_event = existing_event
        if matching_event:
            matching_event["date"].append(event["date"][0])  
        else: 
            events.append(event)

    with open('events.json', 'w', encoding='utf-8') as f:
        json.dump(events, f, ensure_ascii=False, indent=2)

    print(f"{len(events)} Einträge gespeichert in events.json")

if __name__ == "__main__":
    main()
