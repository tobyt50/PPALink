import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  // Determine the range of page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    // Always show the first page
    if (totalPages > 0) pageNumbers.push(1);

    // Add ellipsis if there's a gap after the first page
    if (currentPage > 3) {
      pageNumbers.push('...');
    }

    // Add the page before the current page
    if (currentPage > 2) {
      pageNumbers.push(currentPage - 1);
    }
    
    // Add the current page (if it's not the first or last)
    if (currentPage !== 1 && currentPage !== totalPages) {
      pageNumbers.push(currentPage);
    }

    // Add the page after the current page
    if (currentPage < totalPages - 1) {
      pageNumbers.push(currentPage + 1);
    }
    
    // Add ellipsis if there's a gap before the last page
    if (currentPage < totalPages - 2) {
      pageNumbers.push('...');
    }
    
    // Always show the last page (if it's different from the first)
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }

    return [...new Set(pageNumbers)]; // Use Set to remove duplicates
  };

  const pages = getPageNumbers();

  return (
    <nav className="flex items-center justify-between">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="relative inline-flex items-center rounded-md px-2 py-2 text-sm font-medium text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-5 w-5" />
        <span>Previous</span>
      </button>

      {/* Page Numbers */}
      <div className="hidden sm:flex">
        {pages.map((page, index) =>
          typeof page === 'string' ? (
            <span key={`ellipsis-${index}`} className="px-4 py-2 text-sm">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                currentPage === page
                  ? 'z-10 bg-primary-50 dark:bg-primary-950/60 border-primary-500 dark:border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800'
              } border border-gray-300 dark:border-zinc-800`}
            >
              {page}
            </button>
          )
        )}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="relative inline-flex items-center rounded-md px-2 py-2 text-sm font-medium text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>Next</span>
        <ChevronRight className="h-5 w-5" />
      </button>
    </nav>
  );
};
