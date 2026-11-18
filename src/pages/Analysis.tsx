import { ChartSpline, Lightbulb } from 'lucide-react';
import {
  AGE_BANDS,
  filterRecords,
  fullCohort,
  percent,
  records,
  summarize,
  summaryCSV,
} from '../lib/cohort';
import { setFilters } from '../lib/navigation';
import { ExportButton, PageIntro, SelectField } from '../components/Shared';
import { ItemProfile, OutcomeChart, ScoreChart } from '../components/Charts';

export function Analysis({ params }: { params: URLSearchParams }) {
  const age = AGE_BANDS.includes(params.get('age') || '') ? params.get('age')! : '';
  const stats = age ? summarize(filterRecords(records, { ageBand: age })) : fullCohort;
  const n = Math.max(...stats.distribution);
  const modes = stats.distribution.flatMap((v, i) => (v === n ? [i] : []));
  return (
    <>
      <PageIntro
        eyebrow="Analytical lens"
        title="Score analysis"
        description="Inspect how questionnaire scores and item responses vary by age band."
        action={
          <ExportButton
            filename="spectrum-atlas-score-summary.csv"
            content={() => summaryCSV(stats, age ? `Age band: ${age}` : 'All screening records')}
          />
        }
      />
      <section className="panel analysis-focus">
        <div className="focus-icon">
          <ChartSpline size={24} />
        </div>
        <div className="focus-title">
          <span className="small-caps">Selected cohort</span>
          <h2>
            {!age
              ? 'All screening records'
              : age === 'Unknown'
                ? 'Age not available'
                : `Age band: ${age}`}
          </h2>
          <p>
            {stats.count} records <span>·</span> Mean score{' '}
            <strong>{stats.mean?.toFixed(2) ?? '—'}</strong> / 10
          </p>
        </div>
        <SelectField
          name="analysis-age"
          label="Focus by age"
          value={age}
          onChange={(v) => setFilters('analysis', params, { age: v })}
          options={[
            { value: '', text: 'All age bands' },
            ...AGE_BANDS.map((v) => ({ value: v, text: v })),
          ]}
        />
      </section>
      <div className="charts-grid">
        <ScoreChart stats={stats} filters={{ age }} />
        <OutcomeChart stats={stats} filters={{ age }} />
      </div>
      <div className="insight-note">
        <Lightbulb size={20} />
        <p>
          <strong>
            {modes.length === 1 ? 'Most frequent score' : 'Tied most frequent scores'}:{' '}
            {modes.join(', ')}.
          </strong>{' '}
          {modes.length === 1 ? 'This score appears' : 'Each appears'} in {n} of {stats.count}{' '}
          records ({percent(n, stats.count).toFixed(1)}%) in this cohort. Select a bar to inspect
          the underlying records.
        </p>
      </div>
      <ItemProfile stats={stats} />
    </>
  );
}
