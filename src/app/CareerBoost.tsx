import React, { useState } from 'react';
import {
    Rocket,
    FileText,
    Search,
    Target,
    Zap,
    Mail,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Copy,
    Download,
    Terminal,
    ArrowRight,
    ShieldCheck,
    Sparkles,
    BarChart3,
    RefreshCw,
    Briefcase,
    X,
    FileJson
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from './components/Layout';
import { Card } from './components/ui/card';
import { toast } from 'sonner';
import api from '../lib/api';

const CareerBoost = () => {
    const [cvText, setCvText] = useState('');
    const [jdText, setJdText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('match'); // 'match', 'optimize', 'email'

    // Email states
    const [emailTone, setEmailTone] = useState('Confident');
    const [emailLength, setEmailLength] = useState('Medium');
    const [generatedEmail, setGeneratedEmail] = useState('');
    const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
    const [optimizationImprovements, setOptimizationImprovements] = useState<any[]>([]);

    const handleAnalyze = async () => {
        if (!cvText || !jdText) {
            toast.error("Please provide both your CV and a Job Description");
            return;
        }
        setIsAnalyzing(true);
        try {
            const response = await api.post('/career-acceleration/analyze', { cvText, jdText });
            const data = response.data;
            setResult(data);
            toast.success("Intelligence Analysis Complete!");
        } catch (error) {
            console.error("Analysis Error:", error);
            toast.error("Failed to analyze matching data");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleOptimize = async () => {
        const toastId = toast.loading("Optimizing your CV for maximum impact...");
        try {
            const response = await api.post('/career-acceleration/optimize', { cvText });
            const data = response.data;
            // Groq may return `optimized` as an object — always convert to string
            const optimizedText = typeof data.optimized === 'string'
                ? data.optimized
                : JSON.stringify(data.optimized, null, 2);
            setCvText(optimizedText);
            setOptimizationImprovements(data.improvements || []);
            toast.success("CV Optimized with achievement-driven metrics!", { id: toastId });
        } catch (error) {
            console.error("Optimization Error:", error);
            toast.error("Failed to optimize CV", { id: toastId });
        }
    };

    const handleGenerateEmail = async () => {
        if (!cvText || !jdText) {
            toast.error("Analysis data required for high-quality email generation.");
            return;
        }
        setIsGeneratingEmail(true);
        const toastId = toast.loading("Generating your personalized application email...");
        try {
            const response = await api.post('/career-acceleration/generate-email', { cvText, jdText, tone: emailTone, length: emailLength });
            const data = response.data;
            setGeneratedEmail(data.email);
            toast.success("AI Application Email Generated!", { id: toastId });
        } catch (error) {
            console.error("Email Generation Error:", error);
            toast.error("Failed to generate application email", { id: toastId });
        } finally {
            setIsGeneratingEmail(false);
        }
    };

    const handleSaveTemplate = async () => {
        if (!result) return;

        const toastId = toast.loading("Saving to Career Vault...");
        try {
            // Assuming 'api' is a global or imported object with a 'post' method.
            // If 'api' is not defined, this line will cause a runtime error.
            // For a typical React setup, you might replace 'api.post' with a fetch call:
            // await fetch('/api/career-templates', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         overallScore: result.overallScore,
            //         shortlistChance: result.shortlistChance,
            //         riskAreas: result.riskAreas,
            //         suggestions: result.suggestions,
            //         date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            //     })
            // });
            await api.post('/career-templates', {
                overallScore: result.overallScore,
                shortlistChance: result.shortlistChance,
                riskAreas: result.riskAreas,
                suggestions: result.suggestions,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            });
            toast.success("Successfully saved to your Career Vault!", { id: toastId });
        } catch (error) {
            console.error("Failed to save template", error);
            toast.error("Failed to save template. Please try again.", { id: toastId });
        }
    };

    const downloadOptimizationPDF = () => {
        if (optimizationImprovements.length === 0) {
            toast.error("Please run optimization first to generate a report.");
            return;
        }

        const toastId = toast.loading("Preparing Premium Optimization Report...");

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Smart Optimization Report - Pengu AI</title>
                <meta charset="UTF-8">
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
                    body { font-family: 'Inter', sans-serif; color: #1c1917; margin: 0; padding: 40px; background: white; }
                    .header { background: #5D4037; color: white; padding: 60px 40px; border-radius: 24px; margin-bottom: 40px; }
                    .logo { font-size: 32px; margin-bottom: 20px; }
                    .title { font-size: 28px; font-weight: 800; margin: 0; }
                    .subtitle { color: rgba(255,255,255,0.7); font-size: 14px; margin-top: 8px; }
                    .section { margin-bottom: 30px; }
                    .section-title { font-size: 12px; font-weight: 900; color: #9ca3af; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; border-bottom: 1px solid #f3f4f6; padding-bottom: 10px; }
                    .improvement-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px; margin-bottom: 20px; page-break-inside: avoid; }
                    .label { font-size: 10px; font-weight: 800; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
                    .label-before { color: #dc2626; }
                    .label-after { color: #16a34a; }
                    .text-before { font-size: 14px; color: #6b7280; font-style: italic; margin-bottom: 16px; padding-left: 12px; border-left: 2px solid #fee2e2; }
                    .text-after { font-size: 15px; color: #111827; font-weight: 600; padding-left: 12px; border-left: 2px solid #dcfce7; }
                    .highlight { background: #fef9c3; font-weight: 700; color: #854d0e; }
                    .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 60px; border-top: 1px solid #f3f4f6; padding-top: 20px; }
                    @media print {
                        body { padding: 0; }
                        .header { border-radius: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">🐧</div>
                    <h1 class="title">Smart Optimization Report</h1>
                    <p class="subtitle">AI-Driven CV Transformation • achievement-based standards</p>
                </div>

                <div class="section">
                    <p class="section-title">Applied Enhancements (${optimizationImprovements.length})</p>
                    ${optimizationImprovements.map((imp, i) => `
                        <div class="improvement-card">
                            <div class="label label-before">Before (Passive)</div>
                            <div class="text-before">"${imp.from}"</div>
                            <div class="label label-after">After (Optimized with Metrics)</div>
                            <div class="text-after">"${imp.to}"</div>
                        </div>
                    `).join('')}
                </div>

                <div class="footer">
                    Generated by Pengu AI Student Suite • ${new Date().toLocaleDateString()}
                </div>

                <script>
                    setTimeout(() => { window.print(); }, 500);
                </script>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            toast.success("Premium Report Ready!", { id: toastId });
        } else {
            toast.error("Pop-up blocked!", { id: toastId });
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 md:px-0">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-[#5D4037] font-bold mb-1">
                            <Rocket className="size-5" />
                            <span className="uppercase tracking-widest text-xs">Premium Student Suite</span>
                        </div>
                        <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Career Acceleration</h1>
                        <p className="text-stone-500 mt-1 text-lg">AI-powered intelligence to turn applications into offers.</p>
                    </div>
                    <div className="flex items-center gap-3 mt-10">
                        <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-full flex items-center gap-2">
                            <ShieldCheck className="size-4 text-amber-600" />
                            <span className="text-sm font-bold text-amber-800">ATS Optimized</span>
                        </div>
                    </div>
                </div>

                {!result ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-12">
                        <Card className="p-6 border-stone-200">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Briefcase className="size-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-stone-900">Step 1: Paste Job Description</h3>
                                    <p className="text-sm text-stone-500">Paste the text from the job posting</p>
                                </div>
                            </div>
                            <textarea
                                value={jdText}
                                onChange={(e) => setJdText(e.target.value)}
                                placeholder="Example: We are looking for a Senior Frontend Developer with 5+ years of experience in React..."
                                className="w-full h-80 p-4 rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-[#5D4037]/20 focus:border-[#5D4037] text-sm resize-none"
                            />
                        </Card>

                        <Card className="p-6 border-stone-200">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="size-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                    <FileText className="size-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-stone-900">Step 2: Paste Your CV Content</h3>
                                    <p className="text-sm text-stone-500">Paste the current text of your CV</p>
                                </div>
                            </div>
                            <textarea
                                value={cvText}
                                onChange={(e) => setCvText(e.target.value)}
                                placeholder="Paste your CV text here for instant ATS & Skill analysis..."
                                className="w-full h-80 p-4 rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-[#5D4037]/20 focus:border-[#5D4037] text-sm resize-none"
                            />
                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                className="w-full mt-6 bg-[#5D4037] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-[#4E342E] transition-all transform active:scale-[0.98] shadow-lg shadow-[#5D4037]/20 disabled:opacity-50"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <RefreshCw className="size-5 animate-spin" />
                                        AI Engine Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="size-5" />
                                        Run Smart Analysis
                                    </>
                                )}
                            </button>
                        </Card>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        {/* Results Dashboard Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="p-6 border-stone-200 bg-gradient-to-br from-white to-stone-50 relative overflow-hidden group">
                                <div className="relative z-10">
                                    <p className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-2">Overall Match Score</p>
                                    <div className="flex flex-col mt-1">
                                        <span className="text-6xl font-black text-[#5D4037]">{result.overallScore}%</span>
                                        <span className="text-green-600 font-bold flex items-center text-sm mt-1">
                                            <TrendingUp className="size-4 mr-1" /> Highly Competitive
                                        </span>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                    <Target className="size-24" />
                                </div>
                            </Card>

                            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Object.entries(result.breakdown).map(([key, value]: [string, any]) => (
                                    <div key={key} className="bg-white p-4 rounded-xl border border-stone-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">{key.replace(/([A-Z])/g, ' $1')}</p>
                                                <p className="text-sm font-black text-stone-800">{value}%</p>
                                            </div>
                                            <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                                <div
                                                    style={{
                                                        width: `${value}%`,
                                                        transition: 'width 1s ease-out'
                                                    }}
                                                    className={`h-full ${value > 80 ? 'bg-green-500' : value > 60 ? 'bg-[#5D4037]' : 'bg-amber-50'}`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Feature Tabs */}
                        <div className="flex border-b border-stone-200 gap-8 overflow-x-auto no-scrollbar">
                            <button
                                onClick={() => setActiveTab('match')}
                                className={`pb-4 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === 'match' ? 'text-[#5D4037]' : 'text-stone-400'}`}
                            >
                                <span className="flex items-center gap-2">
                                    <Search className="size-4" /> CV Matching Highlights
                                </span>
                                {activeTab === 'match' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#5D4037] rounded-full" />}
                            </button>
                            <button
                                onClick={() => setActiveTab('optimize')}
                                className={`pb-4 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === 'optimize' ? 'text-[#5D4037]' : 'text-stone-400'}`}
                            >
                                <span className="flex items-center gap-2">
                                    <Zap className="size-4" /> Smart CV Upgrade
                                </span>
                                {activeTab === 'optimize' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#5D4037] rounded-full" />}
                            </button>
                            <button
                                onClick={() => setActiveTab('email')}
                                className={`pb-4 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === 'email' ? 'text-[#5D4037]' : 'text-stone-400'}`}
                            >
                                <span className="flex items-center gap-2">
                                    <Mail className="size-4" /> Personal AI Mailer
                                </span>
                                {activeTab === 'email' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#5D4037] rounded-full" />}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                {activeTab === 'match' && (
                                    <Card className="p-6 border-stone-200">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="font-bold text-stone-900 flex items-center gap-2">
                                                <Search className="size-5 text-[#5D4037]" /> Highlight Intelligence
                                            </h3>
                                            <div className="flex gap-2">
                                                <span className="text-[10px] font-bold px-2 py-1 bg-red-50 text-red-600 rounded border border-red-100">CRITICAL</span>
                                                <span className="text-[10px] font-bold px-2 py-1 bg-amber-50 text-amber-600 rounded border border-amber-100">WEAK</span>
                                                <span className="text-[10px] font-bold px-2 py-1 bg-stone-50 text-stone-400 rounded border border-stone-100">GENERIC</span>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            {result.highlights.missing.length > 0 && (
                                                <div>
                                                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                        <X className="size-3" /> Missing required keywords
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {result.highlights.missing.map((kw: string) => (
                                                            <span key={kw} className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-bold border border-red-100 shadow-sm">
                                                                {kw}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {result.highlights.weak.length > 0 && (
                                                <div>
                                                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                        <AlertCircle className="size-3" /> Weak/Vague phrasing
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {result.highlights.weak.map((ph: string) => (
                                                            <span key={ph} className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold border border-amber-100 shadow-sm">
                                                                "{ph}"
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {(result.highlights.overused.length > 0 || result.highlights.lowImpact.length > 0) && (
                                                <div>
                                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                        <Target className="size-3" /> Generic / Low Impact
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {[...result.highlights.overused, ...result.highlights.lowImpact].map((ph: string) => (
                                                            <span key={ph} className="px-3 py-1.5 bg-stone-50 text-stone-600 rounded-lg text-xs font-bold border border-stone-100">
                                                                {ph}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {result.highlights.atsIssues.length > 0 && (
                                                <div className="p-4 bg-red-50/30 rounded-xl border border-red-100 flex items-start gap-3">
                                                    <ShieldCheck className="size-5 text-red-500 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-bold text-red-900">ATS Compliance Warning</p>
                                                        <p className="text-xs text-red-700 mt-1">{result.highlights.atsIssues[0]}</p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="p-4 bg-[#5D4037]/5 rounded-xl border border-[#5D4037]/10">
                                                <div className="flex items-start gap-3">
                                                    <Sparkles className="size-5 text-[#5D4037] mt-1" />
                                                    <p className="text-sm text-stone-700 leading-relaxed italic">
                                                        "Your profile shows strong technical alignment, but it's currently buried under generic descriptors. Use **Action-Metric** verbs to increase your visibility by up to 40%."
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                )}

                                {activeTab === 'optimize' && (
                                    <Card className="overflow-hidden border-stone-200">
                                        <div className="bg-[#5D4037] p-6 text-white flex justify-between items-center">
                                            <div>
                                                <h3 className="font-bold flex items-center gap-2">
                                                    <Zap className="size-5" /> Smart Optimization
                                                </h3>
                                                <p className="text-stone-300 text-sm mt-1 pb-1 pr-1">Auto-upgrading weak bullet points with achievement-driven metrics.</p>
                                            </div>
                                            <button
                                                onClick={handleOptimize}
                                                className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
                                            >
                                                <RefreshCw className="size-5" />
                                            </button>
                                        </div>
                                        <div className="p-6 space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-4 bg-red-50/50 rounded-xl border border-red-100">
                                                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2">BEFORE (Standard)</p>
                                                    <p className="text-sm text-stone-600 italic">"Worked on website design."</p>
                                                </div>
                                                <div className="p-4 bg-green-50/50 rounded-xl border border-green-100 relative group">
                                                    <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-2">AFTER (Optimized)</p>
                                                    <p className="text-sm text-stone-900 font-medium">"Designed and developed 5 responsive websites using React and Figma, improving user engagement by 32%."</p>
                                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Sparkles className="size-3 text-green-500 animate-pulse" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-4 bg-red-50/50 rounded-xl border border-red-100">
                                                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2">BEFORE (Standard)</p>
                                                    <p className="text-sm text-stone-600 italic">"Responsible for team management."</p>
                                                </div>
                                                <div className="p-4 bg-green-50/50 rounded-xl border border-green-100">
                                                    <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-2">AFTER (Optimized)</p>
                                                    <p className="text-sm text-stone-900 font-medium">"Spearheaded a cross-functional team of 8 to deliver project milestones 2 weeks ahead of schedule."</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-stone-50 p-4 border-t border-stone-100 flex justify-between items-center">
                                            <div className="flex gap-2">

                                                <button
                                                    onClick={downloadOptimizationPDF}
                                                    className="px-4 py-2 bg-stone-900 text-white rounded-lg font-bold text-xs hover:bg-black transition-all flex items-center gap-2 shadow-sm"
                                                >
                                                    <Download className="size-3" /> Download Premium PDF
                                                </button>
                                            </div>
                                            <button
                                                onClick={handleOptimize}
                                                className="px-6 py-2 bg-[#5D4037] text-white rounded-lg font-bold text-sm hover:bg-[#4E342E] transition-all flex items-center gap-2"
                                            >
                                                Apply All Upgrades <ArrowRight className="size-4" />
                                            </button>
                                        </div>
                                    </Card>
                                )}

                                {activeTab === 'email' && (
                                    <Card className="p-6 border-stone-200">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="font-bold text-stone-900 flex items-center gap-2">
                                                <Mail className="size-5 text-purple-600" /> AI Mail Generator
                                            </h3>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        if (generatedEmail) {
                                                            navigator.clipboard.writeText(generatedEmail);
                                                            toast.success("Email copied!");
                                                        }
                                                    }}
                                                    className="p-2 border border-stone-200 rounded-lg hover:bg-stone-50" title="Copy Text"
                                                >
                                                    <Copy className="size-4 text-stone-600" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                                            {['Formal', 'Confident', 'Friendly', 'Startup'].map(tone => (
                                                <button
                                                    key={tone}
                                                    onClick={() => setEmailTone(tone)}
                                                    className={`p-3 border-2 rounded-xl text-center transition-all ${emailTone === tone ? 'border-[#5D4037]/20 bg-[#5D4037]/5 text-[#5D4037]' : 'border-stone-100 hover:border-stone-200 bg-stone-50/50 text-stone-700'}`}
                                                >
                                                    <p className="text-[10px] font-bold uppercase mb-1">TONE</p>
                                                    <p className="text-sm font-bold uppercase">{tone}</p>
                                                </button>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-3 gap-3 mb-6">
                                            {['Short', 'Medium', 'Detailed'].map(len => (
                                                <button
                                                    key={len}
                                                    onClick={() => setEmailLength(len)}
                                                    className={`p-3 border-2 rounded-xl text-center transition-all ${emailLength === len ? 'border-[#5D4037]/20 bg-[#5D4037]/5 text-[#5D4037]' : 'border-stone-100 hover:border-stone-200 bg-stone-50/50 text-stone-700'}`}
                                                >
                                                    <p className="text-[10px] font-bold uppercase mb-1">LENGTH</p>
                                                    <p className="text-sm font-bold uppercase">{len}</p>
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={handleGenerateEmail}
                                            disabled={isGeneratingEmail}
                                            className="w-full mb-6 py-3 bg-[#5D4037] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#4E342E] transition-all disabled:opacity-50"
                                        >
                                            {isGeneratingEmail ? <RefreshCw className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                                            {generatedEmail ? 'Regenerate Email' : 'Generate Personalized Email'}
                                        </button>

                                        {generatedEmail && (
                                            <div className="space-y-4">
                                                <div className="p-6 bg-stone-900 rounded-xl font-mono text-sm group relative">
                                                    <div className="flex justify-between items-center mb-4 border-b border-stone-800 pb-2">
                                                        <span className="text-stone-500 uppercase text-xs tracking-widest font-sans font-bold flex items-center gap-2">
                                                            <Terminal className="size-4" /> Edit inside Pengu
                                                        </span>
                                                        <span className="text-stone-600 text-[10px] uppercase font-sans font-bold">Live Editor</span>
                                                    </div>
                                                    <textarea
                                                        value={generatedEmail}
                                                        onChange={(e) => setGeneratedEmail(e.target.value)}
                                                        className="w-full bg-transparent text-stone-300 resize-none focus:outline-none min-h-[200px]"
                                                    />
                                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => {
                                                                const element = document.createElement("a");
                                                                const file = new Blob([generatedEmail], { type: 'text/plain' });
                                                                element.href = URL.createObjectURL(file);
                                                                element.download = "application-email.txt";
                                                                document.body.appendChild(element);
                                                                element.click();
                                                                toast.success("Downloading email...");
                                                            }}
                                                            className="p-1.5 bg-stone-800 text-stone-400 rounded hover:text-white"
                                                            title="Download as .txt"
                                                        >
                                                            <Download className="size-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(generatedEmail);
                                                            toast.success("Email copied to clipboard!");
                                                        }}
                                                        className="flex-1 py-3 bg-stone-100 text-stone-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-200 transition-colors"
                                                    >
                                                        <Copy className="size-4" /> Copy Final Text
                                                    </button>
                                                    <button
                                                        onClick={() => toast.success("Template saved to your Career Vault!")}
                                                        className="px-4 bg-white border border-stone-200 text-stone-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-50 transition-colors"
                                                        title="Save as Template"
                                                    >
                                                        <FileJson className="size-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </Card>
                                )}
                            </div>

                            <div className="space-y-6">
                                <Card className="p-6 border-stone-200 bg-[#5D4037] text-white overflow-hidden relative">
                                    <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest mb-2 relative z-10">Estimated Shortlist Chance</p>
                                    <div className="flex items-baseline gap-2 relative z-10">
                                        <span className="text-5xl font-black">{result.shortlistChance}%</span>
                                        <span className="text-xs font-bold text-green-300 px-2 py-0.5 bg-green-500/20 rounded-full border border-green-500/30">Stable Probability</span>
                                    </div>
                                    <div className="mt-4 relative z-10">
                                        <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                                            <span>Industry Benchmark</span>
                                            <span>User Rank: Top 4%</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${result.shortlistChance}%` }}
                                                className="h-full bg-green-400"
                                            />
                                        </div>
                                    </div>
                                    <TrendingUp className="absolute -bottom-4 -right-4 size-32 text-white opacity-5" />
                                </Card>

                                <Card className="p-6 border-stone-200 relative overflow-hidden">
                                    <div className="flex items-center gap-2 text-stone-900 font-bold mb-6">
                                        <BarChart3 className="size-5 text-[#5D4037]" />
                                        <h4>Strategic Action Plan</h4>
                                    </div>

                                    <div className="space-y-6 relative z-10">
                                        <div>
                                            <h5 className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <AlertCircle className="size-3" /> Prioritized Risk Areas
                                            </h5>
                                            <div className="space-y-3">
                                                {result.riskAreas.map((risk: string, i: number) => (
                                                    <div key={i} className="p-3 bg-red-50/30 rounded-lg border border-red-100/50 flex gap-3 items-start">
                                                        <div className="size-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                                                        <p className="text-xs text-red-900 font-medium">{risk}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h5 className="text-[10px] font-bold text-[#5D4037] uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <Sparkles className="size-3" /> Critical Suggestions
                                            </h5>
                                            <div className="space-y-2">
                                                {result.suggestions.map((sug: string, i: number) => (
                                                    <div key={i} className="flex gap-3 text-xs text-stone-600 group hover:text-stone-900 transition-colors">
                                                        <CheckCircle2 className="size-3 text-green-500 mt-0.5 shrink-0" />
                                                        <p>{sug}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-stone-100">
                                            <button
                                                onClick={handleSaveTemplate}
                                                className="w-full py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-600 font-bold text-xs hover:bg-stone-100 transition-all flex items-center justify-center gap-2"
                                            >
                                                <FileJson className="size-3" /> Save as Template
                                            </button>
                                        </div>
                                    </div>
                                </Card>

                                <button
                                    onClick={() => setResult(null)}
                                    className="w-full py-3 border border-stone-200 rounded-xl text-stone-600 font-bold text-sm hover:bg-stone-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <RefreshCw className="size-4" /> Reset Analysis
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CareerBoost;
