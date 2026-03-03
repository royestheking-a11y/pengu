import React from 'react';
import { useStore } from '../store';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/Layout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
    FileText,
    Search,
    GraduationCap,
    Clock,
    MapPin,
    User,
    ExternalLink,
    ChevronRight,
    ShieldCheck,
    Award
} from 'lucide-react';
import { format } from 'date-fns';
import { EmptyState } from '../components/ui/EmptyState';

export default function AdminScholarshipApplications() {
    const { scholarshipApplications } = useStore();
    const [filter, setFilter] = React.useState('ALL');
    const [searchQuery, setSearchQuery] = React.useState('');

    const filteredApplications = scholarshipApplications.filter(app => {
        const studentName = typeof app.studentId === 'object' ? app.studentId.name : '';
        const scholarshipTitle = typeof app.scholarshipId === 'object' ? app.scholarshipId.title : '';

        const matchesSearch = studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            scholarshipTitle.toLowerCase().includes(searchQuery.toLowerCase());

        if (filter === 'ALL') return matchesSearch;
        return app.status === filter && matchesSearch;
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'REQUEST_SENT': return { color: 'bg-amber-100 text-amber-800', label: 'New Request' };
            case 'QUOTE_PROVIDED': return { color: 'bg-blue-100 text-blue-800', label: 'Quoted' };
            case 'QUOTE_ACCEPTED': return { color: 'bg-indigo-100 text-indigo-800', label: 'Paid (Escrow)' };
            case 'EXPERT_ASSIGNED': return { color: 'bg-purple-100 text-purple-800', label: 'Working' };
            case 'FINAL_REVIEW': return { color: 'bg-orange-100 text-orange-800', label: 'In Review' };
            case 'COMPLETED': return { color: 'bg-emerald-100 text-emerald-800', label: 'Completed' };
            default: return { color: 'bg-stone-100 text-stone-800', label: status };
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#3E2723] flex items-center gap-2">
                            <GraduationCap className="size-7" /> Scholarship Applications
                        </h1>
                        <p className="text-stone-500">Manage student intakes, assign experts, and monitor escrow flows.</p>
                    </div>

                    {/* Mini Stats Corner */}
                    <div className="flex items-center gap-3">
                        <div className="bg-white border border-stone-200 rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm">
                            <div className="size-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                                <Clock className="size-4" />
                            </div>
                            <div>
                                <p className="text-[10px] text-stone-400 font-bold uppercase leading-none mb-1">Pending</p>
                                <p className="text-sm font-bold text-stone-900 leading-none">
                                    {scholarshipApplications.filter(a => a.status === 'REQUEST_SENT').length}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white border border-stone-200 rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm">
                            <div className="size-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                <ShieldCheck className="size-4" />
                            </div>
                            <div>
                                <p className="text-[10px] text-stone-400 font-bold uppercase leading-none mb-1">Escrow</p>
                                <p className="text-sm font-bold text-stone-900 leading-none">
                                    {scholarshipApplications.filter(a => a.status === 'QUOTE_ACCEPTED').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <Card className="p-6 border-stone-200">
                    {/* Filters & Search */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
                            <input
                                type="text"
                                placeholder="Search student or scholarship..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D4037] text-sm"
                            />
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                            {['ALL', 'REQUEST_SENT', 'QUOTE_PROVIDED', 'QUOTE_ACCEPTED', 'EXPERT_ASSIGNED', 'COMPLETED'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${filter === status
                                        ? 'bg-[#3E2723] text-white shadow-md'
                                        : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                                        }`}
                                >
                                    {status === 'ALL' ? 'All Applications' : getStatusConfig(status).label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Applications List */}
                    <div className="space-y-4">
                        {filteredApplications.length === 0 ? (
                            <EmptyState
                                icon={FileText}
                                title="No applications found"
                                subtitle="Either no students have applied yet, or your filters are too specific."
                                className="my-12"
                            />
                        ) : (
                            filteredApplications.map((app) => {
                                const status = getStatusConfig(app.status);
                                const scholarship = typeof app.scholarshipId === 'object' ? app.scholarshipId : { title: 'Unknown', country: 'N/A' };
                                const student = typeof app.studentId === 'object' ? app.studentId : { name: 'Unknown', email: 'N/A', avatar: '' };

                                return (
                                    <div key={app.id} className="group flex flex-col md:grid md:grid-cols-12 gap-4 p-5 border border-stone-100 rounded-2xl items-start md:items-center hover:shadow-md transition-all bg-white relative overflow-hidden">
                                        <div className="absolute left-0 inset-y-0 w-1 bg-[#3E2723] opacity-0 group-hover:opacity-100 transition-opacity" />

                                        {/* Scholarship & Status */}
                                        <div className="md:col-span-4 flex items-center gap-4 w-full">
                                            <div className="p-3 bg-amber-50 rounded-xl text-amber-700 shrink-0">
                                                <Award className="size-6" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-stone-900 truncate text-base">{(scholarship as any).title}</h3>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-stone-500">
                                                    <span className="flex items-center gap-1"><MapPin className="size-3" /> {(scholarship as any).country}</span>
                                                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9px] ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Student Info */}
                                        <div className="md:col-span-3 flex items-center gap-3 w-full">
                                            <div className="size-9 rounded-full overflow-hidden bg-stone-100 flex items-center justify-center border border-stone-200 shrink-0">
                                                {(student as any).avatar ? (
                                                    <img src={(student as any).avatar} alt="Student" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="size-5 text-stone-400" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-stone-900 truncate">{(student as any).name}</p>
                                                <p className="text-[10px] text-stone-500 truncate">{(student as any).email}</p>
                                            </div>
                                        </div>

                                        {/* Assessment Stats */}
                                        <div className="md:col-span-3 flex items-center gap-6 w-full">
                                            <div className="text-center md:text-left">
                                                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">CGPA</p>
                                                <p className="text-sm font-bold text-stone-700">{app.cgpa.toFixed(2)}</p>
                                            </div>
                                            <div className="text-center md:text-left">
                                                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">IELTS</p>
                                                <p className="text-sm font-bold text-stone-700">{app.ielts || 'N/A'}</p>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">Major</p>
                                                <p className="text-sm font-bold text-stone-700 truncate">{app.major}</p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="md:col-span-2 flex items-center justify-end gap-3 w-full pt-4 md:pt-0 border-t md:border-t-0 border-stone-50">
                                            <div className="text-right hidden lg:block mr-2">
                                                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">Updated</p>
                                                <p className="text-xs text-stone-500 font-medium">{format(new Date(app.updatedAt), 'MMM d')}</p>
                                            </div>
                                            <Link to={`/admin/scholarship-request/${app.id}`}>
                                                <Button size="sm" className="bg-[#3E2723] hover:bg-[#2D1B17] text-white h-9 px-4 font-bold shadow-sm">
                                                    Review <ChevronRight className="size-4 ml-1" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
