import { ArrowRight, Layers3, ScanLine } from 'lucide-react';
import { fullCohort, records, summaryCSV } from '../lib/cohort';
import { href } from '../lib/navigation';
import { ExportButton, PageIntro } from '../components/Shared';
import { MetricCards, OutcomeChart, ScoreChart } from '../components/Charts';
import { RecordTable } from '../components/Records';

export function Overview() {
  return (
    <>
      <PageIntro
        eyebrow="Analytics workspace"
        title="Research overview"
        description="A dataset-level view of adult autism screening patterns."
        action={
          <ExportButton
            filename="spectrum-atlas-summary.csv"
            content={() => summaryCSV(fullCohort)}
          />
        }
      />
      <section className="spotlight" aria-labelledby="spotlight-title">
        <div className="spotlight-art" aria-hidden="true" />
        <div className="spotlight-copy">
          <div className="spotlight-meta">
            <div className="spotlight-tag">
              <Layers3 size={13} />
              Dataset spotlight
            </div>
            <span>
              UCI <b>/</b> 2017
            </span>
          </div>
          <h2 id="spotlight-title">Adult Autism Screening</h2>
          <p>
            Explore questionnaire responses and screening outcomes from the UCI Machine Learning
            Repository.
          </p>
          <a className="button hero-button" href={href('explorer')}>
            Explore dataset <ArrowRight size={15} />
          </a>
        </div>
        <div className="art-caption" aria-hidden="true">
          <ScanLine size={11} />
          ATLAS FIELD <b>/</b> 001
        </div>
      </section>
      <MetricCards stats={fullCohort} />
      <section className="charts-grid" aria-label="Screening insights">
        <ScoreChart stats={fullCohort} />
        <OutcomeChart stats={fullCohort} />
      </section>
      <section className="panel preview-panel">
        <div className="preview-heading">
          <div>
            <div className="figure-label">
              <i />
              Cohort preview
            </div>
            <h2>Inside the dataset</h2>
            <p className="panel-subtitle">The first five records, in source order.</p>
          </div>
          <a className="text-link" href={href('explorer')}>
            Open explorer <ArrowRight size={15} />
          </a>
        </div>
        <RecordTable rows={records.slice(0, 5)} />
      </section>
    </>
  );
}
