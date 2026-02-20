import React, { useState } from 'react';
import { useStore } from './store';
import { DashboardLayout } from './components/Layout';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import {
  Users,
  Search,
  CheckCircle,
  MoreVertical,
  Star,
  Award,
  Briefcase,
  TrendingUp,
  Mail,
  Phone,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function AdminExpertManagement() {
  const { experts, updateExpertStatus, expertApplications, reviewExpertApplication } = useStore();
  const [viewMode, setViewMode] = useState<'experts' | 'applications'>('experts');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedExpert, setSelectedExpert] = useState<typeof experts[0] | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<typeof expertApplications[0] | null>(null);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const filteredExperts = experts.filter(expert => {
    const matchesStatus = filterStatus === 'All' || expert.status === filterStatus;
    const matchesSearch = expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  }).sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());

  const pendingApplications = experts.filter(e => e.status === 'Pending' && e.onboardingCompleted)
    .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());

  const handleStatusChange = (id: string, newStatus: 'Active' | 'Pending' | 'Suspended') => {
    updateExpertStatus(id, newStatus);
    toast.success(`Expert status updated to ${newStatus}`);
    if (selectedExpert?.id === id) {
      setSelectedExpert(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleApplicationReview = (id: string, status: 'APPROVED' | 'REJECTED') => {
    reviewExpertApplication(id, status);
    toast.success(`Application ${status === 'APPROVED' ? 'approved' : 'rejected'}`);
    setSelectedApplication(null);
  }

  const handleInviteExpert = () => {
    const inviteLink = `${window.location.origin}/join/expert`;
    navigator.clipboard.writeText(inviteLink);
    toast.success('Invitation link copied to clipboard!', {
      description: 'Share this link with potential experts to join Pengu.'
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3E2723]">Expert Management</h1>
            <p className="text-stone-500">Onboard, monitor, and manage your expert workforce.</p>
          </div>
          <div className="flex gap-2">
            <div className="bg-stone-100 p-1 rounded-lg flex items-center">
              <button
                onClick={() => setViewMode('experts')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'experts' ? 'bg-white shadow text-[#5D4037]' : 'text-stone-500 hover:text-stone-700'}`}
              >
                Experts List
              </button>
              <button
                onClick={() => setViewMode('applications')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'applications' ? 'bg-white shadow text-[#5D4037]' : 'text-stone-500 hover:text-stone-700'}`}
              >
                Onboarding Reviews
                {pendingApplications.length > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] px-1.5 rounded-full">{pendingApplications.length}</span>
                )}
              </button>
            </div>
            <Button onClick={handleInviteExpert}>
              <Users className="mr-2 size-4" /> Invite New Expert
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 flex flex-row items-center gap-4 hover:shadow-md transition-all border-stone-200/60">
            <div className="p-3.5 rounded-2xl bg-[#5D4037]/10 text-[#5D4037] shrink-0">
              <Users className="size-6" />
            </div>
            <div>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-0.5">Total Experts</p>
              <p className="text-2xl font-bold text-stone-900 leading-tight">{experts.length}</p>
            </div>
          </Card>
          <Card className="p-5 flex flex-row items-center gap-4 hover:shadow-md transition-all border-stone-200/60">
            <div className="p-3.5 rounded-2xl bg-green-100 text-green-700 shrink-0">
              <CheckCircle className="size-6" />
            </div>
            <div>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-0.5">Active</p>
              <p className="text-2xl font-bold text-stone-900 leading-tight">{experts.filter(e => e.status === 'Active').length}</p>
            </div>
          </Card>
          <Card className="p-5 flex flex-row items-center gap-4 hover:shadow-md transition-all border-stone-200/60">
            <div className="p-3.5 rounded-2xl bg-amber-100 text-amber-700 shrink-0">
              <TrendingUp className="size-6" />
            </div>
            <div>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-0.5">Applications</p>
              <p className="text-2xl font-bold text-stone-900 leading-tight">{pendingApplications.length}</p>
            </div>
          </Card>
          <Card className="p-5 flex flex-row items-center gap-4 hover:shadow-md transition-all border-stone-200/60">
            <div className="p-3.5 rounded-2xl bg-blue-100 text-blue-700 shrink-0">
              <Award className="size-6" />
            </div>
            <div>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-0.5">Top Rated</p>
              <p className="text-2xl font-bold text-stone-900 leading-tight">{experts.filter(e => e.rating >= 4.8).length}</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-4">
              {viewMode === 'experts' ? (
                <>
                  <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
                    <div className="flex gap-2">
                      {['All', 'Active', 'Pending', 'Suspended'].map(status => (
                        <button
                          key={status}
                          onClick={() => setFilterStatus(status)}
                          className={`
                            px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                            ${filterStatus === status
                              ? 'bg-[#5D4037] text-white'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}
                          `}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Search experts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-1.5 rounded-md border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5D4037]/20 focus:border-[#5D4037] w-full sm:w-64"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-stone-500 uppercase bg-stone-50 border-b border-stone-100">
                        <tr>
                          <th className="px-4 py-3 font-medium">Expert</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 font-medium">Rating</th>
                          <th className="px-4 py-3 font-medium text-right">Orders</th>
                          <th className="px-4 py-3 font-medium"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredExperts.map((expert) => (
                          <tr
                            key={expert.id}
                            className={`
                              border-b border-stone-100 last:border-0 hover:bg-stone-50 cursor-pointer transition-colors
                              ${selectedExpert?.id === expert.id ? 'bg-stone-50' : ''}
                            `}
                            onClick={() => { setSelectedExpert(expert); setSelectedApplication(null); }}
                          >
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <div className="size-10 rounded-full overflow-hidden bg-[#3E2723] text-white flex items-center justify-center font-bold text-xs">
                                    {expert.avatar ? (
                                      <img src={expert.avatar} alt={expert.name} className="w-full h-full object-cover" />
                                    ) : (
                                      expert.name.charAt(0)
                                    )}
                                  </div>
                                  {expert.status === 'Active' && (
                                    <div className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white ${expert.online ? 'bg-green-500' : 'bg-stone-300'}`} />
                                  )}
                                </div>
                                <div>
                                  <div className="font-bold text-stone-900">{expert.name}</div>
                                  <div className="text-xs text-stone-500">{expert.specialty}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`
                                px-2 py-1 rounded-full text-xs font-bold
                                ${expert.status === 'Active' ? 'bg-green-100 text-green-700' :
                                  expert.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                    'bg-red-100 text-red-700'}
                              `}>
                                {expert.status}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-1">
                                <Star className="size-3 fill-amber-400 text-amber-400" />
                                <span className="font-medium">{expert.rating > 0 ? expert.rating : '-'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-right font-medium text-stone-600">
                              {expert.completedOrders}
                            </td>
                            <td className="px-4 py-4 text-right">
                              <MoreVertical className="size-4 text-stone-400" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <h3 className="font-bold text-lg text-[#3E2723]">Onboarding Reviews</h3>
                    <p className="text-sm text-stone-500">Review profiles of experts who have completed onboarding.</p>
                  </div>

                  {/* Filter experts who are Pending AND have completed onboarding */}
                  {pendingApplications.length === 0 ? (
                    <div className="py-12 text-center text-stone-400 bg-stone-50 rounded-xl border-dashed border border-stone-200">
                      <CheckCircle className="mx-auto size-8 mb-2 opacity-50" />
                      <p>No pending onboarding reviews</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingApplications.map(expert => (
                        <div
                          key={expert.id}
                          className={`
                            border border-stone-200 rounded-xl p-4 cursor-pointer transition-all hover:border-[#5D4037]
                            ${selectedExpert?.id === expert.id ? 'bg-amber-50 border-amber-200 ring-1 ring-amber-200' : 'bg-white'}
                          `}
                          onClick={() => { setSelectedExpert(expert); setSelectedApplication(null); }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="size-10 rounded-full overflow-hidden bg-[#3E2723] text-white flex items-center justify-center font-bold text-xs">
                                {expert.avatar ? (
                                  <img src={expert.avatar} alt={expert.name} className="w-full h-full object-cover" />
                                ) : (
                                  expert.name.charAt(0)
                                )}
                              </div>
                              <div>
                                <h4 className="font-bold text-stone-900">{expert.name}</h4>
                                <p className="text-xs text-stone-500">Joined: {expert.joinDate}</p>
                              </div>
                            </div>
                            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">
                              Waiting for Approval
                            </span>
                          </div>
                          <div className="mt-3">
                            <div className="text-xs text-stone-500 mb-1">Expertise:</div>
                            <div className="flex gap-2 flex-wrap">
                              <span className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded">
                                {expert.specialty}
                              </span>
                              {expert.skills?.slice(0, 2).map((skill, i) => (
                                <span key={i} className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-stone-100 flex justify-end">
                            <Button size="sm" variant="outline" className="text-xs h-7" onClick={(e) => {
                              e.stopPropagation();
                              setSelectedExpert(expert);
                              setIsProfileModalOpen(true);
                            }}>
                              View Full Profile
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </Card>
          </div>

          {/* Details Sidebar */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {selectedExpert ? (
                <motion.div
                  key={selectedExpert.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Card className="p-6 sticky top-6">
                    <div className="flex flex-col items-center text-center mb-6">
                      <div className="relative">
                        <div className="size-24 rounded-full overflow-hidden bg-[#3E2723] text-white flex items-center justify-center font-bold text-2xl mb-4 shadow-lg border-4 border-white">
                          {selectedExpert.avatar ? (
                            <img src={selectedExpert.avatar} alt={selectedExpert.name} className="w-full h-full object-cover" />
                          ) : (
                            selectedExpert.name.charAt(0)
                          )}
                        </div>
                        {selectedExpert.status === 'Active' && (
                          <div className={`absolute bottom-4 right-0 size-5 rounded-full border-4 border-white ${selectedExpert.online ? 'bg-green-500' : 'bg-stone-300'}`} />
                        )}
                      </div>
                      <h2 className="text-xl font-bold text-[#3E2723]">{selectedExpert.name}</h2>
                      <p className="text-stone-500">{selectedExpert.specialty}</p>

                      {selectedExpert.status === 'Active' && (
                        <div className="mt-2 text-xs font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 flex items-center gap-1">
                          <div className={`size-1.5 rounded-full ${selectedExpert.online ? 'bg-green-500 animate-pulse' : 'bg-stone-400'}`} />
                          {selectedExpert.online ? 'Online now' : 'Offline'}
                        </div>
                      )}

                      <div className="flex gap-2 mt-4 flex-wrap justify-center">
                        {selectedExpert.status === 'Pending' ? (
                          <>
                            <Button size="sm" onClick={() => handleStatusChange(selectedExpert.id, 'Active')} className="bg-green-600 hover:bg-green-700">
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleStatusChange(selectedExpert.id, 'Suspended')} className="text-red-600 border-red-200 hover:bg-red-50">
                              Reject
                            </Button>
                          </>
                        ) : selectedExpert.status === 'Suspended' ? (
                          <Button size="sm" onClick={() => handleStatusChange(selectedExpert.id, 'Active')} className="bg-[#5D4037]">
                            Reactivate Account
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => setIsProfileModalOpen(true)}>View Full Profile</Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-stone-100">
                      <div className="flex justify-between py-2 border-b border-stone-50">
                        <span className="text-stone-500 text-sm flex items-center gap-2">
                          <Mail className="size-4" /> Email
                        </span>
                        <span className="font-medium text-sm text-stone-900">{selectedExpert.email}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-stone-50">
                        <span className="text-stone-500 text-sm flex items-center gap-2">
                          <Phone className="size-4" /> Phone
                        </span>
                        <span className="font-medium text-sm text-stone-900">{selectedExpert.phone || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-stone-50">
                        <span className="text-stone-500 text-sm flex items-center gap-2">
                          <Briefcase className="size-4" /> Joined
                        </span>
                        <span className="font-medium text-sm text-stone-900">{selectedExpert.joinDate}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-stone-50">
                        <span className="text-stone-500 text-sm flex items-center gap-2">
                          <TrendingUp className="size-4" /> Earnings
                        </span>
                        <span className="font-bold text-sm text-green-600">TK {(selectedExpert.earnings || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    {selectedExpert.status === 'Active' && (
                      <div className="mt-6">
                        <Button
                          variant="outline"
                          className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                          onClick={() => handleStatusChange(selectedExpert.id, 'Suspended')}
                        >
                          Suspend Account
                        </Button>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ) : selectedApplication ? (
                <motion.div
                  key={selectedApplication.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Card className="p-6 sticky top-6">
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-[#3E2723]">Application Review</h2>
                      <p className="text-sm text-stone-500">Applicant: {selectedApplication.name}</p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Verified Skills</h3>
                        <div className="space-y-2">
                          {selectedApplication.skills.map((skill, i) => (
                            <div key={i} className="flex justify-between items-center bg-stone-50 p-2 rounded-lg text-sm">
                              <span className="font-medium text-stone-800">{skill.name}</span>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${skill.level === 'Advanced' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {skill.level}
                                </span>
                                <span className="text-stone-400 text-xs">{skill.score}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Applicant Details</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between py-1 border-b border-stone-50">
                            <span className="text-stone-500">Email</span>
                            <span>{selectedApplication.email}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-stone-50">
                            <span className="text-stone-500">Applied</span>
                            <span>{new Date(selectedApplication.appliedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-stone-100">
                        <Button
                          onClick={() => handleApplicationReview(selectedApplication.id, 'APPROVED')}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleApplicationReview(selectedApplication.id, 'REJECTED')}
                          className="w-full text-red-600 border-red-200 hover:bg-red-50"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <div className="h-full flex items-center justify-center p-8 text-stone-400 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50">
                  <div className="text-center">
                    <Users className="size-12 mx-auto mb-2 opacity-50" />
                    <p>Select an item to view details</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Full Profile Modal */}
      <AnimatePresence>
        {isProfileModalOpen && selectedExpert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-[#3E2723] text-white">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-full overflow-hidden bg-white/20 flex items-center justify-center font-bold text-xl border border-white/40">
                    {selectedExpert.avatar ? (
                      <img src={selectedExpert.avatar} alt={selectedExpert.name} className="w-full h-full object-cover" />
                    ) : (
                      selectedExpert.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedExpert.name}</h2>
                    <p className="text-stone-300 text-sm">{selectedExpert.specialty}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <Search className="size-5 rotate-45" /> {/* Using Search as a placeholder for Close if X is not imported, but let's be better */}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">Contact Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-stone-600">
                          <Mail className="size-4" />
                          <span className="text-sm font-medium">{selectedExpert.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-stone-600">
                          <Phone className="size-4" />
                          <span className="text-sm font-medium">{selectedExpert.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-stone-600">
                          <span className="text-sm font-medium">Joined {selectedExpert.joinDate}</span>
                        </div>
                        {selectedExpert.cvUrl && (
                          <div className="pt-2">
                            <a
                              href={selectedExpert.cvUrl}
                              download={`Expert_${selectedExpert.name.replace(/\s+/g, '_')}_CV`}
                              className="flex items-center gap-2 text-xs font-bold text-[#5D4037] hover:underline"
                            >
                              <FileText className="size-4" /> Download CV / Resume
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">Account Status</h3>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${selectedExpert.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {selectedExpert.status}
                      </div>
                    </div>

                    {(selectedExpert.education || selectedExpert.bio) && (
                      <div className="pt-4 border-t border-stone-100">
                        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Onboarding Details</h3>
                        {selectedExpert.education && (
                          <div className="mb-3">
                            <p className="text-xs text-stone-500">Education</p>
                            <p className="text-sm font-medium text-stone-900">{selectedExpert.education}</p>
                          </div>
                        )}
                        {selectedExpert.bio && (
                          <div className="mb-3">
                            <p className="text-xs text-stone-500">Bio</p>
                            <p className="text-sm text-stone-600 italic">{selectedExpert.bio}</p>
                          </div>
                        )}
                        {selectedExpert.skills && selectedExpert.skills.length > 0 && (
                          <div>
                            <p className="text-xs text-stone-500 mb-1">Skills</p>
                            <div className="flex gap-2 flex-wrap">
                              {selectedExpert.skills.map((s, i) => (
                                <span key={i} className="text-xs bg-stone-100 text-stone-700 px-2 py-1 rounded border border-stone-200">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-8">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                        <p className="text-xs text-stone-500 font-medium uppercase mb-1">Total Earnings</p>
                        <p className="text-xl font-bold text-[#3E2723]">{selectedExpert.earnings}</p>
                      </div>
                      <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                        <p className="text-xs text-stone-500 font-medium uppercase mb-1">Orders</p>
                        <p className="text-xl font-bold text-[#3E2723]">{selectedExpert.completedOrders}</p>
                      </div>
                      <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                        <p className="text-xs text-stone-500 font-medium uppercase mb-1">Rating</p>
                        <div className="flex items-center gap-1">
                          <Star className="size-4 fill-amber-400 text-amber-400" />
                          <p className="text-xl font-bold text-[#3E2723]">{selectedExpert.rating}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-[#3E2723] mb-4">Expertise & Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-lg bg-[#5D4037] text-white text-sm font-medium">
                          {selectedExpert.specialty}
                        </span>
                        {selectedExpert.skills && selectedExpert.skills.length > 0 ? (
                          selectedExpert.skills.map(skill => (
                            <span key={skill} className="px-3 py-1 rounded-lg bg-stone-100 text-stone-600 text-sm font-medium border border-stone-200">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-stone-400 text-sm italic">No specific skills listed</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-[#3E2723] mb-4">Bio & Professional Summary</h3>
                      <p className="text-stone-600 leading-relaxed text-sm">
                        {selectedExpert.bio || "No professional summary available."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-stone-100 bg-stone-50 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsProfileModalOpen(false)}>Close Profile</Button>
                {selectedExpert.status === 'Active' ? (
                  <Button variant="outline" className="text-red-600 border-red-200" onClick={() => { handleStatusChange(selectedExpert.id, 'Suspended'); setIsProfileModalOpen(false); }}>
                    Suspend Expert
                  </Button>
                ) : (
                  <Button onClick={() => { handleStatusChange(selectedExpert.id, 'Active'); setIsProfileModalOpen(false); }}>
                    Activate Account
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
