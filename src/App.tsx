import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <div className="h-screen w-screen flex flex-col">
        <header className="bg-slate-800 text-white p-4">
          <h1 className="text-xl font-bold">UK House Price Map</h1>
        </header>
        <main className="flex-1 flex">
          <div className="flex-1">{/* Map will go here */}</div>
          <aside className="w-80 bg-white border-l border-gray-200 p-4">
            {/* Sidebar will go here */}
          </aside>
        </main>
      </div>
    </AppProvider>
  );
}

export default App;
