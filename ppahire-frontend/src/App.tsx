import { Outlet } from 'react-router-dom';

function App() {
  return (
    <div className="min-h-screen flex flex-col main-background">
      {/* 
        A placeholder for a future Navbar component. 
        It will be visible on all pages that use this layout.
      */}
      {/* <Navbar /> */}

      <main className="flex-grow">
        {/* Outlet is the placeholder where child routes will be rendered */}
        {/* For the URL '/login', the Login component will appear here. */}
        <Outlet />
      </main>

      {/* A placeholder for a future Footer component */}
      {/* <Footer /> */}
    </div>
  );
}

export default App;