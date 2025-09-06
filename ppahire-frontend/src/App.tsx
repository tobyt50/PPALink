import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDataStore } from './context/DataStore'; // 1. Import the new data store

function App() {
  // 2. Get the fetch action from the store
  const fetchLookupData = useDataStore((state) => state.fetchLookupData);

  // 3. Use a useEffect hook to call the fetch action once when the app mounts
  useEffect(() => {
    fetchLookupData();
  }, [fetchLookupData]);

  return (
    <div className="min-h-screen flex flex-col main-background">
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
}

export default App;