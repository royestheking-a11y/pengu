import { useState } from 'react';
import { useStore } from './store';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from './components/Layout';
import { Card } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Button } from './components/ui/button';
import {
  FileText,
  Monitor,
  PenTool,
  Search,
  Briefcase,
  Linkedin,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { FileUploader } from './components/FileUploader';
import { FileAttachmentList } from './components/FileAttachmentList';
import { FileAttachment } from './store';

const SERVICES = [
  { id: 'assignment', title: 'Assignment Support', icon: FileText, desc: 'Essays, reports, coursework' },
  { id: 'practical', title: 'Practical Lab Support', icon: Monitor, desc: 'Coding, data analysis, math' },
  { id: 'presentation', title: 'Presentation Design', icon: PenTool, desc: 'PowerPoint, Canva decks' },
  { id: 'research', title: 'Research & Edit', icon: Search, desc: 'Deep research, proofreading' },
  { id: 'cv', title: 'CV & Portfolio', icon: Briefcase, desc: 'Resume building, cover letters' },
  { id: 'linkedin', title: 'LinkedIn Setup', icon: Linkedin, desc: 'Profile optimization' },
];

import { useLocation } from 'react-router-dom';

export default function NewRequest() {
  const { addRequest, currentUser } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { topic?: string, deadline?: string, serviceType?: string } | null;

  const [step, setStep] = useState(locationState ? 2 : 1);

  // Helper to safely format date for input
  const getFormattedDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  const [formData, setFormData] = useState({
    serviceType: locationState?.serviceType || '',
    topic: locationState?.topic || '',
    details: '',
    deadline: getFormattedDate(locationState?.deadline),
    files: [] as string[],
    attachments: [] as FileAttachment[]
  });

  const handleServiceSelect = (id: string) => {
    setFormData({ ...formData, serviceType: id });
    setStep(2);
  };

  const handleSubmit = () => {
    if (!formData.topic || !formData.deadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    addRequest({
      studentId: currentUser?.id || 'u1',
      serviceType: SERVICES.find(s => s.id === formData.serviceType)?.title || formData.serviceType,
      topic: formData.topic,
      details: formData.details,
      deadline: formData.deadline,
      files: formData.files,
      attachments: formData.attachments
    });

    toast.success('Request submitted successfully!');
    navigate('/student/dashboard');
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto py-8">
        {/* Progress Stepper */}
        <div className="flex items-center justify-between mb-8 px-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`
                size-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors
                ${step >= s ? 'bg-[#5D4037] text-white' : 'bg-stone-200 text-stone-500'}
              `}>
                {step > s ? <Check className="size-5" /> : s}
              </div>
              {s < 3 && <div className={`w-24 h-1 mx-4 ${step > s ? 'bg-[#5D4037]' : 'bg-stone-200'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-[#3E2723]">What do you need help with?</h1>
                <p className="text-stone-500">Select a service to get started.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SERVICES.map((service) => (
                  <Card
                    key={service.id}
                    onClick={() => handleServiceSelect(service.id)}
                    className="p-6 cursor-pointer hover:border-[#5D4037] hover:bg-[#5D4037]/5 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-stone-100 rounded-lg group-hover:bg-white group-hover:text-[#5D4037] transition-colors">
                        <service.icon className="size-6 text-stone-600 group-hover:text-[#5D4037]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-stone-900">{service.title}</h3>
                        <p className="text-sm text-stone-500">{service.desc}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-[#3E2723]">Tell us the details</h1>
                <p className="text-stone-500">The more info, the better the quote.</p>
              </div>

              <Card className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label>Topic / Title</Label>
                  <Input
                    placeholder="e.g. Essay on Climate Change"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Deadline</Label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Instructions & Requirements</Label>
                  <textarea
                    className="w-full min-h-[150px] p-3 rounded-md border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
                    placeholder="Paste your assignment prompt, rubric details, or specific questions here..."
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Attachments</Label>
                    <span className="text-xs text-stone-500">{formData.files.length} files attached</span>
                  </div>

                  <FileUploader
                    autoUpload={true}
                    onUploadComplete={(attachments) => {
                      setFormData(prev => ({
                        ...prev,
                        files: [...prev.files, ...attachments.map(a => a.name)],
                        attachments: [...prev.attachments, ...attachments]
                      }));
                    }}
                  />

                  {formData.attachments.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {formData.attachments.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs group">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileText className="size-3 text-stone-400 shrink-0" />
                            <span className="truncate text-stone-700">{file.name}</span>
                          </div>
                          <button
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                files: prev.files.filter((_, i) => i !== idx),
                                attachments: prev.attachments.filter((_, i) => i !== idx)
                              }));
                            }}
                            className="text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft className="mr-2 size-4" /> Back
                  </Button>
                  <Button onClick={() => setStep(3)}>
                    Next Step <ArrowRight className="ml-2 size-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-[#3E2723]">Review & Submit</h1>
                <p className="text-stone-500">Confirm everything is correct.</p>
              </div>

              <Card className="p-8 space-y-6">
                <div className="bg-stone-50 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Service</span>
                    <span className="font-medium text-[#3E2723] uppercase">{formData.serviceType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Topic</span>
                    <span className="font-medium text-[#3E2723]">{formData.topic}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Deadline</span>
                    <span className="font-medium text-[#3E2723]">{formData.deadline}</span>
                  </div>
                  {formData.files.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-stone-500">Attachments</span>
                      <span className="font-medium text-[#3E2723]">{formData.files.length} files</span>
                    </div>
                  )}
                </div>

                {(formData.attachments.length > 0 || formData.files.length > 0) && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Attached Files</h4>
                    <FileAttachmentList files={formData.attachments.length > 0 ? formData.attachments : formData.files} />
                  </div>
                )}

                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 flex gap-3">
                  <div className="p-2 bg-amber-100 rounded-full h-fit">
                    <Check className="size-4 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-900 text-sm">What happens next?</h4>
                    <p className="text-amber-800 text-xs mt-1">
                      An admin will review your request and send a custom quote within 24 hours. You can negotiate the price and scope before paying.
                    </p>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    <ArrowLeft className="mr-2 size-4" /> Back
                  </Button>
                  <Button onClick={handleSubmit} className="px-8">
                    Submit Request
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
