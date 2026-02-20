import React, { useState } from 'react';
import { DashboardLayout } from './components/Layout';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import {
  Briefcase,
  FileText,
  Download,
  Star,
  Upload,
  Check,
  Search,
  Filter,
  Layout,
  Loader2,
  FileUp,
  X,
  Rocket,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import api from '../lib/api'; // Import API
import { useStore } from './store';

import { getTemplateHTML, TEMPLATE_STYLES } from '../lib/DocumentTemplates';

const TEMPLATES = [
  {
    id: 1,
    title: 'Modern Executive Resume',
    category: 'Resume',
    downloads: '2.4k',
    popular: true,
    tags: ['Olivia Style', 'Modern', 'Design'],
    style: TEMPLATE_STYLES.MODERN
  },
  {
    id: 2,
    title: 'Minimalist Job Application',
    category: 'Cover Letter',
    downloads: '1.1k',
    popular: false,
    tags: ['Clean', 'Professional', 'Letter'],
    style: TEMPLATE_STYLES.MINIMALIST
  },
  {
    id: 3,
    title: 'Professional Corporate CV',
    category: 'Resume',
    downloads: '3.8k',
    popular: true,
    tags: ['Dani Style', 'Traditional', 'Corporate'],
    style: TEMPLATE_STYLES.PROFESSIONAL
  },
  { id: 4, title: 'Creative Portfolio Slide', category: 'Portfolio', downloads: '850', popular: false, tags: ['Design', 'Visual'], style: TEMPLATE_STYLES.MODERN },
  {
    id: 5,
    title: 'LinkedIn Success Profile',
    category: 'LinkedIn',
    downloads: '5.2k',
    popular: true,
    tags: ['Social', 'Growth', 'Network'],
    style: TEMPLATE_STYLES.LINKEDIN
  },
  {
    id: 6,
    title: 'Standard Professional Resume',
    category: 'Resume',
    downloads: '1.5k',
    popular: false,
    tags: ['Basic', 'Clean'],
    style: TEMPLATE_STYLES.MODERN
  },
];

import { PenguLogoWhite } from './components/PenguLogoWhite';

const REVIEWS: {
  id: number;
  filename: string;
  date: string;
  score: string;
  status: string;
  role?: string;
  seniority?: string;
  keywordsFound?: string[];
  keywordsMissing?: string[];
  analysis: {
    header: { pass: boolean; note: string };
    summary: { pass: boolean; note: string };
    skills: { pass: boolean; note: string };
    experience: { pass: boolean; note: string };
    projects: { pass: boolean; note: string };
    whatToUpdate: string[];
  };
}[] = [];

const SCAN_PHASES = [
  "Scanning Header & Contact details...",
  "Analyzing Professional Summary impact...",
  "Verifying Skill categories (Tech vs Soft)...",
  "Checking Work Experience for metrics...",
  "Evaluating Project stack & descriptions...",
  "Analyzing Education & Certifications...",
  "Optimizing for ATS compatibility..."
];

export default function CareerVault() {
  const { currentUser } = useStore();
  const [activeTab, setActiveTab] = useState<'templates' | 'reviews' | 'hubAnalyses'>('templates');
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [scanIndex, setScanIndex] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // Load real reviews from backend
  const [pastReviews, setPastReviews] = useState<typeof REVIEWS>([]);
  const [savedHubAnalyses, setSavedHubAnalyses] = useState<any[]>([]);
  const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(false);
  const [selectedHubAnalysis, setSelectedHubAnalysis] = useState<any | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoadingAnalyses(true);
      try {
        const [reviewsRes, templatesRes] = await Promise.all([
          api.get('/career-reviews'),
          api.get('/career-templates')
        ]);
        setPastReviews(reviewsRes.data.map((r: any) => ({ ...r, id: r._id || r.id })));
        setSavedHubAnalyses(templatesRes.data);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setIsLoadingAnalyses(false);
      }
    };
    fetchData();
  }, []);

  const [selectedReport, setSelectedReport] = useState<typeof REVIEWS[0] | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const filteredTemplates = TEMPLATES.filter(t => {
    const matchesFilter = filter === 'All' || t.category === filter;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const triggerMockDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDeleteSavedAnalysis = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this saved analysis?")) return;

    try {
      await api.delete(`/career-templates/${id}`);
      setSavedHubAnalyses(prev => prev.filter(a => a._id !== id));
      toast.success("Analysis deleted successfully");
    } catch (error) {
      console.error("Failed to delete analysis", error);
      toast.error("Failed to delete analysis");
    }
  };

  const generateFeedbackText = (review: typeof REVIEWS[0]) => {
    return `
🔥 PREMIUM CV ANALYSIS REPORT (2026 STANDARDS)
--------------------------------------------------
File: ${review.filename}
Score: ${review.score}
Status: ${parseInt(review.score) >= 9 ? 'Premium' : 'Standard'}
Review Date: ${review.date}, 2026

1️⃣ HEADER CHECK: ${review.analysis.header.note}
2️⃣ SUMMARY CHECK: ${review.analysis.summary.note}
3️⃣ SKILLS MATRIX: ${review.analysis.skills.note}
4️⃣ WORK EXPERIENCE: ${review.analysis.experience.note}
5️⃣ PROJECTS: ${review.analysis.projects.note}

⚡ WHAT TO UPDATE TO REACH 10/10:
${review.analysis.whatToUpdate.map((item, i) => `- ${item}`).join('\n')}

ATS OPTIMIZATION: PASS
Generated by Pengu AI Digital Career Assistant.
`;
  };

  const downloadPremiumReport = (review: typeof REVIEWS[0]) => {
    const toastId = toast.loading("Preparing Premium PDF...");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Premium CV Analysis - ${review.filename}</title>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
          body { font-family: 'Inter', sans-serif; color: #1c1917; margin: 0; padding: 40px; background: white; }
          .header { background: #3E2723; color: white; padding: 60px 40px; border-radius: 0 0 40px 40px; margin: -40px -40px 30px -40px; position: relative; -webkit-print-color-adjust: exact; }
          .logo { background: rgba(255,255,255,0.1); width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.2); font-weight: bold; font-size: 24px; }
          .title { font-size: 32px; font-weight: 800; margin: 0; }
          .subtitle { color: rgba(255,255,255,0.6); font-size: 16px; margin-top: 5px; }
          .score-container { margin-top: 40px; display: flex; align-items: flex-end; justify-content: space-between; }
          .score-label { font-size: 11px; font-weight: 900; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 2px; }
          .score-value { font-size: 80px; font-weight: 900; margin: 5px 0 0 0; line-height: 1; }
          .score-total { font-size: 32px; color: rgba(255,255,255,0.4); }
          .badge { padding: 6px 16px; border-radius: 100px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; -webkit-print-color-adjust: exact; }
          .badge-standard { background: #5D4037; color: white; }
          .badge-premium { background: #fbbf24; color: #451a03; }
          .content { display: grid; grid-template-cols: 1fr; gap: 20px; margin-top: 20px; }
          .section { background: white; padding: 25px; border-radius: 16px; border: 1px solid #e5e7eb; page-break-inside: avoid; }
          .section-title { font-size: 11px; font-weight: 800; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }
          .section-note { font-size: 18px; font-weight: 600; color: #111827; line-height: 1.4; }
          .tips-section { background: #fef2f2; border: 1px solid #fee2e2; padding: 40px; border-radius: 20px; margin-top: 40px; -webkit-print-color-adjust: exact; page-break-inside: avoid; }
          .tips-header { font-size: 22px; font-weight: 800; color: #3E2723; margin-bottom: 25px; display: flex; align-items: center; }
          .tip-item { display: flex; gap: 16px; margin-bottom: 16px; align-items: flex-start; }
          .tip-number { background: #3E2723; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0; margin-top: 2px; -webkit-print-color-adjust: exact; }
          .tip-text { color: #374151; font-size: 16px; font-weight: 500; }
          .footer { text-align: center; color: #9ca3af; font-size: 14px; margin-top: 60px; font-style: italic; }
          @media print {
            body { padding: 0; }
            .header { border-radius: 0; margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🐧</div>
          <div>
            <h1 class="title">Digital Career Analysis</h1>
            <p class="subtitle">2026 Industry Standard Framework</p>
          </div>
          <div class="score-container">
            <div>
              <div class="score-label">Executive Score</div>
              <p class="score-value">${review.score.split('/')[0]}<span class="score-total">/10</span></p>
            </div>
            <div style="text-align: right">
              <span class="badge ${parseInt(review.score) >= 9 ? 'badge-premium' : 'badge-standard'}">
                ${parseInt(review.score) >= 9 ? 'Premium Profile' : 'Standard Profile'}
              </span>
              <p class="subtitle" style="margin-top: 15px">Reported on ${review.date}, 2026</p>
            </div>
          </div>
        </div>

        <div class="content">
          <div class="section"><div class="section-title">Header & Contact</div><div class="section-note">${review.analysis.header.note}</div></div>
          <div class="section"><div class="section-title">Professional Summary</div><div class="section-note">${review.analysis.summary.note}</div></div>
          <div class="section"><div class="section-title">Skills Matrix</div><div class="section-note">${review.analysis.skills.note}</div></div>
          <div class="section"><div class="section-title">Work Experience</div><div class="section-note">${review.analysis.experience.note}</div></div>
          <div class="section"><div class="section-title">Projects</div><div class="section-note">${review.analysis.projects.note}</div></div>
        </div>

        <div class="tips-section">
          <h2 class="tips-header">🚀 Strategy to Reach 10/10</h2>
          ${review.analysis.whatToUpdate.map((tip, i) => `
            <div class="tip-item">
              <div class="tip-number">${i + 1}</div>
              <div class="tip-text">${tip}</div>
            </div>
          `).join('')}
        </div>

        <div class="footer">
          "A recruiter spends 6 seconds on a CV. Make them count." — 2026 Pengu AI Strategy
        </div>

        <script>
          setTimeout(() => {
            window.print();
            // Optional: window.close(); 
          }, 500);
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      toast.success("PDF Print Dialog Opened!", {
        id: toastId,
        description: "Please select 'Save as PDF' in the print options."
      });
    } else {
      toast.error("Pop-up blocked!", { id: toastId, description: "Please allow pop-ups to download the PDF." });
    }
  };

  const handleDownloadTemplate = (template: typeof TEMPLATES[0]) => {
    const toastId = toast.loading(`Preparing Premium Template: ${template.title}...`);

    setTimeout(() => {
      const htmlContent = getTemplateHTML(template.style, {
        name: currentUser?.name || 'Your Name',
      });

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        toast.success(`Premium ${template.category} Ready!`, {
          id: toastId,
          description: "Download via the browser print dialog."
        });
      } else {
        toast.error("Pop-up blocked!", { id: toastId, description: "Please allow pop-ups to download the template." });
      }
    }, 1000);
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadProgress(0);
      setScanIndex(0);

      const simulationInterval = setInterval(() => {
        setUploadProgress(prev => (prev === null || prev >= 95) ? prev : prev + 5);
        setScanIndex(prev => Math.min(prev + 1, SCAN_PHASES.length - 1));
      }, 300);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const { data } = await api.post('/career-reviews/scan', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        clearInterval(simulationInterval);
        setUploadProgress(100);

        setTimeout(() => {
          setPastReviews(prev => [data, ...prev]);
          setSelectedReport(data);
          setUploadProgress(null);
          setSelectedFile(null);
          setActiveTab('reviews');
          toast.success(`Analysis Complete: ${data.seniority} ${data.role} Detected`);
        }, 500);

      } catch (error: any) {
        clearInterval(simulationInterval);
        console.error("CV upload failed", error);
        toast.error(error.response?.data?.message || "Failed to analyze document");
        setUploadProgress(null);
        setSelectedFile(null);
      }
    }
  };


  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3E2723]">Career Vault</h1>
            <p className="text-stone-500">Premium templates and expert reviews to land your dream job.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setActiveTab('reviews')}>
              <Upload className="mr-2 size-4" /> Upload for Review
            </Button>
            <Button onClick={() => setActiveTab('templates')}>
              <Layout className="mr-2 size-4" /> Browse Templates
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-stone-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('templates')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'templates' ? 'border-[#5D4037] text-[#5D4037]' : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'}
              `}
            >
              Document Templates
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'reviews' ? 'border-[#5D4037] text-[#5D4037]' : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'}
              `}
            >
              My Document Reviews
            </button>
            <button
              onClick={() => setActiveTab('hubAnalyses')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'hubAnalyses' ? 'border-[#5D4037] text-[#5D4037]' : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'}
              `}
            >
              Saved Hub Analyses
            </button>
          </nav>
        </div>

        {activeTab === 'templates' ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-stone-100 shadow-sm">
              <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-hide">
                {['All', 'Resume', 'Cover Letter', 'Portfolio', 'LinkedIn', 'Networking'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`
                      px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                      ${filter === cat ? 'bg-[#5D4037] text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}
                    `}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5D4037]/20 focus:border-[#5D4037]"
                />
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="group cursor-pointer hover:shadow-lg transition-all border-stone-200 overflow-hidden">
                  <div className="h-40 bg-stone-100 relative flex items-center justify-center p-8">
                    {/* Preview Mockup */}
                    <div className={`w-28 h-36 bg-white shadow-xl rounded-sm transform group-hover:-translate-y-2 transition-transform duration-500 overflow-hidden flex ${template.style === TEMPLATE_STYLES.MODERN ? 'flex-col' : ''}`}>
                      {template.style === TEMPLATE_STYLES.MINIMALIST && (
                        <div className="w-full h-full p-3 flex flex-col gap-2">
                          <div className="h-1.5 w-8 bg-stone-300 rounded-full" />
                          <div className="h-1 w-full bg-stone-100 rounded-full mt-4" />
                          <div className="h-1 w-full bg-stone-100 rounded-full" />
                          <div className="h-1 w-full bg-stone-100 rounded-full" />
                          <div className="h-1 w-2/3 bg-stone-100 rounded-full" />
                          <div className="mt-auto h-4 w-12 bg-stone-100 rounded self-end" />
                        </div>
                      )}
                      {template.style === TEMPLATE_STYLES.MODERN && (
                        <>
                          <div className="h-10 w-full bg-stone-50 flex items-center justify-center border-b border-stone-100">
                            <div className="size-6 rounded-full bg-stone-200" />
                          </div>
                          <div className="flex-1 flex p-2 gap-2">
                            <div className="w-1/3 border-r border-stone-50 flex flex-col gap-1">
                              <div className="h-1 w-full bg-stone-200" />
                              <div className="h-1 w-full bg-stone-100" />
                            </div>
                            <div className="flex-1 flex flex-col gap-2">
                              <div className="h-1.5 w-1/2 bg-stone-200 rounded-full" />
                              <div className="h-1 w-full bg-stone-100" />
                              <div className="h-1 w-full bg-stone-100" />
                            </div>
                          </div>
                        </>
                      )}
                      {template.style === TEMPLATE_STYLES.PROFESSIONAL && (
                        <div className="w-full h-full p-4 flex flex-col gap-3">
                          <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                            <div className="h-3 w-1/3 bg-stone-300 rounded-full" />
                            <div className="h-2 w-8 bg-stone-100 rounded-full" />
                          </div>
                          <div className="flex gap-4">
                            <div className="w-1/4 flex flex-col gap-2">
                              <div className="h-1 w-full bg-stone-200" />
                              <div className="h-1 w-2/3 bg-stone-100" />
                            </div>
                            <div className="flex-1 flex flex-col gap-2">
                              <div className="h-1.5 w-full bg-stone-200" />
                              <div className="h-1 w-full bg-stone-100" />
                              <div className="h-1 w-2/3 bg-stone-100" />
                            </div>
                          </div>
                        </div>
                      )}
                      {template.style === TEMPLATE_STYLES.LINKEDIN && (
                        <div className="w-full h-full bg-[#f3f2ef] flex flex-col">
                          <div className="h-8 w-full bg-[#0a66c2]" />
                          <div className="mx-2 -mt-4 bg-white rounded p-2 flex flex-col gap-1 shadow-sm">
                            <div className="size-6 rounded-full bg-stone-200 border border-white" />
                            <div className="h-1.5 w-1/2 bg-stone-300 rounded-full mt-1" />
                            <div className="h-1 w-2/3 bg-stone-100 rounded-full" />
                          </div>
                          <div className="m-2 bg-white rounded p-2 flex flex-col gap-1 flex-1 shadow-sm">
                            <div className="h-1 w-1/3 bg-stone-200 rounded-full" />
                            <div className="h-1 w-full bg-stone-50 rounded-full" />
                          </div>
                        </div>
                      )}
                    </div>
                    {template.popular && (
                      <span className="absolute top-3 right-3 bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Star className="size-3 fill-amber-800" /> Popular
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#5D4037] uppercase tracking-wider">{template.category}</span>
                      <span className="text-xs text-stone-400 flex items-center gap-1">
                        <Download className="size-3" /> {template.downloads}
                      </span>
                    </div>
                    <h3 className="font-bold text-stone-900 mb-2 group-hover:text-[#5D4037] transition-colors">{template.title}</h3>
                    <div className="flex gap-2 mb-4">
                      {template.tags.map(tag => (
                        <span key={tag} className="text-xs bg-stone-50 text-stone-500 px-2 py-1 rounded border border-stone-100">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadTemplate(template);
                      }}
                      variant="outline"
                      className="w-full group-hover:bg-[#5D4037] group-hover:text-white group-hover:border-[#5D4037]"
                    >
                      Download Template
                    </Button>
                  </div>
                </Card>
              ))}
              {filteredTemplates.length === 0 && (
                <div className="col-span-full py-12 text-center">
                  <p className="text-stone-500">No templates found matching your search.</p>
                  <Button variant="link" onClick={() => { setSearchQuery(''); setFilter('All'); }}>Clear all filters</Button>
                </div>
              )}
            </div>
          </motion.div>
        ) : activeTab === 'hubAnalyses' ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {isLoadingAnalyses ? (
              <div className="flex flex-col items-center justify-center py-20 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                <Loader2 className="size-8 text-[#5D4037] animate-spin mb-4" />
                <p className="text-stone-500 font-medium">Fetching your saved analyses...</p>
              </div>
            ) : savedHubAnalyses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-center px-4">
                <div className="size-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                  <Layout className="size-8 text-stone-300" />
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-2">No Saved Analyses Yet</h3>
                <p className="text-stone-500 mb-6 max-w-sm">
                  Go to the Career Hub to analyze your CV against target jobs and save your results here.
                </p>
                <Button onClick={() => window.location.href = '/student/career-acceleration'}>
                  Go to Career Hub
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedHubAnalyses.map((analysis) => (
                  <Card key={analysis._id} className="p-6 hover:border-[#5D4037]/30 transition-all group border-stone-200">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-[#5D4037] uppercase tracking-widest">Saved Analysis</span>
                          <span className="text-[10px] text-stone-400">• {analysis.date}</span>
                        </div>
                        <h4 className="font-bold text-stone-900 flex items-center gap-2 text-lg">
                          <Rocket className="size-4 text-[#5D4037]" /> Career Match Report
                        </h4>
                      </div>
                      <button
                        onClick={() => handleDeleteSavedAnalysis(analysis._id)}
                        className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                      >
                        <X className="size-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter mb-1">Match Score</p>
                        <p className="text-2xl font-black text-[#5D4037]">{analysis.overallScore}%</p>
                      </div>
                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter mb-1">Shortlist %</p>
                        <div className="flex items-center gap-2">
                          <p className="text-2xl font-black text-green-600">{analysis.shortlistChance}%</p>
                          <TrendingUp className="size-4 text-green-500" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div>
                        <p className="text-[10px] font-bold text-red-400 uppercase mb-2 flex items-center gap-1.5">
                          <AlertCircle className="size-3" /> Risk Areas
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {analysis.riskAreas?.slice(0, 3).map((risk: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-red-50 text-red-600 rounded-md text-[10px] font-bold">
                              {risk}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-green-500 uppercase mb-2 flex items-center gap-1.5">
                          <Star className="size-3" /> Top Suggestions
                        </p>
                        <div className="space-y-1">
                          {analysis.suggestions?.slice(0, 2).map((sug: string, i: number) => (
                            <div key={i} className="flex gap-2 text-[11px] text-stone-600">
                              <Check className="size-3 text-green-500 shrink-0 mt-0.5" />
                              <p className="line-clamp-1">{sug}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => setSelectedHubAnalysis(analysis)}
                      variant="outline"
                      className="w-full border-stone-200 text-stone-600 group-hover:bg-[#5D4037] group-hover:text-white group-hover:border-[#5D4037]"
                    >
                      View Detailed Insights
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Upload Area */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx"
            />

            <Card className="p-8 border-dashed border-2 border-stone-200 bg-stone-50 text-center relative overflow-hidden">
              <AnimatePresence>
                {uploadProgress !== null && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center p-6"
                  >
                    <div className="size-16 bg-stone-100 rounded-full flex items-center justify-center mb-4 relative">
                      <Loader2 className={`size-10 text-[#5D4037] animate-spin absolute transition-opacity duration-300 ${uploadProgress < 100 ? 'opacity-100' : 'opacity-0'}`} />
                      <Check className={`size-8 text-[#5D4037] transition-opacity duration-300 ${uploadProgress === 100 ? 'opacity-100' : 'opacity-0'}`} />
                    </div>
                    <p className="font-bold text-stone-900 mb-1 px-4">
                      {uploadProgress < 100 ? `Intelligent Scan: ${SCAN_PHASES[scanIndex]}` : 'Scan Complete!'}
                    </p>
                    <p className="text-sm text-stone-500 mb-4">{uploadProgress}% scanned</p>
                    <div className="w-full max-w-xs bg-stone-100 h-2 rounded-full overflow-hidden">
                      <motion.div
                        className="bg-[#5D4037] h-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mx-auto size-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <FileUp className="size-8 text-[#5D4037]" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">Upload your CV or Cover Letter</h3>
              <p className="text-stone-500 mb-6 max-w-md mx-auto">
                Get an instant intelligent review based on 2026 industry standards. We check for ATS compatibility, header impact, and metric-based experience.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => fileInputRef.current?.click()} className="px-8">
                  Select File
                </Button>
              </div>
            </Card>

            {pastReviews.length > 0 && <h3 className="font-bold text-stone-900 mt-8">Recent Reviews</h3>}
            <div className="space-y-4">
              {pastReviews.map((review, idx) => (
                <Card key={review.id || idx} className="p-6 flex items-center justify-between hover:border-[#5D4037]/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="size-12 bg-green-100 rounded-lg flex items-center justify-center text-green-700">
                      <Check className="size-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900">{review.filename}</h4>
                      <p className="text-sm text-stone-500">Reviewed on {review.date} • <span className="text-[#5D4037] font-bold">{review.score} Score</span></p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setSelectedReport(review)}
                      variant="outline"
                      className="border-stone-200 text-stone-600"
                    >
                      View Report
                    </Button>
                    <Button
                      onClick={() => downloadPremiumReport(review)}
                      className="bg-[#3E2723] hover:bg-[#5D4037]"
                    >
                      <Download className="size-4 mr-2" /> PDF
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Hub Analysis Detailed Insights Modal */}
      <AnimatePresence>
        {selectedHubAnalysis && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedHubAnalysis(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="bg-[#3E2723] p-8 text-white relative flex-shrink-0">
                <button
                  onClick={() => setSelectedHubAnalysis(null)}
                  className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="size-5" />
                </button>
                <div className="flex items-center gap-3 mb-5">
                  <div className="size-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 text-lg">🚀</div>
                  <div>
                    <h2 className="text-xl font-bold">Career Match — Detailed Insights</h2>
                    <p className="text-white/60 text-xs mt-0.5">Saved on {selectedHubAnalysis.date}</p>
                  </div>
                </div>
                {/* Score row */}
                <div className="flex gap-4">
                  <div className="flex-1 bg-white/10 rounded-xl p-4 border border-white/10">
                    <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">Overall Match</p>
                    <p className="text-4xl font-black">{selectedHubAnalysis.overallScore}<span className="text-white/40 text-xl">%</span></p>
                  </div>
                  <div className="flex-1 bg-white/10 rounded-xl p-4 border border-white/10">
                    <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">Shortlist Chance</p>
                    <p className="text-4xl font-black text-green-300">{selectedHubAnalysis.shortlistChance}<span className="text-white/40 text-xl">%</span></p>
                  </div>
                </div>
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1 p-6 space-y-6">

                {/* Breakdown bars */}
                {selectedHubAnalysis.breakdown && (
                  <div>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Score Breakdown</p>
                    <div className="space-y-3">
                      {Object.entries(selectedHubAnalysis.breakdown).map(([key, val]: [string, any]) => (
                        <div key={key}>
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-xs font-bold text-stone-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                            <p className="text-xs font-black text-[#5D4037]">{val}%</p>
                          </div>
                          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${val}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              className={`h-full rounded-full ${val > 80 ? 'bg-green-500' : val > 60 ? 'bg-[#5D4037]' : 'bg-amber-400'}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing keywords */}
                {selectedHubAnalysis.highlights?.missing?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <AlertCircle className="size-3" /> Missing Keywords
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedHubAnalysis.highlights.missing.map((kw: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-red-100">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weak / Overused phrases */}
                {(selectedHubAnalysis.highlights?.weak?.length > 0 || selectedHubAnalysis.highlights?.overused?.length > 0) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedHubAnalysis.highlights.weak?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2">Weak Phrases</p>
                        <div className="space-y-1">
                          {selectedHubAnalysis.highlights.weak.map((p: string, i: number) => (
                            <p key={i} className="text-xs text-stone-500 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5 line-clamp-1">{p}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedHubAnalysis.highlights.overused?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-2">Overused Phrases</p>
                        <div className="space-y-1">
                          {selectedHubAnalysis.highlights.overused.map((p: string, i: number) => (
                            <p key={i} className="text-xs text-stone-500 bg-orange-50 border border-orange-100 rounded-lg px-2.5 py-1.5 line-clamp-1">{p}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Risk Areas */}
                {selectedHubAnalysis.riskAreas?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <AlertCircle className="size-3" /> Risk Areas
                    </p>
                    <div className="space-y-2">
                      {selectedHubAnalysis.riskAreas.map((risk: string, i: number) => (
                        <div key={i} className="flex gap-2 items-start p-2.5 bg-red-50 rounded-lg border border-red-100">
                          <span className="size-4 shrink-0 bg-red-200 text-red-700 rounded-full flex items-center justify-center text-[9px] font-bold mt-0.5">{i + 1}</span>
                          <p className="text-xs text-red-700 font-medium">{risk}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {selectedHubAnalysis.suggestions?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <TrendingUp className="size-3" /> Action Plan
                    </p>
                    <div className="space-y-2">
                      {selectedHubAnalysis.suggestions.map((sug: string, i: number) => (
                        <div key={i} className="flex gap-2 items-start">
                          <Check className="size-4 text-green-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-stone-600">{sug}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ATS issues */}
                {selectedHubAnalysis.highlights?.atsIssues?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">ATS Issues</p>
                    <div className="space-y-1">
                      {selectedHubAnalysis.highlights.atsIssues.map((issue: string, i: number) => (
                        <p key={i} className="text-xs text-stone-500 bg-stone-50 border border-stone-100 rounded-lg px-2.5 py-1.5">{issue}</p>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="flex gap-3 p-4 border-t border-stone-100 flex-shrink-0">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedHubAnalysis(null)}>Close</Button>
                <Button
                  className="flex-1 bg-[#3E2723] hover:bg-[#5D4037]"
                  onClick={() => window.location.href = '/student/career-acceleration'}
                >
                  <Rocket className="size-4 mr-2" /> Go to Career Hub
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Premium Report Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReport(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="bg-[#3E2723] p-8 text-white relative">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="size-5" />
                </button>
                <div className="flex items-center gap-4 mb-6">
                  <div className="size-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                    <PenguLogoWhite />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Digital Career Analysis</h2>
                    <p className="text-white/60 text-sm">2026 Industry Standard Framework</p>
                  </div>
                </div>

                <div className="flex items-end justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Executive Score</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black">{selectedReport.score.split('/')[0]}</span>
                      <span className="text-white/40 text-2xl">/10</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${parseInt(selectedReport.score) >= 9 ? 'bg-amber-400 text-amber-950' : 'bg-stone-500 text-white'}`}>
                      {parseInt(selectedReport.score) >= 9 ? 'Premium Profile' : 'Standard Profile'}
                    </span>
                    <p className="text-white/60 text-xs">Generated on {selectedReport.date}, 2026</p>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-stone-50">
                {/* Section Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Header & Contact", key: "header" },
                    { label: "Prof. Summary", key: "summary" },
                    { label: "Skills Matrix", key: "skills" },
                    { label: "Work Experience", key: "experience" },
                    { label: "Projects", key: "projects" }
                  ].map((item) => {
                    const status = (selectedReport.analysis as any)[item.key];
                    return (
                      <div key={item.key} className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm flex items-start gap-3">
                        {status.pass ? (
                          <div className="size-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="size-4" />
                          </div>
                        ) : (
                          <div className="size-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="font-bold text-xs">!</span>
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">{item.label}</p>
                          <p className="text-sm text-stone-800 font-medium leading-tight">{status.note}</p>
                        </div>
                      </div>
                    );
                  })}
                  {/* ATS Keyword Scan */}
                  {selectedReport.keywordsFound && (
                    <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm relative overflow-hidden">
                      <div className="flex items-center gap-2 mb-4">
                        <Filter className="size-5 text-[#3E2723]" />
                        <h3 className="font-bold text-[#3E2723]">ATS Keyword Intelligence</h3>
                        <span className="ml-auto text-xs font-bold text-stone-400 uppercase tracking-wider">{selectedReport.role} / {selectedReport.seniority} MATCH</span>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-green-700 font-bold mb-2 uppercase">Keywords Detected</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedReport.keywordsFound.map((k, idx) => (
                              <span key={`${k}-${idx}`} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs border border-green-100 font-medium flex items-center gap-1">
                                <Check className="size-3" /> {k}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-red-700 font-bold mb-2 uppercase">Missing High-Value Keywords</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedReport.keywordsMissing?.map((k, idx) => (
                              <span key={`${k}-${idx}`} className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs border border-red-100 font-medium">
                                {k}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm flex items-start gap-3">
                    <div className="size-6 bg-[#3E2723] text-white rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">ATS Optimization</p>
                      <p className="text-sm text-stone-800 font-medium leading-tight">PASS (Verified structure for {selectedReport.role || 'General'} roles)</p>
                    </div>
                  </div>
                </div>

                {/* What to Update */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Star className="size-5 text-[#3E2723] fill-[#3E2723]" />
                    <h3 className="font-bold text-[#3E2723]">What to Update (Reach 10/10)</h3>
                  </div>
                  <div className="bg-[#3E2723]/5 rounded-xl border border-[#3E2723]/10 overflow-hidden">
                    {selectedReport.analysis.whatToUpdate.map((item, i) => (
                      <div key={i} className={`p-4 flex gap-3 ${i !== 0 ? 'border-t border-[#3E2723]/10' : ''}`}>
                        <span className="flex-shrink-0 size-6 bg-[#3E2723] text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </span>
                        <p className="text-sm text-[#3E2723] font-medium leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Quote */}
                <p className="text-center text-stone-400 text-xs italic">
                  "A recruiter spends 6 seconds on a CV. Make them count." — 2026 Pengu Strategy
                </p>
              </div>

              {/* Modal Action */}
              <div className="p-6 bg-white border-t border-stone-100 flex gap-3">
                <Button
                  onClick={() => setSelectedReport(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Close Analysis
                </Button>
                <Button
                  onClick={() => downloadPremiumReport(selectedReport)}
                  className="flex-1 bg-[#3E2723] hover:bg-[#5D4037]"
                >
                  Download Full PDF
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
