type PaginationProps = {
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
  nextPage: () => void;
  prevPage: () => void;
};

export default function Pagination({
  itemsPerPage,
  totalItems,
  currentPage,
  nextPage,
  prevPage,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <nav>
      <ul className="mt-4 flex justify-center">
        <li>
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`page-link mx-2 rounded border border-teal-500 px-4 py-2 shadow-md ${
              currentPage === 1
                ? "cursor-not-allowed text-gray-500"
                : "text-teal-500 transition hover:translate-y-1 hover:bg-teal-500 hover:text-white hover:shadow-lg"
            }`}
          >
            Previous
          </button>
        </li>
        <li className="mx-2">
          <span className="page-link rounded border border-teal-500 bg-teal-500 px-4 py-2 text-white shadow-md">
            {currentPage}
          </span>
        </li>
        <li>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className={`page-link mx-2 rounded border border-teal-500 px-4 py-2 shadow-md ${
              currentPage === totalPages
                ? "cursor-not-allowed text-gray-500"
                : "text-teal-500 transition hover:translate-y-1 hover:bg-teal-500 hover:text-white hover:shadow-lg"
            }`}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
}
