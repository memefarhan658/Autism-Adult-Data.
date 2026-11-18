import { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpenCheck,
  Database,
  ExternalLink,
  Fingerprint,
  ListChecks,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { DOI, SOURCE, fullCohort } from '../lib/cohort';
import { href } from '../lib/navigation';
import { PageIntro } from '../components/Shared';

type Field = { name: string; source: string; type: string; group: string; description: string };
const fields: Field[] = [
  {
    name: 'Record ID',
    source: 'SA-####',
    type: 'Identifier',
    group: 'Record',
    description:
      'A synthetic identifier based on row order. It does not identify a person outside this dataset.',
  },
  {
    name: 'Country of residence',
    source: 'contry_of_res',
    type: 'Category',
    group: 'Record',
    description:
      'The country or territory reported in the source. AmericanSamoa is displayed as American Samoa.',
  },
  {
    name: 'Age band',
    source: 'age',
    type: 'Category',
    group: 'Record',
    description:
      'Age grouped as 17–24, 25–34, 35–44, 45–54, or 55+. Two missing ages and one outlier are Unknown.',
  },
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Item A${i + 1}`,
    source: `A${i + 1}_Score`,
    type: 'Binary',
    group: 'Questionnaire',
    description: `The scored response to item ${i + 1}: 0 or 1 point. A one is a scored response, not necessarily a literal “yes”.`,
  })),
  {
    name: 'AQ-10 score',
    source: 'result',
    type: 'Integer',
    group: 'Screening',
    description:
      'Sum of the ten item scores (0–10). The preparation script checks each sum against the source result.',
  },
  {
    name: 'Screening label',
    source: 'Class/ASD',
    type: 'Binary',
    group: 'Screening',
    description:
      'Original YES (positive screen) or NO (negative screen) label. Not an independently verified clinical diagnosis.',
  },
];
export function Dictionary() {
  const [q, setQ] = useState(''),
    [group, setGroup] = useState('All fields');
  const filtered = fields.filter(
    (f) =>
      (group === 'All fields' || group === f.group) &&
      `${f.name} ${f.source} ${f.description}`.toLowerCase().includes(q.trim().toLowerCase()),
  );
  return (
    <>
      <PageIntro
        eyebrow="Reference library"
        title="Data dictionary"
        description="A field-by-field guide to the curated research dataset."
      />
      <section className="panel dictionary-panel">
        <div className="dictionary-tools">
          <div className="search-box">
            <Search size={16} />
            <input
              aria-label="Search fields"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search field names or definitions…"
            />
          </div>
          <div className="field-tabs" role="group" aria-label="Field groups">
            {['All fields', 'Record', 'Questionnaire', 'Screening'].map((t) => (
              <button key={t} aria-pressed={group === t} onClick={() => setGroup(t)}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="dictionary-count" aria-live="polite">
          {filtered.length} of {fields.length} fields
        </div>
        {filtered.map((f) => (
          <article className="field-row" key={f.name}>
            <div>
              <span className="field-group">{f.group}</span>
              <h2>{f.name}</h2>
              <code>{f.source}</code>
            </div>
            <p>{f.description}</p>
            <span className="type-tag">{f.type}</span>
          </article>
        ))}
        {!filtered.length && (
          <div className="empty-state">
            <Search size={25} />
            <h3>No fields found</h3>
            <p>Try a different search term or field group.</p>
            <button
              className="button secondary"
              onClick={() => {
                setQ('');
                setGroup('All fields');
              }}
            >
              Show all fields
            </button>
          </div>
        )}
      </section>
    </>
  );
}
export function Methodology() {
  return (
    <>
      <PageIntro
        eyebrow="Project notes"
        title="Methodology"
        description="Where the data comes from, how it was prepared, and what it can tell us."
        action={
          <a className="button secondary" href={SOURCE} target="_blank" rel="noreferrer">
            <ExternalLink size={15} />
            Original dataset
          </a>
        }
      />
      <section className="brief-panel">
        <span className="small-caps">
          <BookOpenCheck size={15} /> Research question
        </span>
        <h2>What can ten questionnaire items tell us about this screening cohort?</h2>
        <p>
          Spectrum Atlas describes the responses in one published dataset. Its purpose is to make
          the patterns inspectable, not to predict autism or assess an individual.
        </p>
      </section>
      <div className="method-grid">
        <article className="panel method-card">
          <div className="method-cap">
            <Database size={19} />
            <span>01 / Provenance</span>
          </div>
          <h2>One published cohort</h2>
          <p>
            Fadi Thabtah’s <em>Autism Screening Adult</em> dataset (2017) contains{' '}
            {fullCohort.count} questionnaire records. This studio uses a local, versioned snapshot,
            not a live clinical feed.
          </p>
          <a className="text-link" href={DOI} target="_blank" rel="noreferrer">
            Read the UCI citation <ArrowUpRight size={14} />
          </a>
        </article>
        <article className="panel method-card">
          <div className="method-cap">
            <Fingerprint size={19} />
            <span>02 / Preparation</span>
          </div>
          <h2>Minimal fields, explicit gaps</h2>
          <p>
            We keep age band, country of residence, ten scored items, and the published label. Two
            missing ages and an implausible age of 383 are grouped as “Unknown”. All records remain
            in the cohort.
          </p>
          <p>
            The source includes 18 records aged 17; the youngest band starts at 17 rather than
            silently excluding them.
          </p>
        </article>
        <article className="panel method-card">
          <div className="method-cap">
            <ListChecks size={19} />
            <span>03 / Validation</span>
          </div>
          <h2>Check the score, not just the chart</h2>
          <p>
            Each total is the sum of ten binary items. The preparation step checks all 704 sums
            against the original result. Percentages use the active cohort as the denominator.
          </p>
          <p>
            The YES label coincides with scores 7–10 throughout this snapshot. A model using the
            score to predict that label would reproduce a rule, not validate a diagnosis.
          </p>
        </article>
        <article className="panel method-card">
          <div className="method-cap">
            <ShieldCheck size={19} />
            <span>04 / Interpretation</span>
          </div>
          <h2>Screening is not diagnosis</h2>
          <p>
            These submissions are not a representative population sample. The positive-screen share
            is not an estimate of autism prevalence, and subgroup differences are not evidence of
            causation.
          </p>
          <p>
            Do not use these records to make clinical, hiring, or eligibility decisions about
            anyone.
          </p>
        </article>
      </div>
      <section className="panel citation-panel">
        <div className="figure-label">
          <i />
          Attribution
        </div>
        <h2>Dataset citation</h2>
        <p>
          Thabtah, F. (2017). <em>Autism Screening Adult</em> [Dataset]. UCI Machine Learning
          Repository.{' '}
          <a href={DOI} target="_blank" rel="noreferrer">
            10.24432/C5F019 <ArrowUpRight size={12} />
          </a>
        </p>
        <p>
          The curated snapshot is adapted from the source under{' '}
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">
            CC BY 4.0
          </a>
          . Field selection, age grouping, and display IDs are project transformations.
        </p>
        <a className="text-link" href={href('dictionary')}>
          Browse field definitions <ArrowRight size={15} />
        </a>
      </section>
    </>
  );
}
