import React, { useState } from 'react';
import { useStore, Request } from './store';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from './components/Layout';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import {
  FileText,
  Clock,
  MessageSquare,
  CheckCircle,
  Upload,
  AlertTriangle,
  ChevronLeft,
  Calendar,
  Paperclip,
  Pin,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import ChatInterface from './components/ChatInterface';
import { FileUploader } from './components/FileUploader';
import { FileAttachmentList } from './components/FileAttachmentList';
import { FileAttachment } from './store';
import { getCleanFileName } from './lib/fileUtils';

export default function ExpertOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const { orders, requests, quotes, commissionRate, currentUser, submitMilestone, reviews, updateOrder } = useStore();
  const order = orders.find(o => o.id === id);
  // Ensure request is correctly found even if requestId is populated as an object
  const requestIdStr = typeof order?.requestId === 'object'
    ? (order.requestId as any)._id || (order.requestId as any).id
    : order?.requestId;

  const request = requests.find(r => r.id === requestIdStr) ||
    (typeof order?.requestId === 'object' ? order.requestId as unknown as Request : undefined);

  const existingReview = reviews.find(r => r.orderId === order?.id);

  // Calculate Expert Payout (Net Amount)
  // Reliability Update: Use order.amount directly since it's the source of truth for the transaction
  const orderAmount = order?.amount || 0;
  // Expert sees: Total - Commission
  const expertPayout = Math.round(orderAmount * (1 - commissionRate / 100));

  const safeFormatDate = (dateStr: string | undefined | null, fallbackStr: string | undefined | null = null, formatStr: string = 'PP') => {
    const targetDate = dateStr || fallbackStr;
    if (!targetDate) return 'TBD';
    try {
      const d = new Date(targetDate);
      if (isNaN(d.getTime())) return 'TBD';
      return format(d, formatStr);
    } catch (e) {
      return 'TBD';
    }
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'workspace' | 'revisions' | 'messages'>('overview');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);

  const [uploadedFiles, setUploadedFiles] = useState<FileAttachment[]>([]);

  if (!order) return <DashboardLayout><div className="p-8 text-stone-500">Order not found</div></DashboardLayout>;

  const handleSubmitMilestone = (milestoneId: string) => {
    // Submit only the URLs to matches the order schema
    const fileUrls = uploadedFiles.map(f => f.url);
    submitMilestone(order.id, milestoneId, fileUrls);
    toast.success('Files submitted for Quality Control review.');
    setUploadedFiles([]);
    setSelectedMilestoneId(null);
  };

  const handleToggleAnnotationResolve = (annotationId: string) => {
    if (!order.annotations) return;
    const updatedAnnotations = order.annotations.map(anno =>
      anno.id === annotationId ? { ...anno, resolved: !anno.resolved } : anno
    );
    updateOrder(order.id, { annotations: updatedAnnotations });
    const isResolvedNow = updatedAnnotations.find(a => a.id === annotationId)?.resolved;
    toast.success(isResolvedNow ? 'Point marked as done.' : 'Point marked as pending.');
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Link to="/expert/dashboard" className="text-sm text-stone-500 hover:text-[#5D4037] flex items-center gap-1 mb-4">
            <ChevronLeft className="size-4" /> Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-[#3E2723] break-all max-w-full">Order #{order.id}</h1>
                <span className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap ${order.status === 'Review' ? 'bg-amber-100 text-amber-800' :
                  order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                  {order.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-stone-500 text-sm sm:text-lg truncate">{request?.topic || order.topic}</p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="text-left md:text-right">
                <p className="text-[10px] text-stone-400 uppercase font-bold">Deadline</p>
                <p className="font-bold text-stone-900 text-xs sm:text-sm">{safeFormatDate(request?.deadline)}</p>
              </div>
              <div className="text-left md:text-right border-l md:border-l-0 pl-4 md:pl-0">
                <p className="text-[10px] text-stone-400 uppercase font-bold">Payout</p>
                <p className="font-bold text-green-600 text-xs sm:text-sm">TK {expertPayout.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-stone-200">
          <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview', icon: FileText },
              { id: 'workspace', name: 'Workspace & Submission', icon: Upload },
              { id: 'revisions', name: 'Revision Points', icon: Pin },
              { id: 'messages', name: 'Admin Support', icon: MessageSquare },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  group inline-flex items-center py-4 px-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors relative
                  ${activeTab === tab.id
                    ? 'border-[#5D4037] text-[#5D4037]'
                    : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'}
                `}
              >
                <tab.icon className={`mr-2 size-4 ${activeTab === tab.id ? 'text-[#5D4037]' : 'text-stone-400'}`} />
                {tab.name}
                {tab.id === 'revisions' && order.annotations && order.annotations.filter(a => !a.resolved).length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-rose-500 text-white text-[10px] rounded-full font-bold">
                    {order.annotations.filter(a => !a.resolved).length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <div className="md:col-span-2 space-y-6">
                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-4 text-[#5D4037]">Requirements</h3>
                  <div className="prose prose-stone max-w-none text-sm bg-stone-50 p-6 rounded-xl border border-stone-200">
                    <p className="whitespace-pre-wrap">{request?.details || order.topic}</p>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-4 text-[#5D4037] flex items-center gap-2">
                    <Paperclip className="size-5" /> Student Attachments
                  </h3>
                  <FileAttachmentList files={request?.attachments && request.attachments.length > 0 ? request.attachments : request?.files || []} />
                </Card>

                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-4 text-[#5D4037]">Milestones</h3>
                  <div className="space-y-4">
                    {order.milestones.map((milestone, index) => (
                      <div key={milestone.id || index} className="flex flex-col sm:flex-row sm:items-center p-4 border border-stone-100 rounded-lg hover:bg-stone-50 transition-colors gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className={`
                            size-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0
                            ${milestone.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-stone-200 text-stone-500'}
                          `}>
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-stone-900 truncate">{milestone.title}</h4>
                            <p className="text-xs text-stone-500 mb-2">Due: {safeFormatDate(milestone.dueDate, request?.deadline)}</p>
                            {milestone.submissions && milestone.submissions.length > 0 && (
                              <FileAttachmentList files={milestone.submissions} className="mt-2" />
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-50">
                          <span className={`
                            px-3 py-1 rounded text-[10px] font-bold uppercase whitespace-nowrap block text-center
                            ${milestone.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                              milestone.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' :
                                milestone.status === 'DELIVERED' ? 'bg-blue-100 text-blue-700' : 'bg-stone-100 text-stone-500'}
                          `}>
                            {milestone.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}

                    {order.status === 'COMPLETED' && (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-100 flex items-center gap-4">
                        <div className="size-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="size-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-green-900">Order Completed</h4>
                          <p className="text-xs text-green-700">Great work! This order is complete. Your payout of <span className="font-bold">TK {expertPayout.toLocaleString()}</span> is being processed.</p>
                        </div>
                      </div>
                    )}

                    {/* Review Display for Expert */}
                    {existingReview && (
                      <div className="mt-6 pt-6 border-t border-stone-100">
                        <h3 className="font-bold text-stone-900 mb-4">Student Feedback</h3>
                        <div className="p-6 bg-white rounded-xl border border-stone-200 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex text-amber-400">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className={`size-4 ${s <= existingReview.rating ? 'fill-current' : 'text-stone-300'}`} />
                              ))}
                            </div>
                            <span className="text-sm font-bold text-stone-700">
                              {existingReview.rating}/5 Rating
                            </span>
                          </div>
                          <p className="text-stone-600 italic">"{existingReview.text}"</p>
                          <div className="mt-3">
                            <span className="text-xs text-stone-400">Received on {safeFormatDate(existingReview.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>


              </div>

              <div className="space-y-6">
                <Card className="p-6 bg-[#3E2723] text-white">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <AlertTriangle className="text-yellow-400 size-5" /> Important
                  </h3>
                  <ul className="text-sm space-y-3 text-stone-300 list-disc pl-4">
                    <li>Follow APA 7th edition strictly.</li>
                    <li>Do not share personal contact info.</li>
                    <li>Submit drafts 24h before deadline.</li>
                  </ul>
                </Card>

                <Card className="p-6">
                  <h3 className="font-bold text-stone-900 mb-4">Student Info</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="size-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 font-bold">
                      S
                    </div>
                    <div>
                      <p className="font-bold text-sm">Student #{typeof order.studentId === 'object' ? (order.studentId as any)._id || (order.studentId as any).id : (order.studentId || request?.studentId || 'N/A')}</p>
                      <p className="text-xs text-stone-500">Verified User</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab('messages')}>
                    Message Admin
                  </Button>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === 'workspace' && (
            <motion.div
              key="workspace"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-4">
                  <h3 className="font-bold text-stone-900">Select Milestone</h3>
                  {order.milestones.map((milestone, index) => (
                    <button
                      key={milestone.id || index}
                      onClick={() => setSelectedMilestoneId(milestone.id)}
                      disabled={milestone.status === 'APPROVED'}
                      className={`
                          w-full text-left p-4 rounded-xl border transition-all
                          ${selectedMilestoneId === milestone.id
                          ? 'bg-[#5D4037] text-white border-[#5D4037] shadow-md'
                          : 'bg-white border-stone-200 hover:border-[#5D4037]/50 text-stone-600'}
                          ${milestone.status === 'APPROVED' ? 'opacity-50 cursor-not-allowed bg-stone-50' : ''}
                        `}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold">{milestone.title}</span>
                        {milestone.status === 'APPROVED' && <CheckCircle className="size-4" />}
                        {milestone.status === 'DELIVERED' && <Clock className="size-4 text-blue-500" />}
                      </div>
                      <p className={`text-xs ${selectedMilestoneId === milestone.id ? 'text-stone-300' : 'text-stone-400'}`}>
                        Due: {safeFormatDate(milestone.dueDate, request?.deadline, 'MMM d')}
                      </p>
                      {milestone.status === 'DELIVERED' && (
                        <span className="text-[10px] text-blue-500 font-medium block mt-1">Under Review</span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="md:col-span-2">
                  <Card className="p-6 h-full flex flex-col">
                    {selectedMilestoneId ? (
                      (() => {
                        const selectedMilestone = order.milestones.find(m => m.id === selectedMilestoneId);
                        const isDelivered = selectedMilestone?.status === 'DELIVERED';

                        return (
                          <>
                            <div className="mb-6 pb-6 border-b border-stone-100">
                              <h3 className="font-bold text-lg text-[#3E2723] mb-1">
                                {isDelivered ? 'Submitted Deliverables' : `Submission for ${selectedMilestone?.title}`}
                              </h3>
                              <p className="text-sm text-stone-500">
                                {isDelivered
                                  ? 'These files have been sent for Quality Control review.'
                                  : 'Upload your files below. Submissions will be sent to QC before the student.'}
                              </p>
                            </div>

                            <div className="flex-1">
                              {!isDelivered && order.status !== 'COMPLETED' ? (
                                <FileUploader
                                  onUploadComplete={(newFiles) => {
                                    setUploadedFiles(prev => [...prev, ...newFiles]);
                                    toast.success(`${newFiles.length} files attached.`);
                                  }}
                                  className="h-48 mb-6"
                                />
                              ) : (
                                <div className="p-8 bg-stone-50 rounded-xl border border-dashed border-stone-200 flex flex-col items-center justify-center text-center mb-6">
                                  <div className="size-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                                    <CheckCircle className="size-6 text-green-600" />
                                  </div>
                                  <h4 className="font-bold text-stone-900">Submission Received</h4>
                                  <p className="text-xs text-stone-500 mt-1">Status: pending review from QC team</p>
                                </div>
                              )}

                              {(uploadedFiles.length > 0 || (isDelivered && selectedMilestone?.submissions)) && (
                                <div className="space-y-3">
                                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                                    {isDelivered ? 'Submitted Files' : 'Pending Submission'}
                                  </h4>
                                  <FileAttachmentList
                                    files={isDelivered ? (selectedMilestone?.submissions || []) : uploadedFiles}
                                  />
                                </div>
                              )}
                            </div>

                            {!isDelivered && order.status !== 'COMPLETED' && (
                              <div className="pt-6 mt-6 border-t border-stone-100 flex justify-end gap-2">
                                <Button variant="outline" onClick={() => {
                                  setUploadedFiles([]);
                                  setSelectedMilestoneId(null);
                                }}>
                                  Cancel
                                </Button>
                                <Button
                                  disabled={uploadedFiles.length === 0}
                                  onClick={() => handleSubmitMilestone(selectedMilestoneId)}
                                >
                                  Submit for Review
                                </Button>
                              </div>
                            )}
                            {order.status === 'COMPLETED' && (
                              <div className="pt-6 mt-6 border-t border-stone-100 flex justify-end gap-2">
                                <div className="flex items-center gap-3">
                                  {selectedMilestone?.status === 'APPROVED' ? (
                                    <div className="size-8 rounded-full bg-green-100 flex items-center justify-center">
                                      <CheckCircle className="size-4 text-green-600" />
                                    </div>
                                  ) : (
                                    <div className="size-8 rounded-full bg-stone-100 flex items-center justify-center">
                                      <Clock className="size-4 text-stone-400" />
                                    </div>
                                  )}
                                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${selectedMilestone?.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {selectedMilestone?.status}
                                  </span>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-stone-400">
                        <Upload className="size-16 mb-4 opacity-20" />
                        <p>Select a pending milestone to begin submission</p>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'revisions' && (
            <motion.div
              key="revisions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {!order.annotations || order.annotations.length === 0 ? (
                <div className="text-center py-20 bg-stone-50 border border-dashed border-stone-200 rounded-2xl">
                  <div className="size-16 rounded-full bg-stone-100 mx-auto mb-4 flex items-center justify-center">
                    <Pin className="size-8 text-stone-300" />
                  </div>
                  <h3 className="font-bold text-stone-700 text-lg mb-1">No Revision Points Yet</h3>
                  <p className="text-stone-400 text-sm">When QC or the admin annotates your submitted files, they will appear here.</p>
                </div>
              ) : (
                <div className="flex flex-col h-[700px] border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xl">
                  {/* Review Studio Header */}
                  <div className="bg-[#3E2723] text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between shrink-0 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-lg">
                        <Star className="size-5 text-amber-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold">Revision Points</h2>
                        <p className="text-xs text-stone-400 font-medium">Interactive Feedback</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 justify-between sm:justify-end w-full sm:w-auto">
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Total Points</p>
                        <p className="text-sm font-bold text-amber-400">{order.annotations.length}</p>
                      </div>
                      {(order.status === 'Review' || order.status === 'IN_PROGRESS') && (
                        <Button
                          size="sm"
                          className={`h-9 px-4 text-xs font-bold transition-all shadow-lg ${order.revisionsResolved ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-amber-500 hover:bg-amber-600 text-[#3E2723]'}`}
                          onClick={() => {
                            const newStatus = !order.revisionsResolved;
                            updateOrder(order.id, { revisionsResolved: newStatus });
                            toast.success(newStatus ? 'Revisions marked as resolved.' : 'Revision status reset.');
                          }}
                        >
                          {order.revisionsResolved ? (
                            <><CheckCircle className="mr-2 size-4" /> Revised Done</>
                          ) : (
                            'Mark as Resolved'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                    {/* Sidebar - File Selector */}
                    <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-stone-100 bg-stone-50 overflow-x-auto md:overflow-y-auto">
                      <div className="p-4 border-b border-stone-100 bg-white sticky top-0 z-10 hidden md:block">
                        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Files with Feedback</h3>
                      </div>
                      <div className="p-2 flex md:flex-col gap-1 min-w-max md:min-w-0">
                        {(() => {
                          const groups: Record<string, number> = {};
                          order.annotations.forEach(a => groups[a.fileUrl] = (groups[a.fileUrl] || 0) + 1);
                          return Object.entries(groups).map(([fileUrl, count]) => (
                            <button
                              key={fileUrl}
                              onClick={() => {
                                setSelectedFileUrl(fileUrl);
                                setSelectedAnnotationId(null);
                              }}
                              className={`text-left p-3 rounded-lg transition-all flex items-center justify-between gap-3 shrink-0 md:shrink ${selectedFileUrl === fileUrl || (!selectedFileUrl && Object.keys(groups)[0] === fileUrl) ? 'bg-[#5D4037] text-white shadow-md' : 'hover:bg-white text-stone-600'}`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className={`size-4 shrink-0 ${(selectedFileUrl === fileUrl || (!selectedFileUrl && Object.keys(groups)[0] === fileUrl)) ? 'text-amber-400' : 'text-stone-400'}`} />
                                <span className="text-xs sm:text-sm font-medium truncate max-w-[100px] md:max-w-none">{fileUrl.split('/').pop() || fileUrl}</span>
                              </div>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${(selectedFileUrl === fileUrl || (!selectedFileUrl && Object.keys(groups)[0] === fileUrl)) ? 'bg-amber-500 text-[#3E2723]' : 'bg-stone-200 text-stone-500'}`}>{count}</span>
                            </button>
                          ));
                        })()}
                      </div>
                    </div>

                    {/* Main Canvas Area */}
                    <div className="flex-1 bg-stone-100 relative overflow-hidden flex flex-col">
                      {(() => {
                        const currentFileUrl = selectedFileUrl || order.annotations?.[0]?.fileUrl;
                        if (!currentFileUrl) return null;

                        const fileAnnotations = order.annotations.filter(a => a.fileUrl === currentFileUrl);

                        // Resolve the file from all possible sources
                        const allFiles: (FileAttachment | string)[] = [
                          ...(request?.attachments || []),
                          ...(request?.files || []),
                          ...(order.attachments || []),
                          ...(order.files || [])
                        ];
                        order.milestones.forEach(m => {
                          if (m.submissions) allFiles.push(...m.submissions);
                        });

                        const matchingFile = allFiles.find(f => getCleanFileName(f) === currentFileUrl);
                        let imgSrc: string | null = null;

                        if (matchingFile) {
                          if (typeof matchingFile === 'string') {
                            imgSrc = matchingFile;
                          } else {
                            imgSrc = matchingFile.data || matchingFile.url || null;
                          }
                        }

                        // Fallback: if the currentFileUrl itself looks like a URL
                        if (!imgSrc && (currentFileUrl.startsWith('http') || currentFileUrl.startsWith('/uploads'))) {
                          imgSrc = currentFileUrl;
                        }

                        const fileName = currentFileUrl;
                        const isImage = imgSrc && /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
                        const isPDF = imgSrc && (
                          /\.pdf$/i.test(fileName) ||
                          /\/pdf\//i.test(imgSrc) ||
                          /\.pdf/i.test(imgSrc) ||
                          /format.*pdf/i.test(imgSrc)
                        );
                        const viewerUrl = isPDF && imgSrc && imgSrc.startsWith('http')
                          ? `https://docs.google.com/gview?url=${encodeURIComponent(imgSrc)}&embedded=true`
                          : imgSrc;

                        return (
                          <div className="flex grow overflow-hidden">
                            <div className="flex-1 flex flex-col overflow-hidden">
                              {/* Toolbar */}
                              <div className="bg-white border-b border-stone-200 px-4 py-2 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-stone-900 truncate max-w-[200px]">{fileName}</span>
                                  <span className="text-[10px] text-stone-400 font-bold tracking-tight">• {fileAnnotations.length} points</span>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] text-stone-400 uppercase font-bold tracking-widest">
                                  {imgSrc && (
                                    <a href={imgSrc} target="_blank" rel="noopener noreferrer"
                                      className="text-[#5D4037] hover:text-[#3E2723] flex items-center gap-1 normal-case font-bold text-xs">
                                      Open file ↗
                                    </a>
                                  )}
                                  <span>Interactive Mode</span>
                                </div>
                              </div>

                              {/* Viewport */}
                              <div className="flex-1 overflow-auto p-4 md:p-12 flex items-center justify-center bg-stone-100">
                                {isImage && imgSrc ? (
                                  <div className="relative shadow-2xl bg-white ring-1 ring-stone-300">
                                    <img
                                      src={imgSrc}
                                      alt="Asset Preview"
                                      className="max-w-none block"
                                      style={{ maxHeight: 'calc(100vh - 350px)' }}
                                    />
                                    {fileAnnotations.map((anno, idx) => (
                                      <button
                                        key={anno.id}
                                        onClick={() => setSelectedAnnotationId(anno.id)}
                                        className={`absolute group cursor-pointer transition-all z-20 hover:scale-125 focus:outline-none ${selectedAnnotationId === anno.id ? 'scale-125 z-30' : ''}`}
                                        style={{ left: `${anno.x}%`, top: `${anno.y}%`, transform: 'translate(-50%, -50%)' }}
                                      >
                                        <div className={`size-8 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-xs font-bold transition-all ${selectedAnnotationId === anno.id ? 'bg-rose-500 text-white scale-110' : anno.resolved ? 'bg-green-600 text-white opacity-80' : 'bg-[#3E2723] text-white opacity-90'}`}>
                                          {anno.resolved ? <CheckCircle className="size-4" /> : idx + 1}
                                        </div>
                                        {selectedAnnotationId !== anno.id && (
                                          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 p-2 bg-white rounded-lg shadow-xl border border-stone-100 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-normal text-left z-40">
                                            <p className="text-[10px] text-stone-600 line-clamp-2">{anno.text}</p>
                                          </div>
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                ) : isPDF && viewerUrl ? (
                                  <div className="w-full h-full relative flex flex-col" style={{ minHeight: '400px' }}>
                                    <iframe
                                      key={viewerUrl}
                                      src={viewerUrl}
                                      className="w-full flex-1 border-none rounded-lg shadow-xl"
                                      title={fileName}
                                      allow="fullscreen"
                                      style={{ minHeight: '400px' }}
                                    />
                                    {/* Annotation pins overlaid on PDF */}
                                    {fileAnnotations.map((anno, idx) => (
                                      <button
                                        key={anno.id}
                                        onClick={() => setSelectedAnnotationId(anno.id)}
                                        className={`absolute group cursor-pointer transition-all z-20 hover:scale-125 focus:outline-none ${selectedAnnotationId === anno.id ? 'scale-125 z-30' : ''}`}
                                        style={{ left: `${anno.x}%`, top: `${anno.y}%`, transform: 'translate(-50%, -50%)' }}
                                      >
                                        <div className={`size-8 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-xs font-bold transition-all ${selectedAnnotationId === anno.id ? 'bg-rose-500 text-white scale-110' : anno.resolved ? 'bg-green-600 text-white opacity-80' : 'bg-[#3E2723] text-white opacity-90'}`}>
                                          {anno.resolved ? <CheckCircle className="size-4" /> : idx + 1}
                                        </div>
                                        {selectedAnnotationId !== anno.id && (
                                          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 p-2 bg-white rounded-lg shadow-xl border border-stone-100 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-normal text-left z-40">
                                            <p className="text-[10px] text-stone-600 line-clamp-2">{anno.text}</p>
                                          </div>
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="p-10 bg-white rounded-3xl shadow-xl flex flex-col items-center gap-4 text-center max-w-sm">
                                    <div className="size-20 bg-stone-100 rounded-3xl flex items-center justify-center">
                                      <FileText className="size-10 text-stone-300" />
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-stone-700">No Visual Preview</h4>
                                      <p className="text-sm text-stone-500 mt-1">This file type can't be previewed here. Review the feedback points in the panel on the right.</p>
                                      {imgSrc && (
                                        <a href={imgSrc} target="_blank" rel="noopener noreferrer"
                                          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-[#3E2723] text-white text-xs font-bold rounded-xl hover:bg-[#5D4037] transition-all">
                                          Open File ↗
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Detail Panel */}
                            <div className="w-80 border-l border-stone-200 bg-white overflow-y-auto hidden md:block">
                              <div className="p-4 border-b border-stone-100 sticky top-0 bg-white z-10">
                                <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Feedback List</h3>
                              </div>
                              <div className="p-3 space-y-3">
                                {fileAnnotations.map((anno, idx) => (
                                  <div
                                    key={anno.id}
                                    id={`anno-${anno.id}`}
                                    onClick={() => setSelectedAnnotationId(anno.id)}
                                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${selectedAnnotationId === anno.id ? 'border-rose-500 bg-rose-50 ring-1 ring-rose-300 shadow-md' : 'border-stone-100 hover:border-stone-200 bg-stone-50/50'}`}
                                  >
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                      <div className="flex items-center gap-2">
                                        <span className={`size-6 rounded-full flex items-center justify-center text-[10px] font-bold ${selectedAnnotationId === anno.id ? 'bg-rose-500 text-white' : anno.resolved ? 'bg-green-600 text-white' : 'bg-[#3E2723] text-white'}`}>
                                          {anno.resolved ? <CheckCircle className="size-3" /> : idx + 1}
                                        </span>
                                        <span className="text-[10px] text-stone-400 font-bold tracking-tighter">{safeFormatDate(anno.timestamp, null, 'p')}</span>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className={`h-6 w-auto px-2 text-[9px] font-bold rounded-full transition-all ${anno.resolved ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleToggleAnnotationResolve(anno.id);
                                        }}
                                      >
                                        {anno.resolved ? 'Done' : 'Mark as Done'}
                                      </Button>
                                    </div>
                                    <p className="text-sm text-stone-700 leading-relaxed font-semibold">"{anno.text || 'No comment provided'}"</p>
                                    <div className="mt-3 flex items-center gap-1.5">
                                      <div className="text-[9px] px-2 py-0.5 bg-stone-200/60 text-stone-500 rounded-full font-bold">X: {anno.x.toFixed(0)}%</div>
                                      <div className="text-[9px] px-2 py-0.5 bg-stone-200/60 text-stone-500 rounded-full font-bold">Y: {anno.y.toFixed(0)}%</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'messages' && (
            <motion.div
              key="messages"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="max-w-3xl mx-auto">
                <ChatInterface
                  threadId={`${order.id}:expert`}
                  expertName="Admin Support"
                  expertAvatar="AS"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div >
    </DashboardLayout >
  );
}
