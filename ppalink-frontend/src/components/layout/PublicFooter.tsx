import { Link } from 'react-router-dom';

const PublicFooter = () => {
  return (
    // Replicated modern, subtle background and border
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
        {/* Polished layout for logo, nav, and copyright */}
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          
          {/* Logo */}
          <div className="flex justify-center md:justify-start">
            <Link to="/">
              <img
                src="/header.png"
                alt="ppalink Logo"
                className="h-7 w-auto opacity-70 transition-opacity hover:opacity-100"
              />
            </Link>
          </div>
          
          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label="Footer">
            <Link to="/about" className="text-sm font-medium text-gray-600 transition-colors hover:text-primary-600">
              About Us
            </Link>
            <Link to="/terms" className="text-sm font-medium text-gray-600 transition-colors hover:text-primary-600">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-sm font-medium text-gray-600 transition-colors hover:text-primary-600">
              Privacy Policy
            </Link>
          </nav>

          {/* Copyright */}
          <div className="text-center text-sm text-gray-500 md:text-right">
            <p>&copy; {new Date().getFullYear()} PPALink. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;