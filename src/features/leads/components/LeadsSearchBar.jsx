import { FiSearch } from "react-icons/fi";

const LeadsSearchBar = ({ value, onChange, placeholder = "Search" }) => {
  return (
    <div className="relative w-full max-w-sm">
      <FiSearch
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full h-11 rounded-full bg-slate-50 border border-slate-200 pl-11 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#3f8cff] focus:ring-2 focus:ring-[#3f8cff]/20 transition-all"
        type="text"
      />
    </div>
  );
};

export default LeadsSearchBar;

