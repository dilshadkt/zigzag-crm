import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, Star, ArrowRight, Zap, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getLeaderboard } from "../../api/service";

const DashboardRanking = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [type, setType] = useState("weekly");

    useEffect(() => {
        fetchData();
    }, [type]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getLeaderboard(type);
            if (res.success) {
                setData(res.leaderboard);
            }
        } catch (err) {
            console.error("Failed to load dashboard ranking", err);
        } finally {
            setLoading(false);
        }
    };

    const getRankStyles = (index) => {
        switch (index) {
            case 0: return {
                bg: "bg-gradient-to-br from-yellow-50 to-orange-50",
                border: "border-yellow-200/50",
                text: "text-yellow-700",
                icon: <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
            };
            case 1: return {
                bg: "bg-gradient-to-br from-slate-50 to-blue-50",
                border: "border-slate-200/50",
                text: "text-slate-700",
                icon: <Medal className="w-4 h-4 text-slate-500" />
            };
            case 2: return {
                bg: "bg-gradient-to-br from-orange-50 to-red-50",
                border: "border-orange-200/50",
                text: "text-orange-700",
                icon: <Award className="w-4 h-4 text-orange-500" />
            };
            default: return {
                bg: "bg-gray-50/50",
                border: "border-gray-100",
                text: "text-gray-500",
                icon: null
            };
        }
    };

    if (loading && data.length === 0) {
        return (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm h-full animate-pulse">
                <div className="h-6 w-32 bg-gray-100 rounded-lg mb-6"></div>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-16 bg-gray-50 rounded-2xl w-full"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2rem] p-5 border border-gray-100 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-xl">
                        <Trophy className="w-5 h-5 text-[#3F8CFF]" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-[#0A1629] uppercase tracking-tight">Top Performers</h3>
                        <p className="text-[10px] text-[#7D8592] font-bold uppercase tracking-widest leading-none mt-1">Real-time Ranking</p>
                    </div>
                </div>

                <div className="flex gap-1 p-1 bg-gray-50 rounded-lg">
                    {["weekly", "monthly"].map((t) => (
                        <button
                            key={t}
                            onClick={() => setType(t)}
                            className={`px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all ${type === t ? "bg-[#3F8CFF] text-white shadow-sm" : "text-[#7D8592] hover:bg-white"
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1 scrollbar-hide">
                {data.slice(0, 10).map((item, index) => {
                    const styles = getRankStyles(index);
                    return (
                        <motion.div
                            key={item._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => navigate(`/employees/${item.user?._id}?tab=Performance`)}
                            className={`group flex items-center gap-2 p-2.5 rounded-2xl border transition-all cursor-pointer hover:bg-slate-50/80 ${styles.bg} ${styles.border}`}
                        >
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${styles.text} bg-white/80 border border-white/50`}>
                                {index + 1}
                            </div>

                            <div className="relative">
                                <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-white">
                                    <img
                                        src={item.user?.profileImage || "/default-avatar.png"}
                                        alt={item.user?.firstName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {index < 3 && (
                                    <div className="absolute -top-1.5 -right-1.5 p-0.5 bg-white rounded-full shadow-sm">
                                        {styles.icon}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-black text-[#0A1629] truncate group-hover:text-[#3F8CFF] transition-colors">
                                    {item.user?.firstName} {item.user?.lastName}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <div className="flex-1 h-1 bg-gray-200/50 rounded-full overflow-hidden max-w-[60px]">
                                        <div
                                            className={`h-full rounded-full ${index === 0 ? 'bg-yellow-400' : 'bg-[#3F8CFF]'}`}
                                            style={{ width: `${item.totalScore}%` }}
                                        />
                                    </div>
                                    <span className="text-[9px] font-black text-[#7D8592] uppercase">{item.user?.position}</span>
                                </div>
                            </div>

                            <div className="text-right flex flex-col items-end">
                                <div className="flex items-center gap-1">
                                    <Zap className="w-3 h-3 text-blue-400 fill-blue-400" />
                                    <span className="text-xs font-black text-[#0A1629]">{item.totalScore}</span>
                                </div>
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Points</span>
                            </div>
                        </motion.div>
                    );
                })}

                {data.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 opacity-50">
                        <TrendingUp className="w-8 h-8 text-gray-300 mb-2" />
                        <p className="text-[10px] font-bold text-gray-400 uppercase">No rankings available</p>
                    </div>
                )}
            </div>

            <button
                onClick={() => navigate('/leaderboard')}
                className="mt-4 w-full py-2.5 bg-gray-50 hover:bg-[#3F8CFF] hover:text-white rounded-xl text-[10px] font-black text-[#7D8592] uppercase tracking-widest transition-all flex items-center justify-center gap-2 group"
            >
                View Full Leaderboard
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    );
};

export default DashboardRanking;
