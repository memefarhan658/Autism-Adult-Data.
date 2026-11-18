import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Database,
  FlaskConical,
  LayoutDashboard,
  Menu,
  PanelLeft,
  ShieldCheck,
  Table2,
} from 'lucide-react';
import { href, pages, type Page } from '../lib/navigation';
import { SOURCE } from '../lib/cohort';
import { Modal, SourceFooter } from './Shared';

const groups = [
  {
    title: 'Workspace',
    links: [
      ['overview', LayoutDashboard],
      ['explorer', Table2],
      ['analysis', Activity],
    ],
  },
  {
    title: 'Reference',
    links: [
      ['dictionary', BookOpen],
      ['methodology', FlaskConical],
    ],
  },
] as const;
function Sidebar({ page, onNavigate }: { page: Page; onNavigate?: () => void }) {
  return (
    <>
      <a
        className="brand"
        href={href('overview')}
        onClick={onNavigate}
        aria-label="Spectrum Atlas overview"
      >
        <img src={`${import.meta.env.BASE_URL}atlas-mark.svg`} alt="" width="38" height="38" />
        <span className="brand-type">
          Spectrum Atlas<small>Research studio</small>
        </span>
      </a>
      <nav className="navigation" aria-label="Primary navigation">
        {groups.map((group) => (
          <div className="nav-group" key={group.title}>
            <div className="nav-label">{group.title}</div>
            {group.links.map(([key, Icon]) => (
              <a
                key={key}
                className={`nav-link ${page === key ? 'active' : ''}`}
                aria-current={page === key ? 'page' : undefined}
                title={pages[key]}
                href={href(key)}
                onClick={onNavigate}
              >
                <Icon size={18} strokeWidth={1.75} />
                <span>{pages[key]}</span>
                {page === key && <i className="nav-active-dot" />}
              </a>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-tail">
        <a
          className="source-card"
          href={SOURCE}
          target="_blank"
          rel="noreferrer"
          title="Open the original UCI dataset"
        >
          <span className="source-kicker">
            <Database size={13} />
            <span>Data source</span>
            <ArrowUpRight size={13} />
          </span>
          <strong>UCI Repository</strong>
          <small>Machine Learning Repository</small>
        </a>
        <a
          className="research-notice"
          title="Read research limitations"
          href={href('methodology')}
          onClick={onNavigate}
        >
          <ShieldCheck size={15} />
          <span>Research use only</span>
        </a>
      </div>
    </>
  );
}
export function Shell({ page, children }: { page: Page; children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const main = useRef<HTMLElement>(null);
  const lastPage = useRef(page);
  useEffect(() => {
    document.title = `${page === 'overview' ? 'Research overview' : pages[page]} · Spectrum Atlas`;
    if (page !== lastPage.current) {
      setMobileOpen(false);
      window.scrollTo(0, 0);
      main.current?.focus({ preventScroll: true });
      lastPage.current = page;
    }
  }, [page]);
  return (
    <div className={`app-shell ${collapsed ? 'rail-collapsed' : ''}`}>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus();
        }}
      >
        Skip to content
      </a>
      <aside className="sidebar">
        <Sidebar page={page} />
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button desktop-menu"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed(!collapsed)}
            >
              <PanelLeft size={17} />
            </button>
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
            <span className="bread-rule" />
            <a className="workspace-crumb" href={href('overview')}>
              Workspace
            </a>
            <a
              className="mobile-brand"
              href={href('overview')}
              aria-label="Spectrum Atlas overview"
            >
              <img
                alt=""
                src={`${import.meta.env.BASE_URL}atlas-mark.svg`}
                width="25"
                height="25"
              />
              Spectrum Atlas
            </a>
            <ChevronRight size={13} />
            <strong>{pages[page]}</strong>
          </div>
          <div className="top-status">
            <span className="live-badge">
              <i />
              Live demo
            </span>
            <span className="version">v1.0</span>
          </div>
        </header>
        <main ref={main} id="main-content" tabIndex={-1}>
          <div className="page-wrap">
            {children}
            <SourceFooter />
          </div>
        </main>
      </div>
      {mobileOpen && (
        <Modal title="Navigation" close={() => setMobileOpen(false)} className="drawer-dialog">
          <div className="mobile-sidebar">
            <Sidebar page={page} onNavigate={() => setMobileOpen(false)} />
          </div>
        </Modal>
      )}
    </div>
  );
}
