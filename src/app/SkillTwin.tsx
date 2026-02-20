import { useState } from 'react';
import { useStore, Skill } from './store';
import { DashboardLayout } from './components/Layout';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import {
  TrendingUp,
  Award,
  Target,
  Zap,
  BookOpen,
  Download,
  Share2,
  Plus,
  Briefcase,
  Upload
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './components/ui/dialog';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components/ui/select';

import { toast } from 'sonner';
import api from '../lib/api'; // Import API

export default function SkillTwin() {
  const { skills, currentUser, isInitialized, addSkill, expertApplications, submitExpertApplication } = useStore();
  const [showSWOT, setShowSWOT] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isAddCertOpen, setIsAddCertOpen] = useState(false);
  const [scanStep, setScanStep] = useState<'idle' | 'uploading' | 'scanning' | 'complete'>('idle');
  const [uploadFile, setUploadFile] = useState<File | null>(null);


  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isPremiumExportOpen, setIsPremiumExportOpen] = useState(false);
  const [applicationStep, setApplicationStep] = useState<'idle' | 'sending' | 'sent'>('idle');

  const [newCert, setNewCert] = useState<Partial<Skill>>({
    level: 'Intermediate',
    score: 85,
    source: 'Certificate'
  });

  // Check existing application status
  const existingApplication = expertApplications.find(a => a.userId === currentUser?.id);
  const isApplied = !!existingApplication;
  const applicationStatus = existingApplication?.status;

  const handleApplyToNetwork = () => {
    if (!currentUser) return;
    setApplicationStep('sending');

    // Simulate network delay for UX
    setTimeout(() => {
      submitExpertApplication();
      setApplicationStep('sent');
      setTimeout(() => {
        // Keep dialog open to show success state, user can close manually
        // setIsApplyOpen(false); 
        setApplicationStep('idle');
      }, 1500);
    }, 1500);
  };

  /* eslint-disable @typescript-eslint/ban-ts-comment */
  const generatePremiumPDF = () => {
    // @ts-ignore
    import('html2pdf.js').then((html2pdfModule) => {
      const html2pdf = html2pdfModule.default;

      const element = document.createElement('div');
      element.innerHTML = `
          <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
          @page { size: A4; margin: 0; }
          body { font-family: 'Inter', sans-serif; color: #1c1917; padding: 0; margin: 0; -webkit-print-color-adjust: exact; }
          .page-container { padding: 60px; max-width: 800px; margin: 0 auto; background: white; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #5D4037; padding-bottom: 30px; }
          .name { font-size: 36px; font-weight: 900; color: #3E2723; margin: 0; letter-spacing: -0.5px; }
          .role { font-size: 14px; color: #78716c; letter-spacing: 3px; text-transform: uppercase; margin-top: 8px; font-weight: 600; }
          .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 50px; text-align: center; }
          .meta-item { background: #f5f5f4; padding: 15px; border-radius: 8px; }
          .meta-value { font-size: 18px; font-weight: 800; color: #5D4037; }
          .meta-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #78716c; margin-top: 4px; }
          .section-title { font-size: 18px; font-weight: 800; color: #3E2723; text-transform: uppercase; margin-bottom: 25px; display: flex; items-center; gap: 10px; }
          .section-title::after { content: ''; flex: 1; height: 1px; background: #e7e5e4; }
          .skill-item { margin-bottom: 16px; page-break-inside: avoid; }
          .skill-header { display: flex; justify-content: space-between; items-baseline; margin-bottom: 4px; }
          .skill-name { font-weight: 800; font-size: 16px; color: #1c1917; }
          .skill-level { font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 4px; background: #f5f5f4; color: #57534E; }
          .skill-meta { font-size: 12px; color: #78716c; }
          .footer { position: fixed; bottom: 40px; left: 0; right: 0; text-align: center; font-size: 10px; color: #a8a29e; border-top: 1px solid #f5f5f4; padding-top: 20px; width: 100%; }
        </style>
        <div class="page-container">
          <div class="header">
            <h1 class="name">${currentUser?.name}</h1>
            <div class="role">Verified Academic Specialist</div>
          </div>

          <div class="meta-grid">
             <div class="meta-item">
               <div class="meta-value">${userSkills.length}</div>
               <div class="meta-label">Verified Skills</div>
             </div>
             <div class="meta-item">
               <div class="meta-value">Level ${userSkills.length > 5 ? '3' : '1'}</div>
               <div class="meta-label">Skill Maturity</div>
             </div>
             <div class="meta-item">
               <div class="meta-value">100%</div>
               <div class="meta-label">Verified Score</div>
             </div>
          </div>
        
          <div class="section-title">Core Competencies</div>
          ${userSkills.map(s => `
            <div class="skill-item">
              <div class="skill-header">
                <div class="skill-name">● ${s.name}</div>
                <div class="skill-level">${s.level}</div>
              </div>
              <div class="skill-meta">Verified via ${s.source} • Score: ${s.score}/150</div>
            </div>
          `).join('')}

          <div class="footer">
            Generated by Pengu AI Skill Twin • Verified on ${new Date().toLocaleDateString()} • ID: ${currentUser?.id.slice(0, 8)}
          </div>
        </div>
        `;

      const opt = {
        margin: 0,
        filename: `Pengu_Skill_Profile_${currentUser?.name.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };

      html2pdf().set(opt).from(element).save();
    });
  };
  const handleScanCoursework = async () => {
    if (!uploadFile) return;
    setScanStep('uploading');

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);

      // Upload and Scan
      const response = await api.post('/skills/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setScanStep('scanning');

      const scannedSkills = response.data;

      // Simulate AI processing delay for UX (if response is too fast)
      setTimeout(() => {
        setScanStep('complete');

        if (scannedSkills.length === 0) {
          toast.warning("No relevant skills found in this document.");
        } else {
          toast.success(`Found ${scannedSkills.length} skills!`);
          scannedSkills.forEach((skill: any) => {
            addSkill({
              ...skill,
              userId: currentUser?.id || 'u1', // ensure userId is set if backend didn't (though it does)
            });
          });
        }

        setTimeout(() => {
          setIsSubmitOpen(false);
          setScanStep('idle');
          setUploadFile(null);
        }, 2000);
      }, 1000);
    } catch (error) {
      console.error("Coursework upload failed", error);
      toast.error("Failed to upload coursework");
      setScanStep('idle');
      setUploadFile(null);
    }
  };

  const handleAddCertificate = () => {
    if (!newCert.name || !newCert.category) {
      alert("Please fill in all required fields");
      return;
    }

    addSkill({
      userId: currentUser?.id || 'u1',
      name: newCert.name,
      category: newCert.category as Skill['category'],
      level: newCert.level as Skill['level'],
      score: Number(newCert.score),
      source: newCert.source || 'Manual Entry',
      date: new Date().toISOString()
    });

    setIsAddCertOpen(false);
    setNewCert({ level: 'Intermediate', score: 85, source: 'Certificate' });
  };

  if (!isInitialized) return <div className="p-8 text-center text-stone-500">Loading your profile...</div>;

  // Filter skills for current user
  const userSkills = skills
    .filter(s => s.userId === currentUser?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Compute Radar Chart Data
  const categories: Skill['category'][] = ['Research', 'Analysis', 'Writing', 'Presentation', 'Leadership', 'Technical'];
  const skillChartData = categories.map(cat => {
    const catSkills = userSkills.filter(s => s.category === cat);
    const avgScore = catSkills.length > 0
      ? Math.round(catSkills.reduce((acc, s) => acc + s.score, 0) / catSkills.length)
      : 0;
    return { subject: cat, A: avgScore, fullMark: 150 };
  });

  // Empty State Check
  const hasSkills = userSkills.length > 0;

  const handleExportCV = () => {
    if (!hasSkills) {
      alert("No skills to export! Add some skills first.");
      return;
    }
    setIsPremiumExportOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3E2723]">Skill Twin</h1>
            <p className="text-stone-500">Your academic achievements translated into career assets.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowSWOT(!showSWOT)}>
              <Target className="mr-2 size-4" /> {showSWOT ? "Hide Analysis" : "SWOT Analysis"}
            </Button>
            <Button onClick={handleExportCV}>
              <Download className="mr-2 size-4" /> Export CV Bullets
            </Button>

            {/* Premium Export Modal */}
            <Dialog open={isPremiumExportOpen} onOpenChange={setIsPremiumExportOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Award className="size-5 text-[#5D4037]" /> Premium Skill Profile
                  </DialogTitle>
                </DialogHeader>

                <div className="bg-stone-50 p-8 rounded-xl border border-stone-200 my-4 max-h-[60vh] overflow-y-auto">
                  <div className="text-center mb-8 border-b border-stone-200 pb-4">
                    <h2 className="text-2xl font-black text-[#3E2723]">{currentUser?.name}</h2>
                    <p className="text-xs uppercase tracking-widest text-stone-500 mt-1">Verified Academic Specialist</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[#5D4037] uppercase tracking-wider">Core Competencies</h3>
                    {userSkills.map((s, i) => (
                      <div key={s.id || i} className="flex items-start gap-3">
                        <span className="text-[#5D4037] mt-1.5 size-1.5 rounded-full bg-[#5D4037]" />
                        <div>
                          <div className="font-bold text-stone-900">{s.name}</div>
                          <div className="text-xs text-stone-500">{s.level} • Verified via {s.source}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setIsPremiumExportOpen(false)}>Close</Button>
                  <Button onClick={generatePremiumPDF} className="bg-[#3E2723] hover:bg-[#5D4037]">
                    <Download className="mr-2 size-4" /> Download PDF
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {!hasSkills ? (
          <Card className="p-12 text-center space-y-4">
            <div className="size-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto">
              <Award className="size-10 text-stone-300" />
            </div>
            <h2 className="text-xl font-bold text-stone-700">No Skills Indexed Yet</h2>
            <p className="text-stone-500 max-w-md mx-auto">
              Complete assignments, research projects, or quizzes to build your dynamic Skill Twin.
              Our AI automatically extracts and verifies your competencies.
            </p>
            <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="mt-4">
                  <Plus className="mr-2 size-4" /> Submit Coursework for Scan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Submit Coursework for AI Scan</DialogTitle>
                  <DialogDescription>
                    Upload your assignments, quizzes, or project reports. Our AI will extract demonstrated skills.
                  </DialogDescription>
                </DialogHeader>

                <div className="py-6">
                  <div className={`
                    border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer relative
                    ${scanStep === 'scanning' || scanStep === 'uploading' ? 'border-amber-400 bg-amber-50' : 'border-stone-200 hover:border-stone-400 hover:bg-stone-50'}
                  `}>
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      disabled={scanStep !== 'idle'}
                    />

                    {scanStep === 'idle' && (
                      <>
                        <Upload className="mx-auto size-10 text-stone-300 mb-3" />
                        <p className="text-sm font-medium text-stone-600">
                          {uploadFile ? uploadFile.name : "Click to Upload PDF/DOCX"}
                        </p>
                      </>
                    )}

                    {scanStep === 'uploading' && (
                      <div className="flex flex-col items-center">
                        <Upload className="size-10 text-amber-500 animate-bounce mb-3" />
                        <p className="text-sm font-medium text-amber-700">Uploading file...</p>
                      </div>
                    )}

                    {scanStep === 'scanning' && (
                      <div className="flex flex-col items-center">
                        <Zap className="size-10 text-amber-500 animate-pulse mb-3" />
                        <p className="text-sm font-medium text-amber-700">Analyzing competencies...</p>
                      </div>
                    )}

                    {scanStep === 'complete' && (
                      <div className="flex flex-col items-center">
                        <Award className="size-10 text-green-500 mb-3" />
                        <p className="text-sm font-bold text-green-700">Skills Identified!</p>
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button onClick={handleScanCoursework} disabled={!uploadFile || scanStep !== 'idle'}>
                    {scanStep === 'scanning' ? 'Scanning...' : scanStep === 'uploading' ? 'Uploading...' : 'Start Scan'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Chart Section */}
            <Card className="lg:col-span-2 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-stone-700 flex items-center gap-2">
                  <Target className="text-[#5D4037]" />
                  Competency Radar
                </h3>
                <div className="text-xs font-medium bg-green-50 text-green-700 px-2 py-1 rounded">
                  UPDATING LIVE
                </div>
              </div>

              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillChartData}>
                    <PolarGrid stroke="#E7E5E4" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#57534E', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                    <Radar
                      name="My Skills"
                      dataKey="A"
                      stroke="#5D4037"
                      fill="#5D4037"
                      fillOpacity={0.6}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-stone-100 text-center">
                <div>
                  <div className="text-2xl font-bold text-[#3E2723]">{userSkills.length}</div>
                  <div className="text-xs text-stone-500 uppercase tracking-wider">Total Skills</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#3E2723]">Level {userSkills.length > 5 ? '3' : '1'}</div>
                  <div className="text-xs text-stone-500 uppercase tracking-wider">Skill Maturity</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#3E2723]">AI</div>
                  <div className="text-xs text-stone-500 uppercase tracking-wider">Verified Only</div>
                </div>
              </div>
            </Card>

            {/* SWOT / Sidebar */}
            <div className="space-y-6">
              {showSWOT ? (
                <Card className="p-6 bg-amber-50 border-amber-200">
                  <h3 className="font-bold text-amber-900 mb-4 flex items-center gap-2">
                    <Zap className="size-4" /> SWOT Analysis
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-bold text-green-700">Strengths:</span>
                      <p className="text-stone-600">Strong in {skillChartData.sort((a, b) => b.A - a.A)[0].subject}.</p>
                    </div>
                    <div>
                      <span className="font-bold text-blue-700">Opportunities:</span>
                      <p className="text-stone-600">High demand for {skillChartData.sort((a, b) => a.A - b.A)[0].subject} experts.</p>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-6 bg-[#5D4037] text-white">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg">Career Match</h3>
                      <p className="text-stone-300 text-sm">Based on your skills</p>
                    </div>
                    <Briefcase className="opacity-50" />
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                      <div className="font-bold text-sm">Academic Specialist</div>
                      <div className="text-xs text-stone-300 mt-1">Ready for high-tier projects</div>
                    </div>
                  </div>

                  <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="secondary"
                        className="w-full text-[#5D4037]"
                        disabled={isApplied || applicationStatus === 'REJECTED'}
                      >
                        {isApplied ? (applicationStatus === 'APPROVED' ? 'Application Approved' : 'Application Under Review') : 'Apply to Expert Network'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Join Pengu Expert Network</DialogTitle>
                        <DialogDescription>
                          Based on your skill profile, you are eligible to become a paid academic specialist.
                        </DialogDescription>
                      </DialogHeader>

                      {applicationStep === 'idle' && !isApplied && (
                        <div className="py-4 space-y-3 text-sm text-stone-600">
                          <p>We review your verified skills and academic history.</p>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Review timeline: 24-48 hours</li>
                            <li>Minimum requirement: Level 3 Skill Maturity (You have Level {userSkills.length > 5 ? '3' : '1'})</li>
                            <li>Starting rate: TK 500/hr</li>
                          </ul>
                        </div>
                      )}

                      {isApplied && (
                        <div className="py-8 flex flex-col items-center justify-center text-center">
                          <Award className={`size-10 mb-4 ${applicationStatus === 'APPROVED' ? 'text-green-500' : 'text-amber-500'}`} />
                          <p className={`font-bold ${applicationStatus === 'APPROVED' ? 'text-green-700' : 'text-amber-700'}`}>
                            {applicationStatus === 'APPROVED' ? 'Welcome to the Team!' : 'Application Under Review'}
                          </p>
                          <p className="text-sm text-stone-500 mt-2">
                            {applicationStatus === 'APPROVED'
                              ? 'You are now a verified expert. Access your dashboard to start.'
                              : 'Our team is reviewing your profile. You will be notified soon.'}
                          </p>
                        </div>
                      )}

                      {!isApplied && applicationStep !== 'idle' && (
                        <div className="py-8 flex flex-col items-center justify-center text-center">
                          {applicationStep === 'sending' ? (
                            <>
                              <Zap className="size-10 text-amber-500 animate-pulse mb-4" />
                              <p className="font-bold">Submitting Application...</p>
                            </>
                          ) : (
                            <>
                              <Award className="size-10 text-green-500 mb-4" />
                              <p className="font-bold text-green-700">Application Received!</p>
                              <p className="text-sm text-stone-500">Check your email for next steps.</p>
                            </>
                          )}
                        </div>
                      )}

                      <DialogFooter>
                        {!isApplied && applicationStep === 'idle' && (
                          <Button onClick={handleApplyToNetwork} className="w-full bg-[#3E2723]">
                            Confirm Application
                          </Button>
                        )}
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </Card>
              )}

              <Card className="p-6">
                <h3 className="font-bold text-stone-700 mb-4 flex items-center gap-2">
                  <Target className="text-amber-500 size-4" /> Growth Path
                </h3>
                <div className="text-sm text-stone-600">
                  Acquire 3 more <b>Technical</b> skills to reach Professional level.
                </div>
              </Card>
            </div>
          </div>
        )}

        {hasSkills && (
          <Card>
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-[#3E2723]">Verified Skills Inventory</h3>
              <div className="flex gap-2">
                <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="mr-2 size-4" /> Submit Coursework
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Submit Coursework for AI Scan</DialogTitle>
                      <DialogDescription>
                        Upload your assignments, quizzes, or project reports. Our AI will extract demonstrated skills.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="py-6">
                      <div className={`
                        border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer relative
                        ${scanStep === 'scanning' || scanStep === 'uploading' ? 'border-amber-400 bg-amber-50' : 'border-stone-200 hover:border-stone-400 hover:bg-stone-50'}
                      `}>
                        <input
                          type="file"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                          onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                          disabled={scanStep !== 'idle'}
                        />

                        {scanStep === 'idle' && (
                          <>
                            <Upload className="mx-auto size-10 text-stone-300 mb-3" />
                            <p className="text-sm font-medium text-stone-600">
                              {uploadFile ? uploadFile.name : "Click to Upload PDF/DOCX"}
                            </p>
                          </>
                        )}

                        {scanStep === 'uploading' && (
                          <div className="flex flex-col items-center">
                            <Upload className="size-10 text-amber-500 animate-bounce mb-3" />
                            <p className="text-sm font-medium text-amber-700">Uploading file...</p>
                          </div>
                        )}

                        {scanStep === 'scanning' && (
                          <div className="flex flex-col items-center">
                            <Zap className="size-10 text-amber-500 animate-pulse mb-3" />
                            <p className="text-sm font-medium text-amber-700">Analyzing competencies...</p>
                          </div>
                        )}

                        {scanStep === 'complete' && (
                          <div className="flex flex-col items-center">
                            <Award className="size-10 text-green-500 mb-3" />
                            <p className="text-sm font-bold text-green-700">Skills Identified!</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <DialogFooter>
                      <Button onClick={handleScanCoursework} disabled={!uploadFile || scanStep !== 'idle'}>
                        {scanStep === 'scanning' ? 'Scanning...' : scanStep === 'uploading' ? 'Uploading...' : 'Start Scan'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={isAddCertOpen} onOpenChange={setIsAddCertOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="default" className="bg-[#3E2723] hover:bg-[#5D4037]">
                      <Award className="mr-2 size-4" /> Add Certificate
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add Certificate / Skill</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Name</Label>
                        <Input
                          value={newCert.name || ''}
                          onChange={e => setNewCert({ ...newCert, name: e.target.value })}
                          className="col-span-3"
                          placeholder="e.g. Python Programming"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Category</Label>
                        <Select onValueChange={v => setNewCert({ ...newCert, category: v as any })}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Level</Label>
                        <Select defaultValue="Intermediate" onValueChange={v => setNewCert({ ...newCert, level: v as any })}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                            <SelectItem value="Advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Score</Label>
                        <Input
                          type="number"
                          value={newCert.score || ''}
                          onChange={e => setNewCert({ ...newCert, score: Number(e.target.value) })}
                          className="col-span-3"
                          placeholder="0-150"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddCertificate}>Add Skill</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="p-4 font-medium">Skill Name</th>
                    <th className="p-4 font-medium">Category</th>
                    <th className="p-4 font-medium">Proficiency</th>
                    <th className="p-4 font-medium">Verified Source</th>
                    <th className="p-4 font-medium">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {userSkills.map((skill, i) => (
                    <tr key={skill.id || i} className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-4 font-medium text-stone-900">{skill.name}</td>
                      <td className="p-4 text-stone-600">{skill.category}</td>
                      <td className="p-4">
                        <span className={`
                          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${skill.level === 'Advanced' ? 'bg-purple-100 text-purple-800' :
                            skill.level === 'Intermediate' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
                        `}>
                          {skill.level}
                        </span>
                      </td>
                      <td className="p-4 text-stone-500 text-sm flex items-center gap-2">
                        <Award className="size-4 text-[#5D4037]" />
                        {skill.source}
                      </td>
                      <td className="p-4 text-stone-600 font-mono text-sm">{skill.score}/150</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
