import { describe, expect, it } from 'vitest';
import {
  AGE_BANDS,
  DOI,
  csv,
  filterRecords,
  fullCohort,
  records,
  recordsCSV,
  sortRecords,
  summarize,
  summaryCSV,
} from '../src/lib/cohort';

describe('versioned UCI snapshot', () => {
  it('matches the published cohort and independently counted metrics', () => {
    expect(fullCohort).toMatchObject({
      count: 704,
      countryCount: 67,
      positive: 189,
      negative: 515,
      mean: 4.875,
    });
    expect(fullCohort.distribution).toEqual([14, 33, 74, 110, 131, 83, 70, 57, 55, 47, 30]);
    expect(fullCohort.items).toEqual([508, 319, 322, 349, 351, 200, 294, 457, 228, 404]);
  });
  it('has distinct display IDs and valid item values throughout', () => {
    expect(new Set(records.map((r) => r.id)).size).toBe(records.length);
    for (const r of records) {
      expect(r.items).toHaveLength(10);
      expect(r.items.every((v) => v === 0 || v === 1)).toBe(true);
      expect(AGE_BANDS).toContain(r.ageBand);
      expect(r.score).toBe(r.items.reduce((sum, v) => sum + v, 0));
    }
  });
  it('retains records with missing or invalid ages', () => {
    expect(filterRecords(records, { ageBand: 'Unknown' })).toHaveLength(3);
  });
  it('supports the documented label-leakage observation, not a diagnostic claim', () => {
    expect(records.every((r) => (r.label === 'YES') === r.score >= 7)).toBe(true);
  });
});

describe('cohort operations', () => {
  it('searches case-insensitively and combines filters with AND', () => {
    expect(
      filterRecords(records, { query: ' sa-0001 ', ageBand: '25–34', label: 'NO', score: '6' }),
    ).toEqual([records[0]]);
    expect(filterRecords(records, { query: 'SA-0001', label: 'YES' })).toEqual([]);
    expect(filterRecords(records, { query: ' united states ' })).toHaveLength(113);
  });
  it('keeps zero as a selectable score', () => {
    const result = filterRecords(records, { score: '0' });
    expect(result).toHaveLength(14);
    expect(result.every((r) => r.score === 0)).toBe(true);
  });
  it('uses the selected denominator and handles empty cohorts', () => {
    const stats = summarize(filterRecords(records, { score: '7' }));
    expect(stats.count).toBe(57);
    expect(stats.positiveRate).toBe(100);
    expect(stats.mean).toBe(7);
    expect(summarize([])).toMatchObject({ count: 0, positiveRate: 0, mean: null });
  });
  it('sorts scores numerically without mutating source order', () => {
    expect(sortRecords(records, 'score', true)[0].score).toBe(10);
    expect(sortRecords(records, 'score')[0].score).toBe(0);
    expect(sortRecords(records, 'ageBand').at(-1)?.ageBand).toBe('Unknown');
    expect(records[0].id).toBe('SA-0001');
  });
});

describe('exports', () => {
  it('quotes commas, double quotes, and newlines in a valid CSV cell', () => {
    expect(csv([['a, b', 'a"b', 'a\nb']])).toBe('"a, b","a""b","a\nb"\r\n');
  });
  it('exports only the supplied rows, with their source and license', () => {
    const result = recordsCSV(records.slice(0, 1));
    expect(result.trim().split('\r\n')).toHaveLength(2);
    expect(result).toContain('SA-0001');
    expect(result).not.toContain('SA-0002');
    expect(result).toContain(DOI);
    expect(result).toContain('CC BY 4.0');
  });
  it('includes scope in subgroup summary downloads', () => {
    const stats = summarize(filterRecords(records, { ageBand: 'Unknown' }));
    const result = summaryCSV(stats, 'Age band: Unknown');
    expect(result).toContain('"Cohort","Age band: Unknown"');
    expect(result).toContain('"Records","3"');
    expect(result).toContain('not diagnoses');
  });
});
