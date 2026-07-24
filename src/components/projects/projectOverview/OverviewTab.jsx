import React from "react";
import { FaInstagram, FaFacebook, FaYoutube, FaLinkedin, FaTwitter, FaGlobe } from "react-icons/fa";

const SocialIcon = ({ platform }) => {
  const iconClass = "text-xl";
  switch (platform.toLowerCase()) {
    case "instagram": return <FaInstagram className={`text-pink-600 ${iconClass}`} />;
    case "facebook": return <FaFacebook className={`text-blue-700 ${iconClass}`} />;
    case "youtube": return <FaYoutube className={`text-red-600 ${iconClass}`} />;
    case "linkedin": return <FaLinkedin className={`text-blue-800 ${iconClass}`} />;
    case "twitter": return <FaTwitter className={`text-sky-500 ${iconClass}`} />;
    default: return <FaGlobe className={`text-gray-500 ${iconClass}`} />;
  }
};

const getSocialUrl = (platform, handle) => {
  if (!handle) return null;
  if (handle.startsWith("http")) return handle;
  const h = handle.startsWith("@") ? handle.slice(1) : handle;
  switch (platform.toLowerCase()) {
    case "instagram": return `https://www.instagram.com/${h}`;
    case "facebook": return `https://www.facebook.com/${h}`;
    case "youtube": return `https://www.youtube.com/${handle.startsWith('@') ? handle : '@' + handle}`;
    case "twitter": return `https://www.twitter.com/${h}`;
    case "linkedin": return `https://www.linkedin.com/company/${h}`;
    default: return null;
  }
};

export const OverviewTab = ({ currentProject, selectedMonth }) => {
  const managedSocials = Object.entries(currentProject?.socialMedia || {})
    .filter(([k, v]) => k !== 'other' && k !== '_id' && k !== '__v' && v?.manage);
  const managedOthers = currentProject?.socialMedia?.other?.filter(v => v.manage) || [];
  const hasSocialMedia = managedSocials.length > 0 || managedOthers.length > 0;

  const branchLogins = currentProject?.customFields?.branchLogins || [];
  const legacyBranches = currentProject?.customFields?.branches || [];
  const branches = branchLogins.length > 0 ? branchLogins : legacyBranches.filter(b => typeof b === 'object' && b.username);

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-6 pr-4 pb-24 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
      {/* Section 1: Stats Summary (Top) - COMPACT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-4 rounded-xl text-white shadow-sm">
          <span className="text-[9px] uppercase font-bold opacity-80 tracking-widest">Overall Progress</span>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xl font-bold">{currentProject?.progress || 0}%</span>
            <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${currentProject?.progress || 0}%` }}></div>
            </div>
          </div>
        </div>
        <div className="bg-[#F8FAFC] p-4 rounded-xl border border-gray-100 flex items-center justify-between">
          <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Active Tasks</span>
          <div className="text-xl font-bold text-gray-800">{currentProject?.tasks?.filter(t => t.status !== 'completed' && t.status !== 'approved').length || 0}</div>
        </div>
        <div className="bg-[#F8FAFC] p-4 rounded-xl border border-gray-100 flex items-center justify-between">
          <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Team Capacity</span>
          <div className="text-xl font-bold text-gray-800">{currentProject?.teams?.length || 0} Members</div>
        </div>
      </div>

      {/* Section 2: Project Information */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100">
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
          Core Project Details
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Description</span>
            <p className="text-xs text-gray-600 leading-relaxed bg-[#F8FAFC] p-3 rounded-xl border border-gray-100">
              {currentProject?.description || "No description provided."}
            </p>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Priority</span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${currentProject?.priority === 'high' ? 'bg-red-50 text-red-600 border border-red-100' :
                  currentProject?.priority === 'medium' ? 'bg-yellow-50 text-yellow-600 border border-yellow-100' :
                    'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}>
                  {currentProject?.priority || 'low'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Deadline</span>
                <span className="text-xs font-bold text-gray-700 block mt-1">
                  {currentProject?.endDate ? new Date(currentProject.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : '-'}
                </span>
              </div>
            </div>

            {currentProject?.teams?.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Assigned Team</span>
                <div className="flex flex-wrap gap-2">
                  {currentProject.teams.map((member) => (
                    <div key={member._id} className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-gray-100">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flexCenter text-[9px] font-bold text-blue-600 overflow-hidden border border-white">
                        {member.profileImage ? <img src={member.profileImage} alt="" className="w-full h-full object-cover" /> : member.firstName?.charAt(0)}
                      </div>
                      <span className="text-[10px] font-semibold text-gray-700">{member.firstName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 3: Additional Details & Custom Fields */}
      {currentProject?.customFields && Object.keys(currentProject.customFields).length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
            Custom Properties & Social Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(currentProject.customFields).map(([key, value]) => {
              if (key === "branches") return null;
              if (value === undefined || value === null || value === "") return null;
              return (
                <div key={key} className="flex flex-col gap-1.5 p-3 bg-[#F8FAFC] rounded-xl border border-gray-100 transition-colors">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{key.replace(/_/g, ' ')}</span>
                  <div className="text-xs font-semibold text-gray-700">
                    {typeof value === 'boolean' ? (
                      <span className={`px-2 py-0.5 rounded text-[10px] ${value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {value ? 'Yes' : 'No'}
                      </span>
                    ) : Array.isArray(value) ? (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {value.map((item, i) => {
                          if (!item) return null;

                          // Handle non-objects or arrays of simple values
                          if (typeof item !== "object" || Array.isArray(item)) {
                            const displayValue = Array.isArray(item) ? item.join(" ") : item.toString();
                            return (
                              <span key={i} className="bg-white text-indigo-600 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-indigo-100 transition-all hover:bg-indigo-50">
                                {displayValue}
                              </span>
                            );
                          }

                          // Handle real objects (like Competitors with sub-fields)
                          const entries = Object.entries(item).filter(([_, v]) => v);
                          if (entries.length === 0) return null;

                          // Check if this is an "indexed string" object (like {0: 'M', 1: 'O', ...})
                          const isIndexedString = entries.every(([k]) => !isNaN(k)) &&
                            entries.every(([_, v]) => typeof v === 'string' && v.length === 1);

                          if (isIndexedString) {
                            return (
                              <span key={i} className="bg-white text-indigo-600 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-indigo-100">
                                {entries.map(([_, v]) => v).join("")}
                              </span>
                            );
                          }

                          // Ultra-Compact Object Display
                          return (
                            <div key={i} className="px-2 py-1 bg-white border border-gray-100 rounded-lg flex flex-wrap gap-x-3 gap-y-1 items-center hover:border-indigo-200 transition-colors">
                              {entries.map(([k, v]) => (
                                <div key={k} className="flex items-center gap-1.5 border-r border-gray-50 last:border-0 pr-3 last:pr-0">
                                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">
                                    {k.replace(/_/g, " ")}:
                                  </span>
                                  <span className="text-[10px] font-bold text-gray-700">
                                    {v.toString().match(/^https?:\/\//) || v.toString().startsWith('www.') ? (
                                      <a
                                        href={v.toString().startsWith('www.') ? `https://${v}` : v}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-500 hover:underline flex items-center gap-0.5"
                                      >
                                        Link
                                        <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                      </a>
                                    ) : (
                                      v.toString()
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    ) : value.toString().match(/^https?:\/\//) || value.toString().startsWith('www.') ? (
                      <a href={value.toString().startsWith('www.') ? `https://${value}` : value} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1 truncate max-w-full">
                        <span className="truncate">{value}</span>
                        <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </a>
                    ) : (
                      <span className="break-words line-clamp-2" title={value.toString()}>{value.toString()}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section: Branch Details */}
      {branches.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-1 h-4 bg-teal-500 rounded-full"></div>
            Configured Branches
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.map((branch, idx) => (
              <div key={branch.id || idx} className="flex flex-col gap-2 p-3 bg-[#F8FAFC] rounded-xl border border-gray-100 transition-colors">
                <span className="text-xs font-bold text-gray-800 line-clamp-1" title={branch.name}>{branch.name}</span>
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-500 uppercase tracking-widest font-semibold">User:</span>
                    <span className="font-bold text-gray-700 truncate max-w-[120px]" title={branch.username}>{branch.username}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-500 uppercase tracking-widest font-semibold">Pwd:</span>
                    <span className="font-bold text-gray-700 truncate max-w-[120px]" title={branch.password}>{branch.password}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section: Social Media Links */}
      {hasSocialMedia && (
        <div className="bg-white p-5 rounded-2xl border border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-1 h-4 bg-pink-500 rounded-full"></div>
            Social Media & Digital Presence
          </h3>
          <div className="flex flex-wrap gap-4">
            {managedSocials.map(([platform, data]) => {
              const url = getSocialUrl(platform, data.handle);
              return url ? (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-gray-100 hover:border-pink-200 transition-all hover:scale-[1.02] group"
                >
                  <SocialIcon platform={platform} />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{platform}</span>
                    <span className="text-xs font-bold text-gray-700 group-hover:text-pink-600">{data.handle}</span>
                  </div>
                </a>
              ) : null;
            })}
            {managedOthers.map((item, i) => {
              if (!item?.link) return null;
              return (
                <a
                  key={i}
                  href={item.link.startsWith('http') ? item.link : `https://${item.link}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-gray-100 hover:border-pink-200 transition-all hover:scale-[1.02] group"
                >
                  <FaGlobe className="text-xl text-gray-500" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{item.name || 'Website'}</span>
                    <span className="text-xs font-bold text-gray-700 group-hover:text-pink-600 truncate max-w-[150px]">{item.link}</span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 4: Work History Table */}
      <div className="bg-white rounded-2xl border border-gray-100 ">
        <div className="p-5 border-b border-gray-100 bg-[#F8FAFC]">
          <h3 className="text-sm font-bold text-gray-800">Monthly Performance & Target Metrics</h3>
          <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-tighter font-semibold">Complete project timeline and work history</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <th className="px-6 py-4">Month</th>
                <th className="px-4 py-4 text-center">Reels</th>
                <th className="px-4 py-4 text-center">Posters</th>
                <th className="px-4 py-4 text-center">Motion</th>
                <th className="px-4 py-4 text-center">Shoot</th>
                <th className="px-4 py-4 text-center">Graphics</th>
                <th className="px-6 py-4 text-right">Other Tasks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentProject?.workDetails?.map((wd) => (
                <tr key={wd._id} className={`hover:bg-gray-50/50 transition-colors ${wd.month === selectedMonth ? 'bg-blue-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-900 whitespace-nowrap uppercase tracking-wider">
                        {new Date(wd.month + "-01").toLocaleDateString("en-US", { month: "long" })}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 tabular-nums">{wd.year}</span>
                    </div>
                  </td>
                  {[wd.reels, wd.poster, wd.motionPoster, wd.shooting, wd.motionGraphics].map((metric, idx) => {
                    // 'count' represents the remaining items in the backend, so used = total - count
                    const total = metric?.total || 0;
                    const completed = Math.max(0, total - (metric?.count || 0));
                    return (
                      <td key={idx} className="px-4 py-4">
                        <div className="flex flex-col items-center">
                          <span className="text-[11px] font-bold text-gray-800 tabular-nums">{completed}/{total}</span>
                          <div className="w-10 h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden border border-gray-50">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${completed >= total && total > 0 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                              style={{ width: `${Math.min(100, (completed / (total || 1)) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {wd.other && wd.other.length > 0 ? (
                        wd.other.map((o, i) => {
                          const oTotal = o?.total || 0;
                          const oCompleted = Math.max(0, oTotal - (o?.count || 0));
                          return (
                            <span key={i} className="text-[9px] font-bold text-gray-600 bg-gray-100 border border-gray-200 px-2 py-1 rounded-lg leading-none whitespace-nowrap">
                              {o.name}: {oCompleted}/{oTotal}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-[10px] text-gray-300">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
