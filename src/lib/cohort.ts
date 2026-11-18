import snapshot from '../../data/records.json';

export const SOURCE = 'https://archive.ics.uci.edu/dataset/426/autism+screening+adult';
export const DOI = 'https://doi.org/10.24432/C5F019';
export const AGE_BANDS = ['17–24', '25–34', '35–44', '45–54', '55+', 'Unknown'];
export type Label = 'YES' | 'NO';
export type RecordRow = {
  id: string;
  country: string;
  ageBand: string;
  items: number[];
  score: number;
  label: Label;
};
export const records: RecordRow[] = snapshot.map(([country, ageBand, bits, label], i) => ({
  id: `SA-${String(i + 1).padStart(4, '0')}`,
  country,
  ageBand,
  items: [...bits].map(Number),
  score: [...bits].filter((b) => b === '1').length,
  label: label as Label,
}));

export const percent = (count: number, total: number) => (total ? (count * 100) / total : 0);
export function summarize(rows: RecordRow[]) {
  const distribution = Array<number>(11).fill(0);
  const items = Array<number>(10).fill(0);
  const countries = new Set<string>();
  let total = 0,
    positive = 0;
  for (const row of rows) {
    distribution[row.score]++;
    total += row.score;
    positive += Number(row.label === 'YES');
    if (row.country !== 'Unknown') countries.add(row.country);
    row.items.forEach((value, index) => {
      items[index] += value;
    });
  }
  return {
    count: rows.length,
    countryCount: countries.size,
    mean: rows.length ? total / rows.length : null,
    positive,
    negative: rows.length - positive,
    positiveRate: percent(positive, rows.length),
    distribution,
    items,
  };
}
export const fullCohort = summarize(records);
export type Summary = ReturnType<typeof summarize>;
export function filterRecords(
  rows: RecordRow[],
  filters: { query?: string; ageBand?: string; label?: string; score?: string },
) {
  const query = filters.query?.trim().toLowerCase() || '';
  return rows.filter(
    (r) =>
      (!query || r.country.toLowerCase().includes(query) || r.id.toLowerCase().includes(query)) &&
      (!filters.ageBand || r.ageBand === filters.ageBand) &&
      (!filters.label || r.label === filters.label) &&
      (!filters.score || String(r.score) === filters.score),
  );
}
export type SortKey = 'id' | 'country' | 'ageBand' | 'score' | 'label';
export function sortRecords(rows: RecordRow[], key: SortKey, descending = false) {
  return [...rows].sort((a, b) => {
    const cmp =
      key === 'score'
        ? a.score - b.score
        : key === 'ageBand'
          ? AGE_BANDS.indexOf(a.ageBand) - AGE_BANDS.indexOf(b.ageBand)
          : String(a[key]).localeCompare(String(b[key]), 'en');
    return (descending ? -cmp : cmp) || a.id.localeCompare(b.id);
  });
}

export function csv(cells: (string | number)[][]): string {
  return (
    cells
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\r\n') + '\r\n'
  );
}
export function recordsCSV(rows: RecordRow[]) {
  return csv([
    [
      'Record ID',
      'Country of residence',
      'Age band',
      ...Array.from({ length: 10 }, (_, i) => `A${i + 1}_Score`),
      'AQ-10 score',
      'Source screening label',
      'Source DOI',
      'License',
    ],
    ...rows.map((r) => [
      r.id,
      r.country,
      r.ageBand,
      ...r.items,
      r.score,
      r.label,
      DOI,
      'CC BY 4.0',
    ]),
  ]);
}
export function summaryCSV(stats: Summary, cohort = 'All screening records') {
  return csv([
    ['Metric', 'Value'],
    ['Cohort', cohort],
    ['Records', stats.count],
    ['Countries / territories', stats.countryCount],
    ['Mean AQ-10 score', stats.mean?.toFixed(3) ?? 'N/A'],
    ['Label YES', stats.positive],
    ['Label NO', stats.negative],
    ...stats.distribution.map((count, i) => [`Score ${i} / records`, count]),
    ['Source', `Fadi Thabtah (2017), Autism Screening Adult, UCI. ${DOI}`],
    [
      'Interpretation',
      'Screening labels are not diagnoses. Descriptive statistics for this cohort only.',
    ],
  ]);
}
export function downloadCSV(name: string, content: string) {
  const url = URL.createObjectURL(
    new Blob(['\uFEFF', content], { type: 'text/csv;charset=utf-8;' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
