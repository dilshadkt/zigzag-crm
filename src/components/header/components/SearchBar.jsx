import React from "react";

const SearchBar = () => {
  return (
    <div className="hidden lg:block relative w-1/3">
      <input
        type="text"
        className="bg-white py-3 text-sm w-full rounded-[14px] pr-3 pl-11 outline-none"
        placeholder="Search"
      />
      <img
        src="/icons/search.svg"
        alt=""
        className="absolute top-0 bottom-0 h-fit my-auto left-3"
      />
    </div>
  );
};

export default SearchBar;
