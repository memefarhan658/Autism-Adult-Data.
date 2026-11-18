"""Prepare the minimal browser snapshot from the original UCI adult ARFF.

Usage: python scripts/prepare_data.py /path/to/Autism-Adult-Data.arff [--check]
Only Python's standard library is required. See data/README.md for provenance.
"""
import argparse
import csv
import json
from pathlib import Path

OUTPUT = Path(__file__).resolve().parents[1] / 'data' / 'records.json'
FIELDS = [f'A{i}_Score' for i in range(1, 11)] + [
    'age', 'gender', 'ethnicity', 'jundice', 'austim', 'contry_of_res',
    'used_app_before', 'result', 'age_desc', 'relation', 'Class/ASD',
]


def age_band(value):
    if value == '?':
        return 'Unknown'
    age = int(value)
    if not 17 <= age <= 120:
        return 'Unknown'
    for upper, band in [(24, '17–24'), (34, '25–34'), (44, '35–44'), (54, '45–54')]:
        if age <= upper:
            return band
    return '55+'


def prepare(text):
    lines = [s.strip() for s in text.splitlines() if s.strip() and not s.startswith('%')]
    start = next(i for i, s in enumerate(lines) if s.lower() == '@data')
    fields = [s.split()[1] for s in lines[:start] if s.lower().startswith('@attribute ')]
    if fields != FIELDS:
        raise ValueError('Unexpected input schema. Use the adult UCI ARFF in data/README.md.')
    records = []
    for n, row in enumerate(csv.reader(lines[start + 1:], quotechar="'", skipinitialspace=True), 1):
        if len(row) != len(FIELDS) or not set(row[:10]) <= {'0', '1'}:
            raise ValueError(f'Invalid item fields at record {n}')
        if sum(map(int, row[:10])) != int(row[17]):
            raise ValueError(f'Item sum and reported result disagree at record {n}')
        if row[20] not in ('YES', 'NO'):
            raise ValueError(f'Invalid source label at record {n}')
        country = row[15].strip()
        country = {'AmericanSamoa': 'American Samoa', '?': 'Unknown'}.get(country, country)
        records.append([country, age_band(row[10]), ''.join(row[:10]), row[20]])
    return '[\n' + ',\n'.join('  ' + json.dumps(r, ensure_ascii=False) for r in records) + '\n]\n'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('arff', type=Path)
    parser.add_argument('--check', action='store_true', help='Verify instead of overwriting the snapshot.')
    args = parser.parse_args()
    snapshot = prepare(args.arff.read_text(encoding='utf-8-sig'))
    if args.check:
        if snapshot != OUTPUT.read_text(encoding='utf-8'):
            raise SystemExit('Snapshot differs from the input. Check the source and transformation.')
        print('Snapshot reproduced exactly.')
    else:
        OUTPUT.write_text(snapshot, encoding='utf-8')
        print(f'Prepared {len(json.loads(snapshot))} records in {OUTPUT.name}.')


if __name__ == '__main__':
    main()
