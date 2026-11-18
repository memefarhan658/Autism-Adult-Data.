import { useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  Fingerprint,
  Layers3,
  ShieldCheck,
} from 'lucide-react';
import type { Label, RecordRow, SortKey } from '../lib/cohort';
import { Modal } from './Shared';

function LabelBadge({ label }: { label: Label }) {
  return (
    <span className={`label-badge ${label === 'YES' ? 'positive' : 'negative'}`}>
      <i />
      {label === 'YES' ? 'Positive' : 'Negative'}
    </span>
  );
}
export function RecordDetails({ row, close }: { row: RecordRow; close: () => void }) {
  return (
    <Modal title="Record details" close={close}>
      <div className="record-identity">
        <span className="record-icon">
          <Fingerprint size={26} />
        </span>
        <div>
          <span className="small-caps">Research record</span>
          <h3>{row.id}</h3>
        </div>
        <LabelBadge label={row.label} />
      </div>
      <dl className="detail-grid">
        <div>
          <dt>Residence</dt>
          <dd>{row.country}</dd>
        </div>
        <div>
          <dt>Age band</dt>
          <dd>{row.ageBand}</dd>
        </div>
        <div>
          <dt>AQ-10 score</dt>
          <dd>{row.score} / 10</dd>
        </div>
        <div>
          <dt>Source label</dt>
          <dd>{row.label}</dd>
        </div>
      </dl>
      <h4 className="detail-heading">Item scores</h4>
      <p className="muted small">Each one contributes a point to the total score.</p>
      <div className="bits-grid">
        {row.items.map((v, i) => (
          <div key={i} className={v === 1 ? 'set' : ''}>
            <span>A{i + 1}</span>
            <b>{v}</b>
          </div>
        ))}
      </div>
      <div className="note">
        <ShieldCheck size={17} />
        <p>This label comes from the source questionnaire. It is not an independent diagnosis.</p>
      </div>
    </Modal>
  );
}
const columns: [SortKey, string][] = [
  ['id', 'Record ID'],
  ['country', 'Country of residence'],
  ['ageBand', 'Age band'],
  ['score', 'AQ-10 score'],
  ['label', 'Screening label'],
];
export function RecordTable({
  rows,
  sort,
  onSort,
}: {
  rows: RecordRow[];
  sort?: { key: SortKey; desc: boolean };
  onSort?: (key: SortKey) => void;
}) {
  const [selected, setSelected] = useState<RecordRow | null>(null);
  return (
    <>
      <div className="table-scroll" tabIndex={0} role="region" aria-label="Screening record table">
        <table className="record-table">
          <thead>
            <tr>
              {columns.map(([key, text]) => (
                <th
                  key={key}
                  scope="col"
                  aria-sort={
                    sort?.key === key ? (sort.desc ? 'descending' : 'ascending') : undefined
                  }
                >
                  {onSort ? (
                    <button className="sort-button" onClick={() => onSort(key)}>
                      {text}
                      {sort?.key === key ? (
                        sort.desc ? (
                          <ArrowDown size={12} />
                        ) : (
                          <ArrowUp size={12} />
                        )
                      ) : (
                        <ArrowUpDown size={11} />
                      )}
                    </button>
                  ) : (
                    text
                  )}
                </th>
              ))}
              <th scope="col">
                <span className="sr-only">Details</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <button className="record-id" onClick={() => setSelected(row)}>
                    <Layers3 size={13} />
                    {row.id}
                  </button>
                </td>
                <td>{row.country}</td>
                <td>{row.ageBand}</td>
                <td>
                  <span className="score-cell">
                    <b>{row.score}</b>
                    <i>
                      <em style={{ width: `${row.score * 10}%` }} />
                    </i>
                  </span>
                </td>
                <td>
                  <LabelBadge label={row.label} />
                </td>
                <td>
                  <button
                    className="row-open"
                    aria-label={`View details for ${row.id}`}
                    onClick={() => setSelected(row)}
                  >
                    <ArrowRight size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && <RecordDetails row={selected} close={() => setSelected(null)} />}
    </>
  );
}
