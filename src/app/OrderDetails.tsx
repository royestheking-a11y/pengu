import React, { useState } from 'react';
import { useStore, Order, Milestone, Request } from './store';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from './components/Layout';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import {
  FileText,
  Clock,
  MessageSquare,
  CheckCircle,
  Upload,
  Download,
  AlertCircle,
  MoreVertical,
  Pin,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import ChatInterface from './components/ChatInterface';
import { FileUploader } from './components/FileUploader';
import { FileAttachmentList } from './components/FileAttachmentList';
import { ReviewStudio } from './components/ReviewStudio';
import { EmptyState } from './components/ui/EmptyState';

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const { orders, requests, currentUser, reviews, submitReview, updateOrder } = useStore();
  const order = orders.find(o => o.id === id);
  const requestIdStr = typeof order?.requestId === 'object'
    ? (order.requestId as any)._id || (order.requestId as any).id
    : order?.requestId;

  const request = requests.find(r => r.id === requestIdStr) ||
    (typeof order?.requestId === 'object' ? order.requestId as unknown as Request : undefined);

  // Review State
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [activeTab, setActiveTab] = useState<'timeline' | 'review' | 'files' | 'messages'>('timeline');

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

  const existingReview = reviews.find(r => r.orderId === order?.id);

  const handleSubmitReview = () => {
    if (!order || !request || rating === 0) return;

    submitReview({
      orderId: order.id,
      studentId: currentUser?.id || '',
      expertId: typeof order.expertId === 'object' ? (order.expertId as any).id || (order.expertId as any)._id : order.expertId || '',
      rating,
      text: reviewText
    });
    toast.success('Review submitted successfully!');
  };

  if (!order) return <DashboardLayout><div>Order not found</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-[#3E2723] break-all max-w-full">Order #{order.id}</h1>
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-[10px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                {order.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-stone-500 text-xs sm:text-sm flex items-center gap-2">
              <Clock className="size-3.5 sm:size-4" /> Next Deadline: {(() => {
                const nextMilestone = order.milestones.find(m => m.status === 'PENDING');
                return safeFormatDate(nextMilestone?.dueDate, request?.deadline);
              })()}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-9 text-xs" onClick={() => setActiveTab('messages')}>
              <MessageSquare className="mr-2 size-4" /> <span className="whitespace-nowrap">Support</span>
            </Button>
            <Button size="sm" className="flex-1 sm:flex-none h-9 text-xs" onClick={() => setActiveTab('files')}>
              <Upload className="mr-2 size-4" /> <span className="whitespace-nowrap">Upload Files</span>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-stone-200 overflow-x-auto">
          <nav className="-mb-px flex space-x-8 min-w-max px-1" aria-label="Tabs">
            {[
              { id: 'timeline', name: 'Timeline & Progress', icon: Clock },
              { id: 'messages', name: 'Messages', icon: MessageSquare },
              { id: 'review', name: 'Review Studio', icon: FileText },
              { id: 'files', name: 'All Files', icon: Download },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-[#5D4037] text-[#5D4037]'
                    : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'}
                `}
              >
                <tab.icon className={`mr-2 size-5 ${activeTab === tab.id ? 'text-[#5D4037]' : 'text-stone-400'}`} />
                {tab.name}
                {tab.id === 'review' && order.annotations && order.annotations.filter(a => !a.resolved).length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-rose-500 text-white text-[10px] rounded-full font-bold transition-all animate-in zoom-in">
                    {order.annotations.filter(a => !a.resolved).length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <div className="md:col-span-2 space-y-6">
                <Card className="p-8">
                  <h3 className="font-bold text-lg mb-6 text-[#3E2723]">Milestone Progress</h3>
                  <div className="relative border-l-2 border-stone-200 ml-4 space-y-12 pb-4">
                    {order.milestones.map((milestone, index) => (
                      <div key={milestone.id || index} className="relative pl-8">
                        {/* Dot */}
                        <div className={`
                          absolute -left-[9px] top-1 size-4 rounded-full border-2 border-white shadow-sm
                          ${milestone.status === 'APPROVED' ? 'bg-green-500' :
                            milestone.status === 'IN_PROGRESS' ? 'bg-amber-500 animate-pulse' : 'bg-stone-300'}
                        `} />

                        <div className="flex flex-wrap md:flex-nowrap items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-stone-900 truncate">{milestone.title}</h4>
                            <p className="text-sm text-stone-500 mb-2">Due: {safeFormatDate(milestone.dueDate, request?.deadline, 'MMM d, yyyy')}</p>
                            {milestone.status === 'APPROVED' && milestone.submissions && milestone.submissions.length > 0 && (
                              <FileAttachmentList files={milestone.submissions} className="mt-2" />
                            )}
                          </div>

                          <div className="flex items-center gap-3 flex-shrink-0 ml-auto md:ml-0">
                            {milestone.status === 'APPROVED' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
                                Completed
                              </span>
                            ) : milestone.status === 'IN_PROGRESS' ? (
                              <Button size="sm" variant="outline" className="border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 whitespace-nowrap">
                                In Progress
                              </Button>
                            ) : (
                              <span className="text-xs text-stone-400 font-medium uppercase tracking-wider whitespace-nowrap">Pending</span>
                            )}
                          </div>
                        </div>

                        {milestone.status === 'IN_PROGRESS' && (
                          <div className="mt-4 bg-amber-50 p-4 rounded-lg border border-amber-100 text-sm text-amber-800">
                            Expert is currently working on this. Expect delivery by {safeFormatDate(milestone.dueDate, null, 'h:mm a')}.
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Final Completion Step */}
                    {order.status === 'COMPLETED' && (
                      <div className="relative pl-8 pb-2">
                        <div className="absolute -left-[9px] top-1 size-4 rounded-full border-2 border-white shadow-sm bg-green-600 ring-4 ring-green-50" />
                        <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex items-start gap-4">
                          <div className="rounded-full bg-green-100 p-2 flex-shrink-0">
                            <CheckCircle className="size-6 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-green-900">Order Completed</h4>
                            <p className="text-sm text-green-700 mt-1">
                              All milestones have been approved and delivered. You can now download your final files from the "All Files" tab.
                            </p>
                          </div>
                        </div>

                        {/* Review Section */}
                        <div className="pt-6 border-t border-stone-100 mt-6">
                          <h3 className="font-bold text-stone-900 mb-4">Your Experience</h3>
                          {existingReview ? (
                            <div className="p-6 bg-white rounded-xl border border-stone-200 shadow-sm">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex text-amber-400">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className={`size-4 ${s <= existingReview.rating ? 'fill-current' : 'text-stone-300'}`} />
                                  ))}
                                </div>
                                <span className="text-sm font-bold text-stone-700">
                                  {existingReview.rating === 5 ? 'Excellent!' : existingReview.rating >= 4 ? 'Great!' : 'Good'}
                                </span>
                              </div>
                              <p className="text-stone-600 italic">"{existingReview.text}"</p>
                              <div className="mt-3 flex items-center gap-2">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${existingReview.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                  existingReview.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                    'bg-amber-100 text-amber-700'
                                  }`}>
                                  {existingReview.status === 'APPROVED' ? 'Public' : existingReview.status}
                                </span>
                                <span className="text-[10px] text-stone-400">Submitted on {safeFormatDate(existingReview.createdAt)}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="p-6 bg-stone-50 rounded-xl border border-stone-200">
                              <h4 className="font-bold text-sm text-stone-900 mb-3">Rate your Expert</h4>
                              <div className="flex items-center gap-2 mb-4">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <button
                                    key={s}
                                    onClick={() => setRating(s)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                  >
                                    <Star
                                      className={`size-8 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`}
                                    />
                                  </button>
                                ))}
                                <span className="ml-2 text-sm font-medium text-stone-500">
                                  {rating > 0 ? `${rating} Stars` : 'Select a rating'}
                                </span>
                              </div>

                              <textarea
                                className="w-full p-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5D4037] min-h-[100px]"
                                placeholder="Share your feedback about the expert's work..."
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                              />

                              <div className="mt-4 flex justify-end">
                                <Button
                                  disabled={rating === 0 || !reviewText.trim()}
                                  onClick={handleSubmitReview}
                                >
                                  Submit Review
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="p-6 bg-[#5D4037] text-white">
                  <h3 className="font-bold mb-2">Need help?</h3>
                  <p className="text-sm text-stone-300 mb-4">
                    Message our support team for any questions regarding your order.
                  </p>
                  <Button variant="secondary" className="w-full" onClick={() => setActiveTab('messages')}>
                    Open Support Chat
                  </Button>
                </Card>
              </div>
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
                  threadId={`${order.id}:student`}
                  expertName="Pengu Support"
                  expertAvatar="PS"
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {order.status === 'COMPLETED' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="size-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-green-900">Project Completed & Locked</h3>
                    <p className="text-xs text-green-700">The review session for this project is now closed. You can view all final materials and annotations but new feedback is disabled.</p>
                  </div>
                </div>
              )}
              <ReviewStudio order={order} request={request} updateOrder={updateOrder} />
            </motion.div>
          )}

          {activeTab === 'files' && (
            <motion.div
              key="files"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4 text-[#3E2723]">Project Files</h3>
                {order.status !== 'COMPLETED' ? (
                  <FileUploader
                    onUploadComplete={(attachments) => {
                      if (order) {
                        updateOrder(order.id, {
                          attachments: [...(order.attachments || []), ...attachments]
                        });
                        toast.success(`${attachments.length} files uploaded to order.`);
                      }
                    }}
                    className="max-w-xl mb-8"
                  />
                ) : (
                  <div className="mb-8 p-6 border-2 border-dashed border-stone-100 rounded-2xl bg-stone-50/50 flex flex-col items-center justify-center text-center">
                    <div className="size-10 rounded-full bg-green-50 flex items-center justify-center mb-3">
                      <CheckCircle className="size-5 text-green-600" />
                    </div>
                    <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">Final Archive Locked</p>
                    <p className="text-[10px] text-stone-400 mt-1">This order is completed. New file uploads are no longer accepted.</p>
                  </div>
                )}

                <h4 className="font-bold text-stone-700 mb-3">Existing Files</h4>
                <div className="space-y-6">
                  {request && (request.attachments?.length || request.files?.length) > 0 && (
                    <div>
                      <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Original Request Files</p>
                      <FileAttachmentList files={request.attachments && request.attachments.length > 0 ? request.attachments : request.files || []} />
                    </div>
                  )}
                  {((order.attachments?.length || 0) > 0 || (order.files?.length || 0) > 0 || order.milestones.some(m => m.status === 'APPROVED' && (m.submissions?.length || 0) > 0)) && (
                    <div>
                      <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Order Deliverables & Uploads</p>
                      <div className="space-y-4">
                        <FileAttachmentList files={order.attachments && order.attachments.length > 0 ? order.attachments : order.files || []} />
                        {order.milestones.filter(m => m.status === 'APPROVED' && m.submissions?.length).map(m => (
                          <div key={m.id} className="pl-4 border-l-2 border-green-100">
                            <p className="text-[10px] font-bold text-green-600 uppercase mb-1">{m.title} Delivery</p>
                            <FileAttachmentList files={m.submissions!} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {(!request || (!request.attachments?.length && !request.files?.length)) && (!order.attachments?.length && !order.files?.length) && (
                    <EmptyState
                      icon={FileText}
                      title="No files yet"
                      subtitle="There are no files attached to this order yet. You can upload requirements or other relevant documents here."
                      compact
                      className="bg-stone-50/50 border-dashed border-2 py-8 shadow-none"
                    />
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}

