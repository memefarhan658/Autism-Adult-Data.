import { useSyncExternalStore } from 'react';

export const pages = {
  overview: 'Overview',
  explorer: 'Data explorer',
  analysis: 'Score analysis',
  dictionary: 'Data dictionary',
  methodology: 'Methodology',
};
export type Page = keyof typeof pages;
function subscribe(listener: () => void) {
  window.addEventListener('hashchange', listener);
  return () => window.removeEventListener('hashchange', listener);
}
export function useRoute() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash);
  const [path, rawQuery = ''] = hash.replace(/^#\/?/, '').split('?');
  const page: Page = path && Object.hasOwn(pages, path) ? (path as Page) : 'overview';
  return { page, params: new URLSearchParams(rawQuery) };
}
export function href(page: Page, params?: Record<string, string>) {
  const query = new URLSearchParams(
    Object.entries(params || {}).filter(([, value]) => value),
  ).toString();
  return `#/${page}${query ? `?${query}` : ''}`;
}
// Filter changes are shareable but don't add a history entry for every keystroke.
export function setFilters(page: Page, params: URLSearchParams, change: Record<string, string>) {
  const next = new URLSearchParams(params);
  Object.entries(change).forEach(([key, value]) =>
    value ? next.set(key, value) : next.delete(key),
  );
  window.history.replaceState(null, '', href(page, Object.fromEntries(next)));
  window.dispatchEvent(new Event('hashchange'));
}
