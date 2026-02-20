import React, { useState } from 'react';
import { useStore, Order, ExpertProfile, Request } from './store';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from './components/Layout';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import {
    FileText,
    Clock,
    MessageSquare,
    CheckCircle,
    Download,
    ChevronLeft,
    Calendar,
    User,
    AlertTriangle,
    Settings,
    X,
    Save,
    RotateCcw,
    Paperclip,
    Shield,
    Star,
    ThumbsUp,
    ThumbsDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { FileAttachmentList } from './components/FileAttachmentList';
import ChatInterface from './components/ChatInterface';
import { toast } from 'sonner';

export default function AdminOrderDetails() {
    const { id } = useParams<{ id: string }>();
    const { orders, requests, experts, users, updateOrder, updateRequest, reviewDeliverable, reviews, updateReviewStatus } = useStore();
    const order = orders.find(o => o.id === id);
    const request = requests.find(r => r.id === order?.requestId);
    const existingReview = reviews.find(r => r.orderId === order?.id);
    const expertId = (order?.expertId && typeof order.expertId === 'object') ? (order.expertId as any)._id || (order.expertId as any).id : order?.expertId;
    const expert = experts.find(e => e.userId === expertId || e.id === expertId);

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

    const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'files' | 'student-chat' | 'expert-chat'>('overview');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({
        topic: '',
        serviceType: '',
        deadline: ''
    });

    if (!order || !request) return <DashboardLayout><div>Order not found</div></DashboardLayout>;

    const handleOpenEdit = () => {
        setEditFormData({
            topic: request.topic,
            serviceType: request.serviceType,
            deadline: request.deadline
        });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = () => {
        updateRequest(request.id, {
            topic: editFormData.topic,
            serviceType: editFormData.serviceType,
            deadline: editFormData.deadline
        });
        updateOrder(order.id, {
            topic: editFormData.topic,
            serviceType: editFormData.serviceType
        });
        setIsEditModalOpen(false);
        toast.success('Order details updated successfully');
    };

    const handleQCReview = (milestoneId: string, approved: boolean) => {
        reviewDeliverable(order.id, milestoneId, approved);
        toast.success(approved ? 'Milestone approved and student notified.' : 'Revision requested from expert.');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID_CONFIRMED': return 'bg-blue-100 text-blue-800';
            case 'ASSIGNED': return 'bg-purple-100 text-purple-800';
            case 'IN_PROGRESS': return 'bg-amber-100 text-amber-800';
            case 'Review': return 'bg-pink-100 text-pink-800';
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            default: return 'bg-stone-100 text-stone-800';
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <Link to="/admin/orders" className="text-sm text-stone-500 hover:text-[#5D4037] flex items-center gap-1 mb-4">
                        <ChevronLeft className="size-4" /> Back to Operations
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-1">
                                <h1 className="text-xl sm:text-2xl font-bold text-[#3E2723] break-all max-w-full">Manage Order #{order.id}</h1>
                                <span className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap ${getStatusColor(order.status)}`}>
                                    {order.status.replace('_', ' ')}
                                </span>
                            </div>
                            <p className="text-stone-500 text-sm sm:text-lg truncate">{request.topic}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 sm:flex-none h-9 text-xs border-stone-200"
                                onClick={handleOpenEdit}
                                disabled={order.status === 'COMPLETED'}
                            >
                                <Settings className="mr-2 size-4" /> <span className="whitespace-nowrap">Edit Order</span>
                            </Button>
                            <Button size="sm" className="flex-1 sm:flex-none h-9 text-xs" onClick={() => setActiveTab('student-chat')}>
                                <MessageSquare className="mr-2 size-4" /> <span className="whitespace-nowrap">Contact Student</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-stone-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {[
                            { id: 'overview', name: 'Overview', icon: FileText },
                            { id: 'timeline', name: 'Progress & Review', icon: Clock },
                            { id: 'files', name: 'Documents', icon: Download },
                            { id: 'student-chat', name: 'Student Chat', icon: MessageSquare },
                            { id: 'expert-chat', name: 'Expert Chat', icon: MessageSquare },
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
                                    <h3 className="font-bold text-lg mb-4 text-[#5D4037]">Requirement Brief</h3>
                                    <div className="prose prose-stone max-w-none text-sm bg-stone-50 p-6 rounded-xl border border-stone-200">
                                        <p className="whitespace-pre-wrap">{request.details}</p>
                                    </div>
                                </Card>

                                <Card className="p-6">
                                    <h3 className="font-bold text-lg mb-4 text-[#5D4037]">Student Attachments</h3>
                                    <FileAttachmentList files={request.attachments && request.attachments.length > 0 ? request.attachments : request.files || []} />
                                </Card>
                            </div>

                            <div className="space-y-6">
                                <Card className="p-6 h-fit bg-stone-50 border-stone-200">
                                    <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                                        <User className="size-5 text-[#5D4037]" /> Key Parties
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Student</p>
                                            <p className="font-bold text-stone-800">#{typeof request.studentId === 'object' ? (request.studentId as any)._id || (request.studentId as any).id : request.studentId}</p>
                                        </div>
                                        {expert ? (
                                            <div className="pt-4 border-t border-stone-200">
                                                <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Assigned Expert</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <div className="size-8 rounded-full overflow-hidden bg-[#3E2723] text-white flex items-center justify-center text-xs font-bold border border-stone-200">
                                                        {expert.avatar ? (
                                                            <img src={expert.avatar} alt={expert.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            expert.name.charAt(0)
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-stone-800 text-sm">{expert.name}</p>
                                                        <p className="text-xs text-stone-500">{expert.specialty}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="pt-4 border-t border-stone-200">
                                                <p className="text-sm text-red-500 font-medium">No expert assigned yet.</p>
                                                <Link to="/admin/orders">
                                                    <Button variant="outline" size="sm" className="mt-2 w-full">Go to Assign</Button>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                <Card className="p-6">
                                    <h3 className="font-bold text-stone-900 mb-4 text-lg">Project Schedule</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-stone-500">Order Started:</span>
                                            <span className="font-bold text-[#5D4037]">{safeFormatDate(order.createdAt)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-stone-500">Final Deadline:</span>
                                            <span className="font-bold text-[#3E2723]">{safeFormatDate(request.deadline)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm pt-2 border-t border-stone-100">
                                            <span className="text-stone-500">QC Buffer:</span>
                                            <span className="font-bold text-amber-600">24 Hours</span>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'timeline' && (
                        <motion.div
                            key="timeline"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <Card className="p-8">
                                <h3 className="font-bold text-lg mb-6 text-[#3E2723]">Workflow Status</h3>
                                <div className="space-y-4">
                                    {order.milestones.map((milestone, index) => (
                                        <div key={milestone.id} className="flex flex-col sm:flex-row sm:items-center p-4 border border-stone-100 rounded-lg hover:bg-stone-50 transition-colors gap-4">
                                            <div className="flex items-start gap-4 flex-1 min-w-0">
                                                <div className={`
                            size-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0
                            ${milestone.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-stone-200 text-stone-500'}
                          `}>
                                                    {index + 1}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-bold text-stone-900 truncate">{milestone.title}</h4>
                                                    <p className="text-xs text-stone-500 mb-2">Scheduled: {safeFormatDate(milestone.dueDate, request.deadline)}</p>
                                                    {milestone.submissions && milestone.submissions.length > 0 && (
                                                        <FileAttachmentList files={milestone.submissions} className="mt-2" />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-50">
                                                <span className={`
                            px-3 py-1 rounded text-[10px] font-bold uppercase whitespace-nowrap
                            ${milestone.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                        milestone.status === 'IN_PROGRESS' || milestone.status === 'DELIVERED' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-500'}
                          `}>
                                                    {milestone.status.replace('_', ' ')}
                                                </span>
                                                {milestone.status === 'DELIVERED' && order.status !== 'COMPLETED' && (
                                                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                                        <Button size="sm" className="flex-1 sm:flex-none h-8 text-[10px]" onClick={() => handleQCReview(milestone.id, true)}>
                                                            Approve
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="flex-1 sm:flex-none h-8 text-[10px]" onClick={() => handleQCReview(milestone.id, false)}>
                                                            Request Revision
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {order.status === 'COMPLETED' && (
                                        <div className="p-4 bg-green-50 rounded-lg border border-green-100 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-full bg-green-100 flex items-center justify-center">
                                                    <CheckCircle className="size-4 text-green-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-green-900 text-sm">Order Logged as Complete</h4>
                                                    <p className="text-xs text-green-700">All deliverables approved. Archive ready.</p>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-green-700 border-green-200 hover:bg-green-100"
                                                onClick={() => setActiveTab('files')}
                                            >
                                                View Archive
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </Card>
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
                                <h3 className="font-bold text-lg mb-4 text-[#3E2723]">Deliverables & Uploads</h3>
                                <p className="text-sm text-stone-500 mb-6">Access all files submitted by the expert and uploaded by the student.</p>
                                <div className="space-y-8">
                                    <div>
                                        <h4 className="font-bold text-sm text-stone-900 mb-3 flex items-center gap-2">
                                            <User className="size-4" /> Expert Submissions
                                        </h4>
                                        <FileAttachmentList files={order.milestones.flatMap(m => m.submissions || [])} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-stone-900 mb-3 flex items-center gap-2">
                                            <User className="size-4" /> Student Files
                                        </h4>
                                        <FileAttachmentList files={request.attachments && request.attachments.length > 0 ? request.attachments : request.files || []} />
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {activeTab === 'student-chat' && (
                        <motion.div
                            key="student-chat"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <div className="h-[600px]">
                                <ChatInterface
                                    threadId={`${order.id}:student`}
                                    expertName={`Student: ${typeof order.studentId === 'object' ? (order.studentId as any).name : (users.find(u => u.id === order.studentId)?.name || 'Unknown')}`}
                                    expertAvatar="ST"
                                />
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'expert-chat' && (
                        <motion.div
                            key="expert-chat"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <div className="h-[600px]">
                                <ChatInterface
                                    threadId={`${order.id}:expert`}
                                    expertName={`Expert: ${expert?.name || 'Assigned Expert'}`}
                                    expertAvatar={expert?.avatar || "EX"}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Edit Modal */}
                <AnimatePresence>
                    {isEditModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsEditModalOpen(false)}
                                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-[#3E2723]">Edit Order Details</h3>
                                    <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-stone-100 rounded-full">
                                        <X className="size-5 text-stone-400" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-stone-700 mb-1">Topic</label>
                                        <input
                                            type="text"
                                            value={editFormData.topic}
                                            onChange={(e) => setEditFormData({ ...editFormData, topic: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#5D4037]/20 focus:border-[#5D4037] outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-stone-700 mb-1">Service Type</label>
                                        <input
                                            type="text"
                                            value={editFormData.serviceType}
                                            onChange={(e) => setEditFormData({ ...editFormData, serviceType: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#5D4037]/20 focus:border-[#5D4037] outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-stone-700 mb-1">Deadline</label>
                                        <input
                                            type="date"
                                            value={editFormData.deadline}
                                            onChange={(e) => setEditFormData({ ...editFormData, deadline: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#5D4037]/20 focus:border-[#5D4037] outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="mt-8 flex gap-3">
                                    <Button variant="outline" className="flex-1" onClick={() => setIsEditModalOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button className="flex-1" onClick={handleSaveEdit}>
                                        <Save className="mr-2 size-4" /> Save Changes
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
}
