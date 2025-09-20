import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
// We will create the Sidebar component in a future step
// import Sidebar from '../components/layout/Sidebar'; 

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* The glossy Navbar at the top */}
      <Navbar />

      <div className="flex">
        {/* 
          A placeholder for the Sidebar.
          This structure is ready for it when we build it.
          For now, the main content will take the full width.
        */}
        {/* <Sidebar /> */}

        {/* 
          Main content area.
          - 'flex-1': This makes the main content take up all available space.
          - 'p-4 sm:p-6 lg:p-8': Provides responsive padding for the content.
        */}
        <main className="flex-1 p-4 sm:p-6 lg:px-8 lg:pb-8 lg:pt-5">
          {/* Outlet is where the specific dashboard pages will be rendered */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;