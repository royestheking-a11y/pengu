import React from 'react';
import { PublicLayout } from './components/Layout';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Sparkles,
    Trophy,
    Gamepad2,
    Play,
    Coins,
    ArrowRightLeft,
    Loader2,
    TrendingUp,
    User as UserIcon,
    Medal,
    Info
} from 'lucide-react';
import SEO from './components/SEO';
import { useStore } from './store';
import api from '../lib/api';
import { toast } from 'sonner';

const GAMES = [
    {
        id: 'pengu-3d',
        title: "Pengu's 3D Avalanche",
        description: "Experience the thrill of the mountain in this high-fidelity 3D runner with real-time reflections!",
        image: "/assets/game/pengu_run.png",
        path: "/games/pengu-3d",
        tags: ["3D", "Premium", "Action"],
        difficulty: "Medium"
    }
];

export default function GameZone() {
    const { currentUser, isInitialized, refreshUser } = useStore();
    const [leaderboard, setLeaderboard] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [converting, setConverting] = React.useState(false);

    const fetchLeaderboard = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('pengu_final_v4_user') || '{}')?.token;
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const { data } = await api.get('/games/leaderboard/pengu-3d', config);
            console.log("Leaderboard data received:", data); // Debug logging
            setLeaderboard(data);
        } catch (error) {
            console.error("Failed to fetch leaderboard", error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (isInitialized) {
            fetchLeaderboard();
        }
    }, [isInitialized]);

    const handleConvert = async () => {
        if (!currentUser?.wallet?.coins || currentUser.wallet.coins < 1000) {
            toast.error("You need at least 1,000 coins to convert!");
            return;
        }

        setConverting(true);
        try {
            const { data } = await api.post('/auth/convert-coins');
            toast.success(data.message);
            // Refresh user data immediately for full sync
            await refreshUser();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Conversion failed");
        } finally {
            setConverting(false);
        }
    };

    return (
        <PublicLayout>
            <SEO
                title="Game Zone | Pengu Arena"
                description="Play premium games, earn coins, and fund your education. 1000 Coins = 100 BDT."
                url="https://pengui.tech/games"
            />

            <div className="max-w-7xl mx-auto space-y-12 pb-20 pt-24 md:pt-32 px-4">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                    <div className="flex-1 space-y-4 text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-700 text-[10px] font-black uppercase tracking-[0.2em] border border-amber-200"
                        >
                            <Sparkles className="size-3" /> Play-to-Earn Economics
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-7xl font-black text-[#3E2723] tracking-tighter italic uppercase leading-tight"
                        >
                            Pengu <span className="text-amber-500">Arena</span>
                        </motion.h1>
                        <p className="text-stone-500 max-w-xl text-lg md:mx-auto lg:mx-0 leading-relaxed">
                            The ultimate student playground. Play premium games to earn **Pengu Coins**,
                            convert them to BDT, and fund your service requests for **free**.
                        </p>
                    </div>

                    {/* Stats/Wallet Section */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full lg:w-auto flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        {currentUser ? (
                            <>
                                <div className="bg-[#3E2723] text-white rounded-[1.5rem] p-6 shadow-xl relative overflow-hidden group min-w-[260px] border border-white/5">
                                    <div className="absolute -top-12 -right-12 p-4 opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                                        <Coins className="size-32" />
                                    </div>
                                    <div className="relative z-10">
                                        <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Your Treasury</p>
                                        <div className="space-y-5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 text-white">
                                                    <div className="size-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg">
                                                        <Coins className="size-6 text-[#3E2723]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-2xl font-black font-['Outfit'] leading-none h-6">{currentUser.wallet?.coins || 0}</p>
                                                        <p className="text-[8px] font-black text-white/40 uppercase tracking-widest leading-none mt-1">
                                                            Coins (৳{((currentUser.wallet?.coins || 0) * 0.1).toFixed(1)})
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-black font-['Outfit'] text-amber-500 leading-none h-6">৳{currentUser.balance || 0}</p>
                                                    <p className="text-[8px] font-black text-white/40 uppercase tracking-widest leading-none mt-1">Cash Balance</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleConvert}
                                                disabled={converting || (currentUser.wallet?.coins || 0) < 1000}
                                                className="w-full py-3 rounded-xl bg-white text-[#3E2723] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-amber-400 hover:text-white transition-all active:scale-95 disabled:opacity-20 shadow-lg"
                                            >
                                                {converting ? <Loader2 className="size-3 animate-spin" /> : <ArrowRightLeft className="size-3" />}
                                                Convert 1k → ৳100
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white border border-stone-100 rounded-[1.5rem] p-6 shadow-sm flex flex-col justify-center min-w-[200px]">
                                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em] mb-3">Tournament</p>
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-50">
                                            <Trophy className="size-6" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-stone-900 leading-none mb-1">
                                                {leaderboard?.userRank ? `#${leaderboard.userRank}` : '--'}
                                            </p>
                                            <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Global Rank</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="bg-white border border-stone-100 rounded-[1.5rem] p-8 text-center max-w-sm shadow-lg">
                                <div className="size-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4 text-amber-500">
                                    <Medal className="size-7" />
                                </div>
                                <h4 className="text-lg font-black text-[#3E2723] uppercase mb-2 tracking-tight">Earn Rewards</h4>
                                <p className="text-stone-500 text-xs font-medium mb-6 leading-relaxed">
                                    Sign in to track your scores and earn BDT rewards!
                                </p>
                                <Link to="/login" className="flex items-center justify-center gap-2 px-6 py-3 bg-[#3E2723] text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md">
                                    Join the Arena <Play className="size-3 fill-current" />
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                    {/* Game Cards Section */}
                    <div className="xl:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-[#3E2723] uppercase tracking-wider flex items-center gap-3">
                                <Gamepad2 className="size-6 text-amber-500" /> Active Missions
                            </h3>
                            <div className="hidden md:flex items-center gap-2 text-stone-400 text-xs font-bold uppercase tracking-widest">
                                <span className="size-2 rounded-full bg-green-500 animate-pulse" /> Live Servers
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                            {GAMES.map((game, idx) => (
                                <motion.div
                                    key={game.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="group relative bg-white rounded-[2rem] border border-stone-100 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-500 flex flex-col md:flex-row h-full min-h-[300px]"
                                >
                                    {/* Card Image */}
                                    <div className="w-full md:w-[40%] overflow-hidden relative min-h-[250px] md:min-h-full">
                                        <img
                                            src={game.image}
                                            alt={game.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                        <div className="absolute bottom-6 left-6">
                                            <div className="flex gap-2 mb-2">
                                                {game.tags.map(tag => (
                                                    <span key={tag} className="px-2 py-0.5 rounded-lg bg-white/20 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-wider border border-white/20">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tight leading-none">{game.title}</h2>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-8 flex-1 flex flex-col justify-between bg-white relative">
                                        <div className="space-y-4">
                                            <p className="text-stone-500 text-sm italic mb-4">
                                                "{game.description}"
                                            </p>
                                            <div className="flex flex-wrap items-center gap-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-stone-300 uppercase tracking-[0.2em] mb-1">Level</span>
                                                    <span className="text-xs font-black text-[#3E2723] uppercase tracking-widest flex items-center gap-2">
                                                        <div className="size-2 rounded-full bg-amber-500" />
                                                        {game.difficulty}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-stone-300 uppercase tracking-[0.2em] mb-1">Rewards</span>
                                                    <span className="text-xs font-black text-green-600 uppercase tracking-widest flex items-center gap-1">
                                                        <Coins className="size-3" /> Massive
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6">
                                            <Link to={game.path}>
                                                <button className="w-full py-4 rounded-xl bg-[#3E2723] text-white flex items-center justify-center gap-3 shadow-lg hover:bg-amber-500 hover:scale-[1.02] active:scale-[0.98] transition-all group/btn">
                                                    <span className="font-black uppercase tracking-widest text-base">Enter Arena</span>
                                                    <Play className="size-4 fill-current group-hover/btn:translate-x-1 transition-transform" />
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar / Leaderboard Section */}
                    <div className="space-y-8">
                        <h3 className="text-xl font-black text-[#3E2723] uppercase tracking-wider flex items-center gap-3">
                            <TrendingUp className="size-6 text-blue-500" /> TOP-10 RUNNERS
                        </h3>

                        <div className="bg-white rounded-[2rem] border border-stone-100 shadow-xl p-6 relative overflow-hidden min-h-[450px]">
                            <div className="absolute top-0 right-0 p-6 opacity-[0.03] -rotate-12 translate-x-4 -translate-y-4">
                                <Trophy className="size-32" />
                            </div>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                    <div className="relative">
                                        <Loader2 className="size-10 text-amber-500 animate-spin" />
                                        <Trophy className="size-4 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                    </div>
                                    <p className="text-stone-400 text-[8px] font-black uppercase tracking-[0.3em] animate-pulse">Syncing Rankings...</p>
                                </div>
                            ) : (
                                <div className="space-y-3 relative z-10">
                                    {leaderboard?.topScores?.map((entry: any, i: number) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className={`flex items-center justify-between p-3 rounded-xl transition-all ${entry.userId?._id === currentUser?.id ? 'bg-amber-50 border border-amber-200 shadow-inner' : 'hover:bg-stone-50 border border-transparent'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`size-7 rounded-lg flex items-center justify-center font-black text-[10px] ${i === 0 ? 'bg-amber-400 text-white' :
                                                    i === 1 ? 'bg-stone-300 text-white' :
                                                        i === 2 ? 'bg-orange-300 text-white' :
                                                            'bg-stone-100 text-stone-400'
                                                    }`}>
                                                    {i + 1}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {entry.userId?.avatar ? (
                                                        <img src={entry.userId.avatar} className="size-9 rounded-lg object-cover border border-white shadow-sm" />
                                                    ) : (
                                                        <div className="size-9 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400 border border-white shadow-sm">
                                                            <UserIcon className="size-4" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-xs font-black text-[#3E2723] leading-none mb-1 line-clamp-1">{entry.userId?.name || 'Anonymous'}</p>
                                                        <p className="text-[9px] font-bold text-stone-300 uppercase tracking-widest">{new Date(entry.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-base font-black text-[#3E2723] font-['Outfit'] italic">{entry.score}</p>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {(!leaderboard?.topScores || leaderboard.topScores.length === 0) && (
                                        <div className="text-center py-20 bg-stone-50/50 rounded-3xl border border-dashed border-stone-200">
                                            <p className="text-stone-400 text-sm font-medium italic opacity-70">
                                                The arena is waiting. Be the first to claim your throne!
                                            </p>
                                        </div>
                                    )}

                                    {currentUser && leaderboard?.userRank && leaderboard.userRank > 10 && (
                                        <div className="pt-4 mt-2 border-t border-stone-100">
                                            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg text-white">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-lg bg-white/20 flex items-center justify-center font-black text-xs backdrop-blur-md">
                                                        {leaderboard.userRank}
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black leading-none mb-1 opacity-70">Your Rank</p>
                                                        <p className="text-xs font-black uppercase tracking-widest">Global Arena</p>
                                                    </div>
                                                </div>
                                                <p className="text-lg font-black font-['Outfit'] italic">{leaderboard.userBest}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Economy Info Card */}
                        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-[2rem] p-6 text-white shadow-lg relative overflow-hidden group border border-white/10">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <Info className="size-16" />
                            </div>
                            <h4 className="flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] mb-3">
                                <Sparkles className="size-3" /> Economics
                            </h4>
                            <p className="text-white font-medium text-xs leading-relaxed mb-4">
                                1,000 Coins = **৳100 BDT** credit. Fund your service requests for free!
                            </p>
                            <div className="flex items-center gap-2 bg-black/10 rounded-lg p-2.5 border border-white/10 text-[8px] font-black uppercase tracking-widest">
                                <Coins className="size-3 text-amber-200" />
                                <span>Play • Earn • Study Free</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
