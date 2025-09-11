
const PublicFooter = () => {
  return (
    <footer className="bg-white border-t">
      <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} PPAHire. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;