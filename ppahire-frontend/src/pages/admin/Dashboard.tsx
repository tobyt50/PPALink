import { useAuthStore } from '../../context/AuthContext';

const AdminDashboard = () => {
  // We can get the admin's user object to personalize the welcome message
  const adminUser = useAuthStore((state) => state.user);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-primary-600">
        Admin Dashboard
      </h1>
      <p className="mt-2 text-gray-600">
        Welcome, {adminUser?.email || 'Admin'}.
      </p>
      
      <div className="mt-8 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800">Platform Overview</h2>
        <p className="mt-2 text-gray-500">
          This is the central hub for platform administration. Use the sidebar to navigate to different management sections.
        </p>
        <p className="mt-4 text-sm">
          Future widgets for user statistics, pending verifications, and system health will be displayed here.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;