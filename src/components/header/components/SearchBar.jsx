import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalSearch } from "../../../api/hooks";
import { SIDE_MENU } from "../../../constants";
import { FiSearch, FiFile, FiCheckSquare, FiArrowRight } from "react-icons/fi";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const { data: searchResults, isLoading } = useGlobalSearch(searchTerm);

  // Filter local routes
  const filteredRoutes = SIDE_MENU.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 3);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (path) => {
    navigate(path);
    setSearchTerm("");
    setShowResults(false);
  };

  const hasResults =
    (searchResults?.projects?.length > 0) ||
    (searchResults?.tasks?.length > 0) ||
    (filteredRoutes.length > 0);

  return (
    <div className="hidden lg:block relative w-1/3" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          className="bg-white py-3 text-sm w-full rounded-[14px] pr-3 pl-11 outline-none transition-all focus:ring-2 focus:ring-primary/20"
          placeholder="Search projects, tasks, or pages..."
        />
        <FiSearch className="absolute top-0 bottom-0 left-4 h-fit my-auto text-gray-400 text-lg" />
        
        {isLoading && searchTerm.length >= 2 && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </div>
        )}
      </div>

      {/* Results Dropdown */}
      {showResults && searchTerm.length >= 2 && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {!hasResults && !isLoading && (
              <div className="p-4 text-center text-gray-500 text-sm">
                No results found for "{searchTerm}"
              </div>
            )}

            {/* Navigation Routes */}
            {filteredRoutes.length > 0 && (
              <div className="p-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-1">
                  Pages
                </p>
                {filteredRoutes.map((route) => (
                  <button
                    key={route.id}
                    onClick={() => handleResultClick(route.path)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-100 transition-colors">
                      <route.icon size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">{route.title}</p>
                      <p className="text-[10px] text-gray-400">Navigation Route</p>
                    </div>
                    <FiArrowRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </button>
                ))}
              </div>
            )}

            {/* Projects */}
            {searchResults?.projects?.length > 0 && (
              <div className="p-2 border-t border-gray-50">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-1">
                  Projects
                </p>
                {searchResults.projects.map((project) => (
                  <button
                    key={project._id}
                    onClick={() => handleResultClick(`/projects/${project._id}`)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500 group-hover:bg-purple-100 transition-colors overflow-hidden">
                      {project.thumbImg ? (
                        <img src={project.thumbImg} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <FiFile size={16} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">{project.name}</p>
                      <p className="text-[10px] text-gray-400">Project Workspace</p>
                    </div>
                    <FiArrowRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </button>
                ))}
              </div>
            )}

            {/* Tasks */}
            {searchResults?.tasks?.length > 0 && (
              <div className="p-2 border-t border-gray-50">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-1">
                  Tasks
                </p>
                {searchResults.tasks.map((task) => (
                  <button
                    key={task._id}
                    onClick={() => {
                      const path = task.project?._id 
                        ? `/projects/${task.project._id}/${task._id}` 
                        : `/tasks/${task._id}`;
                      handleResultClick(path);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 group-hover:bg-orange-100 transition-colors">
                      <FiCheckSquare size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{task.title}</p>
                      <p className="text-[10px] text-gray-400 truncate">
                        In {task.project?.name || "Other Project"} • {task.status}
                      </p>
                    </div>
                    <FiArrowRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
