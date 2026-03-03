import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    MapPin,
    GraduationCap,
    Clock,
    Heart,
    Briefcase,
    CheckCircle2,
    X,
    Award,
    Sparkles,
    SlidersHorizontal,
    Target,
    BookOpen
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import SEO from './components/SEO';
import { Input } from './components/ui/input';
import { Badge } from './components/ui/badge';
import { PublicLayout } from './components/Layout';
import { toast } from 'sonner';
import axios from 'axios';
import { useStore } from './store';
import { Link, useNavigate } from 'react-router-dom';
import { ScholarshipCardSkeleton } from './components/ScholarshipSkeletons';

// Types
interface Scholarship {
    _id: string;
    title: string;
    country: string;
    deadline: string;
    degreeLevel: string;
    fundingType: string;
    minCgpa: number;
    minIelts: number;
    description: string;
    exampleSopUrl?: string;
    baseFee: number;
    universityName?: string;
    imageUrl?: string;
    scholarshipType?: string;
    expertApplicationFee?: number;
    richTextDescription?: string;
}

export function Scholarships() {
    const { currentUser } = useStore();
    const navigate = useNavigate();
    const [scholarships, setScholarships] = useState<Scholarship[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Smart Match State
    const [showSmartMatch, setShowSmartMatch] = useState(true);
    const [cgpa, setCgpa] = useState('');
    const [ielts, setIelts] = useState('');
    const [isMatched, setIsMatched] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('All');
    const [savedScholarships, setSavedScholarships] = useState<string[]>([]); // Array of IDs

    // Modal State for Intake
    const [intakeModalOpen, setIntakeModalOpen] = useState(false);
    const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
    const [intakeMajor, setIntakeMajor] = useState('');
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    useEffect(() => {
        fetchScholarships();
    }, []);

    const fetchScholarships = async () => {
        try {
            // In a real app we would pass token if needed or make it public
            // Assuming public access for reading PUBLISHED scholarships for now, 
            // but if the backend requires auth we need to handle it.
            // Modifying controller to be public for testing, or assume user is logged in.
            const config = {
                headers: { Authorization: `Bearer ${(JSON.parse(localStorage.getItem('pengu_final_v4_user') || '{}')?.token)}` }
            };
            const response = await axios.get('/api/scholarships', config);
            setScholarships(response.data);
        } catch (error) {
            console.error('Error fetching scholarships:', error);
            toast.error('Failed to load scholarships');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSmartMatchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!cgpa) {
            toast.error("Please enter your CGPA");
            return;
        }
        setIsMatched(true);
        setShowSmartMatch(false);
        toast.success("Profile matched! Discover your tailored opportunities.");
    };

    const toggleSave = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (savedScholarships.includes(id)) {
            setSavedScholarships(savedScholarships.filter(sId => sId !== id));
            toast('Removed from saved items');
        } else {
            setSavedScholarships([...savedScholarships, id]);
            toast.success('Scholarship saved to tracking board');
        }
    };

    const openIntakeModal = (scholarship: Scholarship) => {
        if (!currentUser) {
            toast.error("Please log in to hire an expert");
            navigate('/login');
            return;
        }
        setSelectedScholarship(scholarship);
        setIntakeModalOpen(true);
    };

    const submitIntake = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!intakeMajor) {
            toast.error("Please provide your desired major");
            return;
        }

        try {
            const config = {
                headers: { Authorization: `Bearer ${(JSON.parse(localStorage.getItem('pengu_final_v4_user') || '{}')?.token)}` }
            };

            await axios.post(`/api/scholarships/${selectedScholarship?._id}/apply`, {
                cgpa: parseFloat(cgpa || '0'),
                ielts: parseFloat(ielts || '0'),
                major: intakeMajor
            }, config);

            toast.success("Intake sent! An admin will review and provide a custom quote shortly.");
            setIntakeModalOpen(false);
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to submit request';
            // If already applied
            if (message.includes('already submitted')) {
                toast.error("You already have an active request for this scholarship.");
            } else {
                toast.error(message);
            }
        }
    };

    // Filter Logic: Search, Country, and Smart Match (if enabled)
    const filteredScholarships = scholarships.filter(s => {
        const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.country.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCountry = selectedCountry === 'All' || s.country === selectedCountry;

        // Smart Match Filtering
        let matchesProfile = true;
        if (isMatched) {
            const userCgpa = parseFloat(cgpa);
            const userIelts = parseFloat(ielts) || 0;
            if (userCgpa < s.minCgpa) matchesProfile = false;
            if (s.minIelts > 0 && userIelts < s.minIelts) matchesProfile = false;
        }

        return matchesSearch && matchesCountry && matchesProfile;
    });

    const uniqueCountries = ['All', ...Array.from(new Set(scholarships.map(s => s.country)))];

    const getDaysLeft = (dateString: string) => {
        const diffTime = Math.abs(new Date(dateString).getTime() - new Date().getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getStatusColor = (daysLeft: number) => {
        if (daysLeft <= 14) return 'bg-red-100 text-red-700 border-red-200';
        if (daysLeft <= 30) return 'bg-amber-100 text-amber-700 border-amber-200';
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    };

    const DiscoveryHubContent = () => (
        <Card className="p-6 bg-white border border-stone-200 shadow-xl rounded-2xl relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-50 rounded-full blur-3xl group-hover:bg-indigo-100 transition-colors"></div>

            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#3E2723] rounded-xl shadow-lg shadow-stone-200">
                    <Target className="size-5 text-amber-400" />
                </div>
                <div>
                    <h3 className="font-bold text-stone-900 leading-none mb-1">Discovery Hub</h3>
                    <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">Smart Match & Filters</p>
                </div>
            </div>

            <div className="space-y-8 relative z-10">
                {/* Smart Match Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest">Eligibility Match</h4>
                        {isMatched && (
                            <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] animate-pulse">Live Active</Badge>
                        )}
                    </div>

                    {isMatched ? (
                        <div className="space-y-3 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-stone-500">Academic CGPA</span>
                                <span className="font-bold text-[#3E2723] bg-white px-2 py-0.5 rounded border border-stone-200">{cgpa}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-stone-500">IELTS Band</span>
                                <span className="font-bold text-[#3E2723] bg-white px-2 py-0.5 rounded border border-stone-200">{ielts || 'N/A'}</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-[10px] h-8 text-stone-400 hover:text-red-600 hover:bg-red-50 font-bold"
                                onClick={() => { setIsMatched(false); setShowSmartMatch(true); setIsMobileFilterOpen(false); }}
                            >
                                <X className="size-3 mr-1" /> Reset Eligibility Profile
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={(e) => { handleSmartMatchSubmit(e); setIsMobileFilterOpen(false); }} className="space-y-3">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-stone-500 uppercase">Current CGPA</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    required
                                    placeholder="3.80"
                                    className="h-10 text-sm bg-stone-50/50 focus:bg-white transition-colors border-stone-200 rounded-xl"
                                    value={cgpa}
                                    onChange={(e) => setCgpa(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-stone-500 uppercase">IELTS (Optional)</label>
                                <Input
                                    type="number"
                                    step="0.5"
                                    placeholder="7.5"
                                    className="h-10 text-sm bg-stone-50/50 focus:bg-white transition-colors border-stone-200 rounded-xl"
                                    value={ielts}
                                    onChange={(e) => setIelts(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="w-full bg-[#3E2723] hover:bg-stone-800 text-white rounded-xl shadow-lg shadow-stone-200 h-10 text-sm font-bold active:scale-[0.98] transition-all">
                                <Sparkles className="size-4 mr-2 text-amber-400" /> Analyze Eligibility
                            </Button>
                        </form>
                    )}
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent"></div>

                {/* Global Search & Country Section */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Global Search</label>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400 group-focus-within:text-indigo-500 transition-colors" />
                            <Input
                                placeholder="Scholarship name..."
                                className="pl-9 h-10 text-sm bg-stone-50/50 focus:bg-white transition-colors border-stone-200 rounded-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Country Destination</label>
                        <div className="flex flex-wrap gap-2">
                            {uniqueCountries.map(country => (
                                <button
                                    key={country}
                                    onClick={() => { setSelectedCountry(country); setIsMobileFilterOpen(false); }}
                                    className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${selectedCountry === country
                                        ? 'bg-[#5D4037] text-white border-[#5D4037] shadow-md shadow-stone-200'
                                        : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400 hover:text-stone-700'
                                        }`}
                                >
                                    {country}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );

    return (
        <PublicLayout>
            <SEO
                title="Global Scholarships | Pengu"
                description="Discover and match with full-ride, partial, and exclusive global scholarships using Pengu's AI Smart Match algorithm. Study abroad made easy."
                url="https://pengu.work.gd/scholarships"
                keywords="scholarships, study abroad, undergraduate scholarships, PhD funding, AI matching, Pengu smart match"
            />
            <div className="min-h-screen bg-stone-50 pt-24 pb-20">

                {/* Header Unit */}
                <div className="bg-[#3E2723] text-white py-12 md:py-20 -mt-24 mb-8 md:mb-12 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 pattern-dots-md text-white"></div>
                    <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col items-center text-center mt-20">
                        <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-6 py-1.5 px-4 text-sm font-bold tracking-widest uppercase">
                            Pengu Discovery Board
                        </Badge>
                        <h1 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">Find Your Future. We'll Do the Rest.</h1>
                        <p className="text-lg md:text-xl text-stone-300 max-w-2xl mb-8">
                            Discover curated global scholarships and hire our verified experts to handle complex portal
                            submissions and craft winning SOPs.
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4">

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Desktop Sidebar */}
                        <div className="hidden lg:block w-full lg:w-80 shrink-0 space-y-6 order-2 lg:order-1">
                            <DiscoveryHubContent />
                            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                                <Award className="size-5 text-amber-600 shrink-0" />
                                <p className="text-[10px] text-amber-800 font-medium leading-relaxed">
                                    Our AI-driven <b>Smart Match</b> removes the guesswork. Input your scores to instantly see which programs <b>guarantee</b> eligibility.
                                </p>
                            </div>
                        </div>

                        {/* Main Board */}
                        <div className="flex-1 space-y-6 order-1 lg:order-2">
                            {/* Mobile Search & Filter Bar */}
                            <div className="lg:hidden flex flex-col gap-4 mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-1 group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
                                        <Input
                                            placeholder="Search scholarships..."
                                            className="pl-9 h-11 bg-white border-stone-200 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-500/20"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        onClick={() => setIsMobileFilterOpen(true)}
                                        className="h-11 px-4 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 rounded-xl shadow-sm flex items-center gap-2"
                                    >
                                        <SlidersHorizontal className="size-4" />
                                        <span className="font-bold text-xs uppercase tracking-wider">Filters</span>
                                    </Button>
                                </div>
                                {isMatched && (
                                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="size-4 text-emerald-600" />
                                            <span className="text-[11px] font-bold text-emerald-800">Smart Match Active</span>
                                        </div>
                                        <button onClick={() => setIsMatched(false)} className="text-[10px] font-bold text-emerald-600 hover:underline">Reset</button>
                                    </div>
                                )}
                            </div>

                            {/* Main Board */}
                            <div className="flex-1 space-y-6 order-1 lg:order-2">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <h2 className="text-xl md:text-2xl font-bold text-stone-900">
                                        {isMatched ? 'Your High-Probability Matches' : 'All Scholarships'}
                                    </h2>
                                    <span className="text-sm font-medium text-stone-500 bg-white px-3 py-1 rounded-full border border-stone-200 shadow-sm self-start sm:self-auto">
                                        {filteredScholarships.length} Results
                                    </span>
                                </div>

                                {isLoading ? (
                                    <div className="flex flex-col gap-6">
                                        {[...Array(6)].map((_, i) => (
                                            <ScholarshipCardSkeleton key={i} />
                                        ))}
                                    </div>
                                ) : filteredScholarships.length === 0 ? (
                                    <div className="text-center py-20 bg-white rounded-2xl border border-stone-200 border-dashed">
                                        <Search className="size-12 text-stone-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-bold text-stone-900 mb-2">No matches found</h3>
                                        <p className="text-stone-500">Try adjusting your filters or checking back later.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-6">
                                        {filteredScholarships.map((scholarship) => {
                                            const daysLeft = getDaysLeft(scholarship.deadline);
                                            const isSaved = savedScholarships.includes(scholarship._id);
                                            const displayImage = scholarship.imageUrl || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2670&auto=format&fit=crop";
                                            const charCodeSum = scholarship._id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
                                            const discountPct = [40, 50, 60][charCodeSum % 3];
                                            const originalPrice = Math.round((scholarship.expertApplicationFee || 20000) / (1 - discountPct / 100));

                                            return (
                                                <Card key={scholarship._id} className="relative p-0 overflow-hidden border border-stone-100 shadow-md hover:shadow-xl transition-all duration-300 group rounded-3xl bg-white flex flex-col md:flex-row h-auto md:h-64">
                                                    {/* Image Section */}
                                                    <div className="relative w-full md:w-80 shrink-0 overflow-hidden h-48 md:h-full">
                                                        <img
                                                            src={displayImage}
                                                            alt={scholarship.universityName || scholarship.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>

                                                        <div className="absolute top-4 left-4">
                                                            <button
                                                                onClick={(e) => toggleSave(scholarship._id, e)}
                                                                className={`p-2 rounded-full backdrop-blur-md shadow-lg transition-all border ${isSaved
                                                                    ? 'bg-red-500 text-white border-red-400'
                                                                    : 'bg-black/20 text-white/90 hover:bg-black/40 border-white/10'
                                                                    }`}
                                                            >
                                                                <Heart className="size-4" fill={isSaved ? "currentColor" : "none"} />
                                                            </button>
                                                        </div>

                                                        {isMatched && (
                                                            <div className="absolute bottom-4 left-4">
                                                                <Badge className="bg-emerald-500 text-white font-bold border-none shadow-lg px-3 py-1 text-[10px] animate-pulse">
                                                                    Smart Match ✨
                                                                </Badge>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Info Section */}
                                                    <div className="p-6 flex flex-col flex-1 min-w-0">
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                                                            <div>
                                                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">
                                                                    {scholarship.universityName || 'Global Institution'}
                                                                </p>
                                                                <h3 className="text-xl font-bold text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-1">
                                                                    {scholarship.title}
                                                                </h3>
                                                            </div>
                                                            <div className={`px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1.5 w-fit h-fit whitespace-nowrap ${daysLeft <= 14 ? 'bg-red-50 text-red-600 border border-red-100' :
                                                                daysLeft <= 30 ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                                    'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                                }`}>
                                                                <Clock className="size-3" />
                                                                {daysLeft <= 0 ? 'Closed' : `Closes in ${daysLeft}d`}
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap gap-2 mb-6">
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-stone-50 text-stone-500 text-[11px] font-bold border border-stone-100">
                                                                <MapPin className="size-3" /> {scholarship.country}
                                                            </span>
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-stone-50 text-stone-500 text-[11px] font-bold border border-stone-100">
                                                                <GraduationCap className="size-3" /> {Array.isArray(scholarship.degreeLevel) ? scholarship.degreeLevel.join(', ') : scholarship.degreeLevel}
                                                            </span>
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-stone-50 text-stone-500 text-[11px] font-bold border border-stone-100">
                                                                <Briefcase className="size-3" /> {Array.isArray(scholarship.fundingType) ? scholarship.fundingType[0] : (scholarship.scholarshipType && Array.isArray(scholarship.scholarshipType) ? scholarship.scholarshipType[0] : scholarship.fundingType)}
                                                            </span>
                                                        </div>

                                                        <div className="mt-auto flex items-end justify-between gap-4">
                                                            <div className="flex flex-col">
                                                                <div className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-sm mb-1 w-fit">
                                                                    {discountPct}% OFF LIMITED TIME
                                                                </div>
                                                                <div className="flex items-baseline gap-2">
                                                                    <span className="text-lg font-black text-[#3E2723]">৳{(scholarship.expertApplicationFee || 20000).toLocaleString()}</span>
                                                                    <span className="text-xs text-stone-400 line-through font-bold">৳{originalPrice.toLocaleString()}</span>
                                                                </div>
                                                                <p className="text-[9px] text-stone-400 font-bold uppercase tracking-tighter">Full Service Fee</p>
                                                            </div>
                                                            <Button
                                                                onClick={() => navigate(`/scholarships/${scholarship._id}`)}
                                                                className="bg-[#3E2723] hover:bg-stone-800 text-white font-bold px-6 h-10 rounded-xl shadow-lg shadow-stone-200 transition-all active:scale-[0.98] whitespace-nowrap"
                                                            >
                                                                Details & Apply
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Smart Intake Modal */}
                    <AnimatePresence>
                        {intakeModalOpen && selectedScholarship && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                                >
                                    <div className="bg-[#3E2723] p-6 text-white relative">
                                        <button
                                            onClick={() => setIntakeModalOpen(false)}
                                            className="absolute top-4 right-4 p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                                        >
                                            <X className="size-5" />
                                        </button>
                                        <div className="flex items-center gap-2 mb-2 text-amber-400">
                                            <Award className="size-5" />
                                            <span className="font-bold text-sm tracking-wider uppercase">Smart Intake</span>
                                        </div>
                                        <h2 className="text-2xl font-bold leading-tight">Request an Expert Quote</h2>
                                        <p className="text-stone-300 text-sm mt-2">
                                            For <b>{selectedScholarship.title}</b>
                                        </p>
                                    </div>

                                    <div className="p-6 overflow-y-auto">
                                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800 leading-relaxed">
                                            Every application is unique. Fill out these quick details so our team can assess the
                                            workload (SOPs, LORs, Portal complexity) and provide you with a custom, fair quote. No upfront payment required.
                                        </div>

                                        <form id="intakeForm" onSubmit={submitIntake} className="space-y-4">
                                            {/* Read Only Stats from Smart Match if available */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-stone-700">CGPA</label>
                                                    <Input
                                                        required
                                                        type="number"
                                                        step="0.01"
                                                        value={cgpa}
                                                        onChange={(e) => setCgpa(e.target.value)}
                                                        placeholder="e.g. 3.5"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-bold text-stone-700">IELTS Band</label>
                                                    <Input
                                                        type="number"
                                                        step="0.5"
                                                        value={ielts}
                                                        onChange={(e) => setIelts(e.target.value)}
                                                        placeholder="e.g. 7.0"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-stone-700">Desired Major / Field of Study *</label>
                                                <Input
                                                    required
                                                    value={intakeMajor}
                                                    onChange={(e) => setIntakeMajor(e.target.value)}
                                                    placeholder="e.g. Computer Science (MSc)"
                                                />
                                            </div>

                                            <div className="pt-4 border-t border-stone-100 mt-6 flex justify-end gap-3">
                                                <Button type="button" variant="ghost" onClick={() => setIntakeModalOpen(false)}>
                                                    Cancel
                                                </Button>
                                                <Button type="submit" form="intakeForm" className="bg-[#3E2723] hover:bg-[#2D1B17] text-white">
                                                    Submit Intake & Get Quote
                                                </Button>
                                            </div>
                                        </form>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                </div>

                {/* Mobile Filter Drawer */}
                <AnimatePresence>
                    {isMobileFilterOpen && (
                        <div className="fixed inset-0 z-[60] lg:hidden">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsMobileFilterOpen(false)}
                                className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-stone-50 shadow-2xl flex flex-col"
                            >
                                <div className="p-6 bg-[#3E2723] text-white flex items-center justify-between shrink-0">
                                    <div>
                                        <h3 className="font-bold text-lg">Discovery & Filters</h3>
                                        <p className="text-[10px] text-amber-400 font-black uppercase tracking-widest">Refine your search</p>
                                    </div>
                                    <button
                                        onClick={() => setIsMobileFilterOpen(false)}
                                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                                    >
                                        <X className="size-5" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    <DiscoveryHubContent />
                                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                                        <Award className="size-5 text-amber-600 shrink-0" />
                                        <p className="text-[10px] text-amber-800 font-medium leading-relaxed">
                                            Our AI-driven <b>Smart Match</b> removes the guesswork. Input your scores to instantly see which programs <b>guarantee</b> eligibility.
                                        </p>
                                    </div>
                                </div>
                                <div className="p-6 bg-white border-t border-stone-200 shrink-0">
                                    <Button
                                        onClick={() => setIsMobileFilterOpen(false)}
                                        className="w-full bg-[#3E2723] hover:bg-stone-800 text-white rounded-xl h-12 font-bold shadow-lg"
                                    >
                                        Apply Filters
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </PublicLayout>
    );
}
