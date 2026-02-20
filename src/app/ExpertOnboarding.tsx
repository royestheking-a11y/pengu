import React, { useState, useEffect } from 'react';
import { useStore } from './store';
import api from '../lib/api'; // Import API for uploads
import { useNavigate } from 'react-router-dom';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Textarea } from './components/ui/textarea';
import {
    Upload,
    CheckCircle,
    School,
    FileText,
    User,
    Briefcase,
    ChevronRight,
    ChevronLeft,
    Award,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export default function ExpertOnboarding() {
    const { currentUser, experts, updateExpertProfile } = useStore();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        bio: '',
        education: '',
        skills: '',
        cvFile: null as File | null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // reverse check: if already active or onboarded, go to dashboard
    useEffect(() => {
        if (currentUser) {
            if (currentUser.onboardingCompleted) {
                navigate('/expert/dashboard');
                return;
            }
            const currentExpert = experts.find(e => e.email === currentUser.email);
            if (currentExpert) {
                if (currentExpert.status === 'Active' || currentExpert.onboardingCompleted) {
                    navigate('/expert/dashboard');
                }
            }
        }
    }, [currentUser, experts, navigate]);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        } else if (currentUser.role !== 'expert') {
            // If not expert, maybe redirect to their dashboard? 
            // For now, let's just leave it or redirect to home. 
            // The original logic just returned null. 
            // Let's stick to the original intent: if not current user, go to login.
        }
    }, [currentUser, navigate]);

    if (!currentUser || currentUser.role !== 'expert') {
        return null;
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 3 * 1024 * 1024) { // 3MB limit
                toast.error('File too large', {
                    description: 'Please upload a file smaller than 3MB.'
                });
                return;
            }
            setFormData({ ...formData, cvFile: file });
        }
    };

    const handleNext = () => {
        if (step === 1) {
            if (!formData.education || !formData.bio) {
                toast.error('Please fill in all fields');
                return;
            }
            setStep(2);
        } else if (step === 2) {
            if (!formData.skills) {
                toast.error('Please add your key skills');
                return;
            }
            setStep(3);
        } else if (step === 3) {
            if (!formData.cvFile) {
                toast.error('Please upload your CV or Verification Document');
                return;
            }
            setStep(4);
        }
    };

    const handleSubmit = async () => {
        const currentExpert = experts.find(e => e.email === currentUser?.email);

        if (!currentExpert) {
            toast.error("Expert profile not found. Please try logging in again.");
            return;
        }

        setIsSubmitting(true);
        try {
            let cvUrl = '';
            if (formData.cvFile) {
                try {
                    const uploadFormData = new FormData();
                    uploadFormData.append('file', formData.cvFile);

                    const uploadResponse = await api.post('/upload', uploadFormData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });

                    cvUrl = uploadResponse.data.url;
                } catch (uploadError) {
                    console.error("File upload failed:", uploadError);
                    toast.error("Failed to upload document. Please try again.");
                    return;
                }
            }

            const skillsList = formData.skills.split(',').map(s => s.trim()).filter(s => s);

            await updateExpertProfile(currentExpert.id, {
                bio: formData.bio,
                education: formData.education,
                cvUrl: cvUrl,
                skills: skillsList,
                onboardingCompleted: true, // Mark as completed so they show up in Admin Review
                status: 'Pending' // Explicitly keep as Pending until Admin approves
            });

            toast.success('Profile submitted successfully!', {
                description: 'Admin will review your details shortly.'
            });

            // Small delay to ensure state propagates though await should handle it
            setTimeout(() => navigate('/expert/dashboard'), 500);
        } catch (error) {
            console.error("Error submitting profile:", error);
            toast.error("Failed to submit profile. Please try again.");
            setIsSubmitting(false);
        }
    };

    const steps = [
        { number: 1, title: 'Background', icon: User },
        { number: 2, title: 'Skills', icon: Award },
        { number: 3, title: 'Documents', icon: FileText },
        { number: 4, title: 'Review', icon: CheckCircle },
    ];

    return (
        <div className="min-h-screen bg-[#FDF8F6] flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                {/* Sidebar / Progress */}
                <div className="bg-[#3E2723] text-white p-8 md:w-1/3 flex flex-col justify-between">
                    <div>
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold">Expert Profile</h1>
                            <p className="text-stone-300 text-sm mt-2">Complete these steps to activate your account.</p>
                        </div>
                        <div className="space-y-6">
                            {steps.map((s) => (
                                <div key={s.number} className="flex items-center gap-3">
                                    <div className={`
                                        size-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all
                                        ${step === s.number ? 'bg-white text-[#3E2723] border-white' :
                                            step > s.number ? 'bg-green-500 border-green-500 text-white' : 'border-stone-500 text-stone-400'}
                                    `}>
                                        {step > s.number ? <CheckCircle className="size-5" /> : s.number}
                                    </div>
                                    <div>
                                        <p className={`font-bold text-sm ${step === s.number ? 'text-white' : 'text-stone-400'}`}>{s.title}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="text-xs text-stone-400 mt-8">
                        Need help? Contact support@pengu.com
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8 md:p-12 relative bg-white">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="h-full flex flex-col"
                        >
                            {step === 1 && (
                                <div className="space-y-6 flex-1">
                                    <h2 className="text-2xl font-bold text-[#3E2723] mb-6">Professional Background</h2>
                                    <div className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="education">Highest Qualification</Label>
                                            <Input
                                                id="education"
                                                placeholder="e.g. PhD in Economics"
                                                value={formData.education}
                                                onChange={e => setFormData({ ...formData, education: e.target.value })}
                                                className="bg-stone-50 border-stone-200"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="bio">Professional Bio</Label>
                                            <Textarea
                                                id="bio"
                                                placeholder="Describe your expertise..."
                                                className="h-32 bg-stone-50 border-stone-200 resize-none"
                                                value={formData.bio}
                                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6 flex-1">
                                    <h2 className="text-2xl font-bold text-[#3E2723] mb-6">Key Expertise</h2>
                                    <div className="grid gap-2">
                                        <Label htmlFor="skills">Skills (Comma separated)</Label>
                                        <Input
                                            id="skills"
                                            placeholder="e.g. Academic Writing, Data Analysis, Python"
                                            value={formData.skills}
                                            onChange={e => setFormData({ ...formData, skills: e.target.value })}
                                            className="bg-stone-50 border-stone-200"
                                        />
                                        <p className="text-xs text-stone-500">
                                            These will be displayed on your profile to potential students.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6 flex-1">
                                    <h2 className="text-2xl font-bold text-[#3E2723] mb-6">Verification Documents</h2>
                                    <div className="border-2 border-dashed border-stone-200 rounded-xl p-8 text-center hover:bg-stone-50 transition-colors cursor-pointer relative flex-1 flex flex-col items-center justify-center">
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={handleFileChange}
                                        />
                                        {formData.cvFile ? (
                                            <div className="flex flex-col items-center text-green-600">
                                                <CheckCircle className="size-12 mb-4" />
                                                <p className="font-bold text-lg">{formData.cvFile.name}</p>
                                                <p className="text-sm text-stone-400">{(formData.cvFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-stone-500">
                                                <Upload className="size-12 mb-4 text-[#5D4037]" />
                                                <p className="font-bold text-lg text-[#3E2723]">Upload CV or Proof</p>
                                                <p className="text-sm text-stone-400 mt-2">PDF, Word, or Images (JPG/PNG)</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="space-y-6 flex-1">
                                    <h2 className="text-2xl font-bold text-[#3E2723] mb-6">Review & Submit</h2>
                                    <div className="bg-stone-50 p-6 rounded-xl space-y-4 border border-stone-100">
                                        <div>
                                            <p className="text-xs text-stone-400 uppercase font-bold">Education</p>
                                            <p className="font-medium text-[#3E2723]">{formData.education}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-stone-400 uppercase font-bold">Bio</p>
                                            <p className="text-sm text-stone-600 line-clamp-3">{formData.bio}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-stone-400 uppercase font-bold">Skills</p>
                                            <div className="flex gap-2 flex-wrap mt-1">
                                                {formData.skills.split(',').map((s, i) => (
                                                    <span key={i} className="bg-white text-stone-600 px-2 py-1 rounded border border-stone-200 text-xs">
                                                        {s.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        {formData.cvFile && (
                                            <div>
                                                <p className="text-xs text-stone-400 uppercase font-bold">Document</p>
                                                <div className="flex items-center gap-2 mt-1 text-green-700 bg-green-50 p-2 rounded w-fit text-sm font-medium">
                                                    <CheckCircle className="size-3" /> {formData.cvFile.name}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="pt-8 flex justify-between items-center mt-auto border-t border-stone-100">
                                {step > 1 ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => setStep(step - 1)}
                                        className="gap-2"
                                        disabled={isSubmitting}
                                    >
                                        <ChevronLeft className="size-4" /> Back
                                    </Button>
                                ) : (
                                    <div></div> // Spacer
                                )}

                                {step < 4 ? (
                                    <Button onClick={handleNext} className="gap-2 bg-[#5D4037] hover:bg-[#3E2723]">
                                        Next Step <ChevronRight className="size-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleSubmit}
                                        className="gap-2 bg-green-600 hover:bg-green-700 px-8"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                                        {isSubmitting ? 'Submitting...' : 'Complete Profile'} <CheckCircle className="size-4" />
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </Card>
        </div>
    );
}
