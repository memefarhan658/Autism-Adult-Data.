"""Preparation checks; run with python -m unittest discover -s tests."""
import json
import unittest
from scripts.prepare_data import FIELDS, age_band, prepare


def arff(row):
    return '\n'.join([*(f'@attribute {f} string' for f in FIELDS), '@data', ','.join(row)])


class PreparationTests(unittest.TestCase):
    def setUp(self):
        self.row = ['1'] * 10 + ['25', 'f', '?', 'no', 'no', "'United States'", 'no', '10', "'18 and more'", '?', 'YES']

    def test_boundaries_and_missing_ages(self):
        for age, band in [('17', '17–24'), ('24', '17–24'), ('25', '25–34'), ('55', '55+'), ('?', 'Unknown'), ('383', 'Unknown')]:
            self.assertEqual(age_band(age), band)

    def test_minimal_fields_and_quoted_country(self):
        self.assertEqual(json.loads(prepare(arff(self.row))), [['United States', '25–34', '1111111111', 'YES']])

    def test_score_disagreement_is_rejected(self):
        self.row[17] = '9'
        with self.assertRaisesRegex(ValueError, 'disagree'):
            prepare(arff(self.row))

    def test_unexpected_schema_is_rejected(self):
        with self.assertRaisesRegex(ValueError, 'schema'):
            prepare(arff(self.row).replace('@attribute age ', '@attribute not_age '))

    def test_nonbinary_items_are_rejected(self):
        self.row[0] = '2'
        with self.assertRaisesRegex(ValueError, 'item fields'):
            prepare(arff(self.row))

    def test_label_is_preserved_not_inferred(self):
        self.row[-1] = 'NO'
        self.assertEqual(json.loads(prepare(arff(self.row)))[0][-1], 'NO')
