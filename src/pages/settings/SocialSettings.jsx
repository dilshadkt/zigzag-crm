import React, { useState, useEffect } from "react";
import { FiInstagram, FiFacebook, FiSave, FiInfo, FiExternalLink, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { useGetCompany, useUpdateCompany } from "../../api/hooks";
import { toast } from "react-hot-toast";

const SocialSettings = () => {
    const { user } = useAuth();
    const companyId = user?.company;
    const { data: companyData, isLoading } = useGetCompany(companyId);
    const { mutate: updateCompany, isPending } = useUpdateCompany();

    const [facebookPageId, setFacebookPageId] = useState("");
    const [instagramBusinessId, setInstagramBusinessId] = useState("");

    useEffect(() => {
        if (companyData?.company) {
            setFacebookPageId(companyData.company.facebookPageId || "");
            setInstagramBusinessId(companyData.company.instagramBusinessId || "");
        }
    }, [companyData]);

    const handleSave = () => {
        updateCompany({
            companyId,
            data: {
                facebookPageId,
                instagramBusinessId
            }
        }, {
            onSuccess: () => {
                toast.success("Social settings updated successfully!");
            },
            onError: (error) => {
                toast.error(error?.response?.data?.message || "Failed to update settings");
            }
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-6">
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                        <FiInstagram className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Social Media Configuration</h2>
                        <p className="text-slate-500 text-sm font-medium">Link your professional accounts for direct publishing</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Facebook Page ID */}
                    <div className="space-y-4">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Facebook Page ID</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                <FiFacebook className="w-5 h-5" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="1234567890..."
                                value={facebookPageId}
                                onChange={(e) => setFacebookPageId(e.target.value)}
                                className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium px-1 leading-relaxed">
                            Used to identify the linked Instagram Business account. Found in Page Settings &gt; Page Info.
                        </p>
                    </div>

                    {/* Instagram Business ID */}
                    <div className="space-y-4">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Instagram Business ID</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-pink-600">
                                <FiInstagram className="w-5 h-5" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="178414..."
                                value={instagramBusinessId}
                                onChange={(e) => setInstagramBusinessId(e.target.value)}
                                className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 transition-all"
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium px-1 leading-relaxed">
                            The unique ID for your Instagram Professional account.
                        </p>
                    </div>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
                        <FiInfo className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Manual Setup Required</span>
                    </div>
                    <button 
                        onClick={handleSave}
                        disabled={isPending}
                        className="px-8 py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-800 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50 shadow-xl shadow-slate-200"
                    >
                        {isPending ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <FiSave className="w-4 h-4" />
                        )}
                        Save Configuration
                    </button>
                </div>
            </div>

            {/* Help Card */}
            <div className="bg-indigo-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3 max-w-xl">
                        <div className="flex items-center gap-2">
                            <FiCheckCircle className="text-emerald-400 w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Ready for Automation?</span>
                        </div>
                        <h3 className="text-xl font-bold">How to find these IDs?</h3>
                        <p className="text-sm text-indigo-100 font-medium leading-relaxed">
                            The easiest way to get your Instagram Business ID is via the Facebook Graph Explorer or by checking your Meta Business Suite settings. Make sure your Instagram is already converted to a Professional (Business) account.
                        </p>
                    </div>
                    <a 
                        href="https://developers.facebook.com/tools/explorer/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-6 py-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 whitespace-nowrap text-xs font-bold uppercase tracking-widest"
                    >
                        Graph Explorer <FiExternalLink />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default SocialSettings;
