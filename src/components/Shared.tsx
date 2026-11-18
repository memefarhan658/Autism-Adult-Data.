import { useEffect, useId, useRef, type ReactNode } from 'react';
import { ArrowUpRight, ChevronDown, Download, X } from 'lucide-react';
import { DOI, downloadCSV } from '../lib/cohort';

export function PageIntro({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-intro">
      <div>
        <div className="eyebrow">
          <i />
          {eyebrow}
        </div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action && <div className="intro-action">{action}</div>}
    </header>
  );
}
export function ExportButton({
  filename,
  content,
  children = 'Export summary',
}: {
  filename: string;
  content: () => string;
  children?: string;
}) {
  return (
    <button
      className="button secondary export-button"
      aria-label={children}
      title={children}
      onClick={() => downloadCSV(filename, content())}
    >
      <Download size={15} />
      <span>{children}</span>
    </button>
  );
}
export function SelectField({
  name,
  label,
  value,
  onChange,
  options,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; text: string }[];
}) {
  return (
    <label className="select-field">
      <span>{label}</span>
      <span className="select-box">
        <select name={name} value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.text}
            </option>
          ))}
        </select>
        <ChevronDown size={14} aria-hidden="true" />
      </span>
    </label>
  );
}
export function SourceFooter() {
  return (
    <footer className="source-footer">
      <span>
        <i />
        Spectrum Atlas <b>/</b> Research workspace
      </span>
      <a href={DOI} target="_blank" rel="noreferrer">
        Thabtah, 2017 · UCI <ArrowUpRight size={12} />
      </a>
    </footer>
  );
}
export function Modal({
  title,
  children,
  close,
  className = '',
}: {
  title: string;
  children: ReactNode;
  close: () => void;
  className?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const el = dialog.current!;
    const before = document.body.style.overflow;
    const trigger = document.activeElement;
    el.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      el.close();
      document.body.style.overflow = before;
      if (trigger instanceof HTMLElement && trigger.isConnected)
        trigger.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      className={`dialog ${className}`}
      ref={dialog}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === dialog.current) close();
      }}
    >
      <div className="dialog-body">
        <div className="dialog-top">
          <h2 id={titleId}>{title}</h2>
          <button
            type="button"
            className="icon-button"
            aria-label="Close dialog"
            onClick={close}
            autoFocus
          >
            <X size={19} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
