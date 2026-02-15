import { AppProvider } from './context/AppContext';
import { MapView } from './components/Map';
import { Sidebar } from './components/Sidebar';
import { FilterBar } from './components/Controls';
import { MapHeader } from './components/MapHeader';
import { ComparePanel } from './components/ComparePanel';
import { useDistrictData } from './hooks/useDistrictData';

function AppContent() {
  const { data, loading, error } = useDistrictData();

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <MapHeader data={data} />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1">
          <MapView data={data} />
        </div>
        <Sidebar />
      </div>
      <ComparePanel />
      <FilterBar />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
