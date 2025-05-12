import React from "react";
import { IoArrowUpOutline } from "react-icons/io5";

const PageNavigator = ({ currentPage, totalPages, onPageChange }) => {
  const itemsPerPage = 10;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalPages * itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="h-11 flexCenter gap-x-3 bg-white px-4 rounded-[14px]">
      <span>{startItem}-{endItem} of {totalPages * itemsPerPage}</span>
      <div className="flexStart gap-x-1">
        <button 
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`cursor-pointer hover:scale-70 transition-all duration-100 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <IoArrowUpOutline className="text-xl text-[#C9CCD1] -rotate-90 w-5" />
        </button>
        <button 
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`cursor-pointer hover:scale-70 transition-all duration-100 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <IoArrowUpOutline className="text-xl text-[#3F8CFF] rotate-90 w-5" />
        </button>
      </div>
    </div>
  );
};

export default PageNavigator;
