
const AgencyDashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-primary-600">
        Agency Dashboard
      </h1>
      <p className="mt-2 text-gray-600">Welcome! Manage your job postings and candidates here.</p>
      
      <div className="mt-8 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800">Quick Stats</h2>
        <p className="mt-2 text-gray-500">
          Dashboard widgets for job posts and applicants will be displayed here.
        </p>
      </div>
    </div>
  );
};

export default AgencyDashboard;