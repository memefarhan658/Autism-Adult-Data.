import { Shell } from './components/Shell';
import { Overview } from './pages/Overview';
import { Explorer } from './pages/Explorer';
import { Analysis } from './pages/Analysis';
import { Dictionary, Methodology } from './pages/Reference';
import { useRoute } from './lib/navigation';

export function App() {
  const { page, params } = useRoute();
  return (
    <Shell page={page}>
      {page === 'overview' ? (
        <Overview />
      ) : page === 'explorer' ? (
        <Explorer params={params} />
      ) : page === 'analysis' ? (
        <Analysis params={params} />
      ) : page === 'dictionary' ? (
        <Dictionary />
      ) : (
        <Methodology />
      )}
    </Shell>
  );
}
