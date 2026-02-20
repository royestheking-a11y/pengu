import React, { useState, useEffect } from 'react';
import { useStore } from './store';
import { DashboardLayout } from './components/Layout';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import {
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { EmptyState } from './components/ui/EmptyState';

export default function AdminQuality() {
  const { addNotification, orders, experts, reviewDeliverable } = useStore();

  // Filter for deliverables that are in 'DELIVERED' status (waiting for QC review)
  // We look at all orders, find milestones that are 'DELIVERED'
  const pendingDeliverables = orders.flatMap(o => {
    return o.milestones
      .filter(m => m.status === 'DELIVERED')
      .map(m => {
        const expert = experts.find(e => e.id === o.expertId);
        const submissions = m.submissions || [];

        return {
          id: `${o.id}_${m.id}`,
          orderId: o.id,
          milestoneId: m.id,
          expert: expert ? expert.name : 'Unknown Expert',
          expertId: typeof o.expertId === 'object' ? o.expertId.id || o.expertId._id : o.expertId || 'unknown',
          studentId: typeof o.studentId === 'object' ? o.studentId.id || o.studentId._id : o.studentId,
          files: submissions,
          type: m.title,
          submittedAt: new Date().toISOString(), // Mock, as milestone doesn't store sub date
          status: 'pending'
        };
      });
  }).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  const [selectedItem, setSelectedItem] = useState<typeof pendingDeliverables[0] | null>(null);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [checkingPlagiarism, setCheckingPlagiarism] = useState(false);
  const [plagiarismResult, setPlagiarismResult] = useState<{ score: number, status: 'clean' | 'warning' | 'flagged' } | null>(null);

  // If selected item is no longer in pending list (e.g. processed), clear selection
  useEffect(() => {
    if (selectedItem && !pendingDeliverables.find(i => i.id === selectedItem.id)) {
      setSelectedItem(null);
      setActiveFileIndex(0);
    }
  }, [pendingDeliverables, selectedItem]);

  // Reset state when selecting a new item
  useEffect(() => {
    setActiveFileIndex(0);
    setCheckingPlagiarism(false);
    setPlagiarismResult(null);
  }, [selectedItem?.id]);

  const handlePlagiarismCheck = () => {
    setCheckingPlagiarism(true);
    // Simulate API call
    setTimeout(() => {
      const mockScore = Math.floor(Math.random() * 30);
      let status: 'clean' | 'warning' | 'flagged' = 'clean';
      if (mockScore > 20) status = 'flagged';
      else if (mockScore > 10) status = 'warning';

      setPlagiarismResult({ score: mockScore, status });
      setCheckingPlagiarism(false);

      if (status === 'clean') toast.success(`Plagiarism check passed: ${mockScore}% similarity.`);
      else if (status === 'warning') toast.warning(`Plagiarism check warning: ${mockScore}% similarity.`);
      else toast.error(`Plagiarism check failed: ${mockScore}%.`);
    }, 2000);
  };

  const handleAction = (item: typeof pendingDeliverables[0], action: 'approve' | 'reject') => {
    if (action === 'approve') {
      reviewDeliverable(item.orderId, item.milestoneId, true);
      toast.success('Milestone approved & sent to student.');
      // Notifications
      addNotification({
        userId: item.studentId,
        title: 'Deliverable Approved',
        message: `The ${item.type} for Order #${item.orderId} has been approved by Quality Control.`,
        type: 'success',
        link: `/student/order/${item.orderId}`
      });
      addNotification({
        userId: item.expertId,
        title: 'Deliverable Accepted',
        message: `Your submission for ${item.type} in Order #${item.orderId} was approved.`,
        type: 'success',
        link: `/expert/order/${item.orderId}`
      });
    } else {
      reviewDeliverable(item.orderId, item.milestoneId, false);
      toast.success('Milestone returned to expert for revision.');
      addNotification({
        userId: item.expertId,
        title: 'Revision Requested',
        message: `Quality Control returned your ${item.type} for Order #${item.orderId}. Please check comments.`,
        type: 'warning',
        link: `/expert/order/${item.orderId}`
      });
    }
    setSelectedItem(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3E2723]">Quality Control</h1>
          <p className="text-stone-500">Review deliverables before they reach the student.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List */}
          <div className="lg:col-span-1 space-y-4">
            {pendingDeliverables.length === 0 ? (
              <EmptyState
                icon={Search}
                title="All clear!"
                subtitle="No pending submissions require your review at this time. New deliverables will appear here automatically."
                compact
                className="my-4 border-dashed"
              />
            ) : (
              pendingDeliverables.map(item => (
                <Card
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-4 cursor-pointer transition-all border-l-4 ${selectedItem?.id === item.id ? 'border-l-[#5D4037] shadow-md bg-[#5D4037]/5' : 'border-l-stone-200 hover:border-l-[#5D4037]'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold px-2 py-1 rounded bg-blue-100 text-blue-600 uppercase">
                      {item.type}
                    </span>
                    <span className="text-xs text-stone-400">{format(new Date(item.submittedAt), 'h:mm a')}</span>
                  </div>
                  <h3 className="font-bold text-stone-900 mb-1">Order #{item.orderId}</h3>
                  <p className="text-sm text-stone-500 flex items-center gap-2">
                    <FileText className="size-3" /> {item.files.length} File{item.files.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-stone-400 mt-2">by {item.expert}</p>
                </Card>
              ))
            )}
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedItem ? (
                <motion.div
                  key={selectedItem.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card className="p-0 overflow-hidden flex flex-col h-[700px]">
                    <div className="bg-stone-100 p-4 border-b border-stone-200 flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="flex items-center gap-2 overflow-x-auto max-w-full">
                        {selectedItem.files.map((file, idx) => {
                          const fileName = typeof file === 'string' ? file.split('/').pop() : file.name;
                          return (
                            <button
                              key={idx}
                              onClick={() => setActiveFileIndex(idx)}
                              className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap flex items-center gap-2 transition-colors ${activeFileIndex === idx
                                ? 'bg-[#5D4037] text-white shadow-sm'
                                : 'bg-white text-stone-600 hover:bg-stone-200'
                                }`}
                            >
                              <FileText className="size-3" />
                              {fileName || 'Unknown File'}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Real Viewer */}
                    <div className="flex-1 bg-stone-200 flex items-center justify-center p-4 overflow-hidden relative">
                      {(() => {
                        const currentFile = selectedItem.files[activeFileIndex];
                        if (!currentFile) return <div className="text-stone-400">No file selected</div>;

                        // Normalize file URL — check all possible fields
                        const fileUrl: string = typeof currentFile === 'string'
                          ? currentFile
                          : (currentFile as any).url || (currentFile as any).data || '';
                        const fileName: string = typeof currentFile === 'string'
                          ? (currentFile.split('/').pop() || currentFile)
                          : (currentFile as any).name || (fileUrl.split('/').pop()) || 'file';
                        const fileFormat: string = typeof currentFile === 'string' ? '' : (currentFile as any).format || '';

                        const isImage =
                          /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName) ||
                          /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl) ||
                          fileFormat.includes('image');

                        if (isImage && fileUrl) {
                          return (
                            <img
                              src={fileUrl}
                              alt="Preview"
                              className="max-w-full max-h-full object-contain shadow-lg"
                            />
                          );
                        } else if (fileUrl) {
                          // Use Google Docs Viewer for all non-image files (PDF, DOCX, XLSX, PPTX etc.)
                          const viewerUrl = fileUrl.startsWith('http')
                            ? `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`
                            : fileUrl;
                          return (
                            <div className="w-full h-full flex flex-col">
                              <div className="flex items-center gap-2 px-3 py-2 bg-stone-900 shrink-0">
                                <FileText className="size-3.5 text-stone-400" />
                                <span className="text-[10px] text-stone-400 font-medium truncate flex-1">{fileName}</span>
                                <a href={fileUrl} target="_blank" rel="noopener noreferrer"
                                  className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 shrink-0">
                                  <Eye className="size-3" /> Open ↗
                                </a>
                              </div>
                              <iframe
                                key={viewerUrl}
                                src={viewerUrl}
                                className="w-full flex-1 border-none bg-white shadow-lg"
                                title="Document Viewer"
                                allow="fullscreen"
                              />
                            </div>
                          );
                        } else {
                          return (
                            <div className="bg-white shadow-lg p-8 text-center space-y-4 rounded-xl">
                              <FileText className="size-16 text-stone-300 mx-auto" />
                              <p className="font-bold text-stone-700">No file data available</p>
                              <p className="text-xs text-red-400">Invalid file reference</p>
                            </div>
                          );
                        }
                      })()}
                    </div>

                    {/* Controls */}
                    <div className="bg-white p-4 border-t border-stone-200 flex flex-col md:flex-row justify-between items-center gap-4">
                      {/* Plagiarism Check Section */}
                      <div className="flex items-center gap-4">
                        {checkingPlagiarism ? (
                          <div className="flex items-center gap-2 text-sm text-stone-500">
                            <Loader2 className="size-4 animate-spin text-[#5D4037]" />
                            Checking plagiarism...
                          </div>
                        ) : plagiarismResult ? (
                          <div className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full border ${plagiarismResult.status === 'clean' ? 'bg-green-50 text-green-700 border-green-200' :
                            plagiarismResult.status === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-red-50 text-red-700 border-red-200'
                            }`}>
                            {plagiarismResult.status === 'clean' ? <ShieldCheck className="size-4" /> :
                              plagiarismResult.status === 'warning' ? <AlertTriangle className="size-4" /> :
                                <AlertTriangle className="size-4" />}
                            {plagiarismResult.score}% Similarity
                            <span className="text-xs font-normal opacity-70 ml-1">
                              ({plagiarismResult.status === 'clean' ? 'Passed' : plagiarismResult.status === 'warning' ? 'Review Needed' : 'Flagged'})
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={handlePlagiarismCheck}
                            className="flex items-center gap-2 text-sm text-stone-500 hover:text-[#5D4037] transition-colors"
                          >
                            <ShieldCheck className="size-4" />
                            Check for plagiarism
                          </button>
                        )}
                      </div>

                      <div className="flex gap-3 w-full md:w-auto">
                        <Button
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50 flex-1 md:flex-none"
                          onClick={() => handleAction(selectedItem, 'reject')}
                          disabled={checkingPlagiarism}
                        >
                          <XCircle className="mr-2 size-4" /> Reject Milestone
                        </Button>
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white flex-1 md:flex-none"
                          onClick={() => handleAction(selectedItem, 'approve')}
                          disabled={checkingPlagiarism}
                        >
                          <CheckCircle className="mr-2 size-4" /> Approve Milestone
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-stone-400 border-2 border-dashed border-stone-200 rounded-xl p-12">
                  <Eye className="size-16 mb-4 opacity-20" />
                  <p>Select a deliverable to review</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
