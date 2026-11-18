import { useState } from 'react';
import {
  ArrowUpRight,
  ChartNoAxesColumnIncreasing,
  CircleDot,
  Globe2,
  UsersRound,
} from 'lucide-react';
import { percent, type Summary } from '../lib/cohort';
import { href } from '../lib/navigation';

export function MetricCards({ stats }: { stats: Summary }) {
  const metrics = [
    {
      title: 'Screening records',
      value: stats.count.toLocaleString('en'),
      note: 'Questionnaire submissions',
      icon: UsersRound,
      tone: 'violet',
    },
    {
      title: 'Geographic coverage',
      value: stats.countryCount,
      note: 'Countries and territories',
      icon: Globe2,
      tone: 'mint',
    },
    {
      title: 'Mean AQ-10 score',
      value: stats.mean?.toFixed(2) ?? '—',
      unit: '/ 10',
      note: 'Average questionnaire score',
      icon: ChartNoAxesColumnIncreasing,
      tone: 'blue',
    },
    {
      title: 'Positive screens',
      value: stats.positiveRate.toFixed(1),
      unit: '%',
      note: `${stats.positive} records labeled positive`,
      icon: CircleDot,
      tone: 'apricot',
    },
  ];
  return (
    <section aria-label="Cohort at a glance" className="metric-grid">
      {metrics.map(({ title, value, unit, note, icon: Icon, tone }) => (
        <article key={title} className="metric-card">
          <div className="metric-cap">
            <span className={`metric-icon ${tone}`}>
              <Icon size={17} strokeWidth={1.85} />
            </span>
            <h2>{title}</h2>
          </div>
          <div className="metric-value">
            {value}
            {unit && <small className={unit === '%' ? 'percent-unit' : ''}>{unit}</small>}
          </div>
          <p>{note}</p>
        </article>
      ))}
    </section>
  );
}
function axisCeiling(max: number) {
  const step = [1, 2, 5, 10, 20, 25, 40, 50, 75, 100, 150, 200].find((n) => n * 4 >= max) || 250;
  return step * 4;
}
export function ScoreChart({
  stats,
  filters = {},
}: {
  stats: Summary;
  filters?: Record<string, string>;
}) {
  const [unit, setUnit] = useState<'count' | 'share'>('count');
  const values = stats.distribution.map((c) => (unit === 'count' ? c : percent(c, stats.count)));
  const peak = Math.max(...values);
  const max = axisCeiling(peak);
  return (
    <article className="panel score-panel" aria-label="Interactive score distribution">
      <div className="panel-heading">
        <div>
          <div className="figure-label">
            <i />
            Figure 01
          </div>
          <h2>Score distribution</h2>
        </div>
        <div className="unit-switch" role="group" aria-label="Chart unit">
          <button aria-pressed={unit === 'count'} onClick={() => setUnit('count')}>
            Count
          </button>
          <button aria-pressed={unit === 'share'} onClick={() => setUnit('share')}>
            %
          </button>
        </div>
      </div>
      <p className="panel-subtitle">
        {unit === 'count' ? 'Number' : 'Percentage'} of records at each AQ-10 score.
      </p>
      <div className="bar-chart" aria-label="Select a score to explore its records">
        <div className="y-axis" aria-hidden="true">
          {[1, 0.75, 0.5, 0.25, 0].map((v) => (
            <span key={v} style={{ top: `${(1 - v) * 100}%` }}>
              {max * v}
              {unit === 'share' ? '%' : ''}
            </span>
          ))}
        </div>
        <div className="plot">
          <div className="grid-lines" aria-hidden="true">
            {[0, 25, 50, 75, 100].map((v) => (
              <i key={v} style={{ top: `${v}%` }} />
            ))}
          </div>
          <div className="bars">
            {values.map((v, i) => (
              <a
                href={href('explorer', { ...filters, score: String(i) })}
                className={`bar-slot ${i > 6 ? 'higher' : ''}`}
                key={i}
                aria-label={`Explore score ${i}: ${stats.distribution[i]} records, ${percent(stats.distribution[i], stats.count).toFixed(1)} percent`}
              >
                <span className="bar-column" style={{ height: `${(v / max) * 100}%` }}>
                  <span className="bar-tip">
                    Score {i} · {unit === 'count' ? `${v} records` : `${v.toFixed(1)}%`}
                  </span>
                  {v === peak && v > 0 && i === values.indexOf(peak) && (
                    <span className="mode-tag" aria-hidden="true">
                      Mode · {i}
                    </span>
                  )}
                </span>
                <span className="x-tick">{i}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="chart-foot">
        <span className="chart-key">
          <i className="lower-dot" />
          Scores 0–6
        </span>
        <span className="chart-key">
          <i className="upper-dot" />
          Scores 7–10
        </span>
        <span className="axis-name">AQ-10 score</span>
      </div>
    </article>
  );
}
export function OutcomeChart({
  stats,
  filters = {},
}: {
  stats: Summary;
  filters?: Record<string, string>;
}) {
  const ratio = stats.positiveRate;
  const gap = Math.min(1.05, ratio / 2, (100 - ratio) / 2);
  return (
    <article className="panel outcome-panel">
      <div className="panel-heading">
        <div>
          <div className="figure-label teal">
            <i />
            Figure 02
          </div>
          <h2>Screening outcomes</h2>
        </div>
      </div>
      <p className="panel-subtitle">Source labels, not clinical diagnoses.</p>
      <div className="donut-wrap">
        <svg
          className="donut"
          viewBox="0 0 160 160"
          role="img"
          aria-label={`${stats.negative} negative and ${stats.positive} positive screening labels`}
        >
          <circle cx="80" cy="80" r="62" fill="none" stroke="#eeedf3" strokeWidth="19" />
          {stats.positive > 0 && (
            <circle
              cx="80"
              cy="80"
              r="62"
              fill="none"
              stroke="var(--violet-chart)"
              strokeWidth="19"
              pathLength="100"
              strokeDasharray={`${ratio - gap} ${100 - ratio + gap}`}
              transform="rotate(-90 80 80)"
            />
          )}
          {stats.negative > 0 && (
            <circle
              cx="80"
              cy="80"
              r="62"
              fill="none"
              stroke="var(--mint-chart)"
              strokeWidth="19"
              pathLength="100"
              strokeDasharray={`${100 - ratio - gap} ${ratio + gap}`}
              transform={`rotate(${-90 + ratio * 3.6} 80 80)`}
            />
          )}
        </svg>
        <div className="donut-center">
          <strong>{stats.count}</strong>
          <span>Total records</span>
        </div>
      </div>
      <div className="outcome-legend">
        {(
          [
            ['Negative', stats.negative, 'NO'],
            ['Positive', stats.positive, 'YES'],
          ] as const
        ).map(([text, count, label]) => (
          <a
            key={text}
            href={href('explorer', { ...filters, label })}
            title={`Explore ${text.toLowerCase()} screens`}
          >
            <span className="chart-key">
              <i className={label === 'YES' ? 'upper-dot' : 'mint-dot'} />
              {text} screen
            </span>
            <strong>{count}</strong>
            <small>{percent(count, stats.count).toFixed(1)}%</small>
          </a>
        ))}
      </div>
    </article>
  );
}
export function ItemProfile({ stats }: { stats: Summary }) {
  return (
    <article className="panel item-panel">
      <div className="panel-heading">
        <div>
          <div className="figure-label">
            <i />
            Item profile
          </div>
          <h2>Questionnaire responses</h2>
        </div>
        <a href={href('dictionary')} className="text-link">
          Field guide <ArrowUpRight size={14} />
        </a>
      </div>
      <p className="panel-subtitle">Share of this cohort scoring one point on each item.</p>
      <div className="item-bars">
        {stats.items.map((n, i) => (
          <div className="item-row" key={i}>
            <span>A{i + 1}</span>
            <div className="item-track">
              <i style={{ width: `${percent(n, stats.count)}%` }} />
            </div>
            <strong>{percent(n, stats.count).toFixed(1)}%</strong>
            <small>
              {n} of {stats.count}
            </small>
          </div>
        ))}
      </div>
    </article>
  );
}
