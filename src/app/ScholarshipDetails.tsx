import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import DOMPurify from 'dompurify';
import { toast } from 'sonner';
import { useStore } from './store';
import { PublicLayout } from './components/Layout';
import { ScholarshipDetailSkeleton } from './components/ScholarshipSkeletons';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card } from './components/ui/card';
import SEO from './components/SEO';
import {
    MapPin,
    GraduationCap,
    Clock,
    Briefcase,
    BookOpen,
    ArrowLeft,
    ShieldCheck,
    CheckCircle2,
    X,
    Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ScholarshipDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentUser } = useStore();

    const [scholarship, setScholarship] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Intake Modal State for Escrow
    const [intakeModalOpen, setIntakeModalOpen] = useState(false);
    const [cgpa, setCgpa] = useState('');
    const [ielts, setIelts] = useState('');
    const [intakeMajor, setIntakeMajor] = useState('');

    useEffect(() => {
        const fetchScholarship = async () => {
            try {
                // Fetch public scholarship data
                const response = await api.get(`/scholarships/${id}`);
                setScholarship(response.data);
            } catch (error) {
                toast.error('Failed to load scholarship details');
                navigate('/scholarships');
            } finally {
                setIsLoading(false);
            }
        };
        fetchScholarship();
    }, [id, navigate]);

    const getDaysLeft = (dateString: string) => {
        const diffTime = Math.abs(new Date(dateString).getTime() - new Date().getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const submitIntake = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) {
            toast.error("Please log in to submit a request.");
            navigate('/login');
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${(JSON.parse(localStorage.getItem('pengu_final_v4_user') || '{}')?.token)}` } };
            // Standard order creation. Wait, the backend currently accepts quote requests or direct orders.
            // A request for quote is just status: 'SUBMITTED'. Since this is a premium funnel, the fee is known.
            // But we still create a request that bypasses the "Quote Needs Approval" phase, or we just let it go for quote approval automatically.
            await api.post(`/scholarships/${scholarship._id}/apply`, {
                cgpa: parseFloat(cgpa || '0'),
                ielts: parseFloat(ielts || '0'),
                major: intakeMajor
            }, config);

            toast.success("Request Submitted! Our experts will verify the fee and escrow contract shortly.");
            setIntakeModalOpen(false);
            navigate('/student/dashboard');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to submit request';
            if (message.includes('already submitted')) {
                toast.error("You already have an active request for this scholarship.");
            } else {
                toast.error(message);
            }
        }
    };

    if (isLoading) {
        return (
            <PublicLayout>
                <ScholarshipDetailSkeleton />
            </PublicLayout>
        );
    }

    if (!scholarship) return null;

    const daysLeft = getDaysLeft(scholarship.deadline);
    const displayImage = scholarship.imageUrl || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2670&auto=format&fit=crop";

    // Clean rich text from DB
    const cleanHTML = DOMPurify.sanitize(scholarship.richTextDescription || `<p>${scholarship.description}</p>`);

    // Automated Discount Logic
    const getDiscountData = (fee: number, id: string) => {
        // Deterministic discount percentage based on ID
        const charCodeSum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const percentages = [40, 50, 60];
        const discountPct = percentages[charCodeSum % percentages.length];
        const originalPrice = Math.round(fee / (1 - discountPct / 100));
        return { discountPct, originalPrice };
    };

    const fee = scholarship.expertApplicationFee || 20000;
    const { discountPct, originalPrice } = getDiscountData(fee, scholarship._id);

    return (
        <PublicLayout>
            <SEO
                title={`${scholarship.title} in ${scholarship.country} | Pengui.tech`}
                description={`Apply for the ${scholarship.title} at ${scholarship.university}. Funding type: ${scholarship.fundingType}. Deadline: ${new Date(scholarship.deadline).toLocaleDateString()}.`}
                url={`https://pengui.tech/scholarships/${scholarship._id}`}
                keywords={`${scholarship.country} scholarship, ${scholarship.degreeLevel.join(', ')} scholarship, ${scholarship.university}, study abroad`}
            />
            <div className="min-h-screen bg-stone-50 pd-20 md:pd-24">

                {/* Hero Section */}
                <div className="relative w-full h-[40vh] md:h-[55vh] bg-stone-900 mt-16 md:mt-20 overflow-hidden">
                    <img
                        src={displayImage}
                        alt={scholarship.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-50 transition-opacity duration-700"
                        style={{ objectPosition: 'center 20%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                    <div className="absolute inset-0 flex flex-col justify-end pb-12 px-6 md:px-12 max-w-7xl mx-auto">
                        <button
                            onClick={() => navigate('/scholarships')}
                            className="text-stone-300 hover:text-white flex items-center gap-2 font-medium mb-6 w-fit transition-colors bg-black/30 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 text-sm"
                        >
                            <ArrowLeft className="size-4" /> Back to Discovery Board
                        </button>

                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="bg-amber-500 text-amber-950 font-bold px-3 py-1 rounded-full text-[11px] uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                                <Clock className="size-3.5" />
                                {daysLeft <= 0 ? 'Closed' : `Closes in ${daysLeft} Days`}
                            </span>
                            <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold px-3 py-1 rounded-full text-[11px] uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                                <Briefcase className="size-3.5" /> {Array.isArray(scholarship.fundingType) ? scholarship.fundingType[0] : (scholarship.scholarshipType && Array.isArray(scholarship.scholarshipType) ? scholarship.scholarshipType[0] : scholarship.fundingType)}
                            </span>
                        </div>

                        <p className="text-amber-400 font-bold text-sm md:text-base uppercase tracking-widest mb-2 drop-shadow-md">
                            {scholarship.universityName || 'Global Institution'}
                        </p>
                        <h1 className="text-xl md:text-3xl lg:text-4xl font-black text-white leading-tight max-w-2xl drop-shadow-2xl">
                            {scholarship.title}
                        </h1>
                    </div>
                </div>

                {/* Content & Sticky Checkout */}
                <div className="max-w-7xl mx-auto px-4 md:px-12 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-3 gap-12 relative">

                    {/* Left Column: Information */}
                    <div className="lg:col-span-2 space-y-10">

                        {/* Summary Highlights */}
                        <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm flex flex-wrap gap-x-12 gap-y-6">
                            <div>
                                <p className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-1">Country</p>
                                <p className="text-lg font-bold text-stone-900 flex items-center gap-2">
                                    <MapPin className="size-5 text-amber-500" /> {scholarship.country}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-1">Degree Level</p>
                                <p className="text-lg font-bold text-stone-900 flex items-center gap-2">
                                    <GraduationCap className="size-5 text-amber-500" /> {Array.isArray(scholarship.degreeLevel) ? scholarship.degreeLevel.join(', ') : scholarship.degreeLevel}
                                </p>
                            </div>
                            {scholarship.exampleSopUrl && (
                                <div>
                                    <p className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-1">Resources</p>
                                    <p className="text-lg font-bold text-stone-900 flex items-center gap-2">
                                        <BookOpen className="size-5 text-amber-500" /> Winning SOP Available
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Rich Text Body */}
                        <div className="bg-white rounded-2xl p-6 md:p-10 border border-stone-200 shadow-sm overflow-hidden">
                            <h2 className="text-xl md:text-2xl font-bold text-[#3E2723] mb-6 pb-4 border-b border-stone-100">Program Details</h2>
                            <div
                                className="prose prose-stone prose-sm md:prose-base max-w-none prose-headings:font-bold prose-a:text-[#5D4037] prose-img:rounded-xl overflow-x-hidden break-words"
                                dangerouslySetInnerHTML={{ __html: cleanHTML }}
                            />
                        </div>
                    </div>

                    {/* Right Column: Sticky Checkout */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32 space-y-6">

                            <Card className="p-8 border border-stone-200 shadow-xl bg-white rounded-3xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                                    Premium Service
                                </div>

                                <h3 className="text-xl font-bold text-[#3E2723] mb-2 mt-4">Professional Support</h3>
                                <p className="text-stone-500 text-sm mb-6 leading-relaxed">
                                    Expert handling of SOPs, CV revamp, and portal submission for this scholarship.
                                </p>

                                <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 mb-6 relative">
                                    <div className="absolute -top-3 right-4">
                                        <div className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded shadow-lg animate-pulse whitespace-nowrap">
                                            {discountPct}% OFF LIMITED TIME
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-stone-500 text-sm font-medium">Service Fee</span>
                                        <div className="text-right">
                                            <span className="block text-xs text-stone-400 line-through font-bold">৳{originalPrice.toLocaleString()}</span>
                                            <span className="block text-2xl font-black text-[#3E2723]">৳{fee.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-amber-700 font-bold mt-2 flex items-center gap-1">
                                        <ShieldCheck className="size-3" /> Secure Escrow Payment
                                    </p>
                                </div>

                                <div className="space-y-3 mb-8">
                                    {[
                                        "Winning Statement of Purpose (SOP)",
                                        "Professional CV Revamp",
                                        "Portal Management"
                                    ].map((feature, i) => (
                                        <div key={i} className="flex items-center gap-2.5 text-sm text-stone-600">
                                            <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    onClick={() => setIntakeModalOpen(true)}
                                    className="w-full h-12 text-sm font-bold bg-[#3E2723] hover:bg-[#2D1B17] text-white rounded-xl shadow-lg transition-all active:scale-[0.98]"
                                >
                                    Apply Now
                                </Button>
                                <p className="text-center text-xs text-stone-400 mt-4 font-medium">
                                    You will review and approve everything before submission.
                                </p>
                            </Card>

                            <div className="bg-white p-6 rounded-2xl border border-stone-200 flex items-start gap-4 shadow-sm">
                                <div className="bg-blue-50 p-3 rounded-full shrink-0">
                                    <ShieldCheck className="size-6 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-stone-900 text-sm">Escrow Secure</h4>
                                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                                        Your payment is held safely until the application is finalized and approved by you. Quality guaranteed.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Smart Intake Modal */}
                <AnimatePresence>
                    {intakeModalOpen && (
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
                                    <h2 className="text-2xl font-bold leading-tight">Fast-Track Assessment</h2>
                                    <p className="text-stone-300 text-sm mt-2">
                                        For <b>{scholarship.title}</b>
                                    </p>
                                </div>

                                <div className="p-6 overflow-y-auto">
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800 leading-relaxed font-medium">
                                        Supply these details to lock in your expert rate and initiate the Escrow process.
                                    </div>

                                    <form id="intakeForm" onSubmit={submitIntake} className="space-y-5">
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
                                                    className="h-11 font-medium bg-stone-50"
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
                                                    className="h-11 font-medium bg-stone-50"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-stone-700">Desired Major / Field of Study *</label>
                                            <Input
                                                required
                                                value={intakeMajor}
                                                onChange={(e) => setIntakeMajor(e.target.value)}
                                                placeholder="e.g. Data Science (MSc)"
                                                className="h-11 font-medium bg-stone-50"
                                            />
                                        </div>

                                        <div className="pt-6 border-t border-stone-100 mt-6 flex justify-end gap-3">
                                            <Button type="button" variant="ghost" onClick={() => setIntakeModalOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" form="intakeForm" className="bg-[#3E2723] hover:bg-[#2D1B17] text-white h-11 px-8 font-bold">
                                                Confirm & Initiate Escrow
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </PublicLayout>
    );
}
