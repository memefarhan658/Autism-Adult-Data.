# Data card · Autism Screening Adult

**Source:** Thabtah, F. (2017). *Autism Screening Adult* [Dataset]. UCI Machine Learning Repository. [DOI: 10.24432/C5F019](https://doi.org/10.24432/C5F019) · [UCI dataset page](https://archive.ics.uci.edu/dataset/426/autism+screening+adult) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

`records.json` is a derived snapshot, not newly collected data. The research workspace is independent of UCI and the original author. The source is a convenience sample of screening submissions; it is not a representative sample of adults or a clinical ground truth.

## What is in the snapshot?

All 704 rows remain in the original order, with four fields per row:

| Position | Example | Meaning / transformation |
| --- | --- | --- |
| 0 | `United States` | Reported `contry_of_res`; trim whitespace and display `AmericanSamoa` as `American Samoa`. The 67 categories include territories. |
| 1 | `25–34` | Age band. The published adult file contains 18 records aged 17. Retain them in 17–24. Other bands: 25–34, 35–44, 45–54, 55+. Two missing ages (`?`) and an implausible 383 become `Unknown`; no imputation. |
| 2 | `1111001100` | The ten binary fields `A1_Score` … `A10_Score` in order. These are **scored items**, not necessarily literal yes/no answers. |
| 3 | `NO` | Published `Class/ASD` value, preserved rather than recalculated. YES/NO are screening labels, not diagnoses. |

The UI derives a display ID (`SA-0001` onward) from source order and a total score from the ten digits. The preparer checks each total against the original `result` field. Exact ages, ethnicity, family history, and the other unused fields are **not** shipped to the browser. Display IDs are not patient identifiers, and field minimization is not a guarantee of anonymity.

## Reproduce the snapshot

1. Obtain `Autism-Adult-Data.arff` from the [UCI download](https://archive.ics.uci.edu/dataset/426/autism+screening+adult). Use the adult file, not the child or adolescent cohort.
2. From the project root, run:

   ```bash
   python3 scripts/prepare_data.py /path/to/Autism-Adult-Data.arff --check
   ```

   `--check` compares the generated content with the checked-in snapshot without modifying it. Omit the flag to deliberately regenerate. No third-party Python packages are needed.

For this build the original ARFF was retrieved from a [pinned public mirror](https://github.com/shadunts/autism_screening_adult/blob/9329a7a60635a9c5b2dcfc6a33e2caa08e6282ed/data/Autism-Adult-Data.arff). Its byte-level SHA-256 is `30838a0d16a148dd2572f162be78b97288e0e88824fa1f5cbe19e60b71c2d6a6` (line endings affect this checksum). To reproduce with the exact same input:

```bash
gh api -H 'Accept: application/vnd.github.raw+json' \
  'repos/shadunts/autism_screening_adult/contents/data/Autism-Adult-Data.arff?ref=9329a7a60635a9c5b2dcfc6a33e2caa08e6282ed' \
  > /tmp/Autism-Adult-Data.arff
python3 scripts/prepare_data.py /tmp/Autism-Adult-Data.arff --check
```

## Independent checks

| Check | Expected value |
| --- | ---: |
| Rows / valid item sequences | 704 / 704 |
| Source YES / NO | 189 / 515 |
| Mean item sum | 4.875 |
| Modal score (frequency) | 4 (131) |
| Missing or invalid age, retained | 3 |
| Source totals disagreeing with item sum | 0 |

In **this** snapshot YES coincides exactly with totals of 7–10. This is a property of these data, **not** a recommended clinical cutoff. Using the total or its component items to predict this label would not demonstrate diagnostic accuracy. A screen-positive share is not population prevalence. Do not use the data for personal medical, employment, or eligibility decisions.
