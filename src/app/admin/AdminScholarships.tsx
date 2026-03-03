import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Copy,
    Save,
    X,
    Globe,
    GraduationCap,
    Briefcase,
    Calendar,
    DollarSign,
    AlertCircle,
    Sparkles,
    Trash
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { toast } from 'sonner';
import axios from 'axios';
import { DashboardLayout } from '../components/Layout';
import { useStore } from '../store';

interface Scholarship {
    _id: string;
    title: string;
    country: string;
    deadline: string;
    degreeLevel: string;
    fundingType: string;
    minCgpa: number;
    minIelts: number;
    description: string;
    baseFee: number;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export default function AdminScholarships() {
    const { autoGenerateScholarship } = useStore();
    const [scholarships, setScholarships] = useState<Scholarship[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    // Deletion State
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [scholarshipToDelete, setScholarshipToDelete] = useState<string | null>(null);

    // Spreadsheet Editing State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<Scholarship>>({});

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('ALL');

    useEffect(() => {
        fetchScholarships();
    }, []);

    const fetchScholarships = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${(JSON.parse(localStorage.getItem('pengu_final_v4_user') || '{}')?.token)}` } };
            // Passing admin=true to the controller to get ALL statuses, not just PUBLISHED
            const response = await axios.get('/api/scholarships?admin=true', config);
            setScholarships(response.data);
        } catch (error) {
            toast.error('Failed to fetch scholarships');
        } finally {
            setIsLoading(false);
        }
    };

    const startEdit = (scholarship: Scholarship) => {
        setEditingId(scholarship._id);
        setEditFormData(scholarship);
    };

    const handleEditChange = (field: keyof Scholarship, value: any) => {
        setEditFormData(prev => ({ ...prev, [field]: value }));
    };

    const saveEdit = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${(JSON.parse(localStorage.getItem('pengu_final_v4_user') || '{}')?.token)}` } };
            const response = await axios.put(`/api/scholarships/${editingId}`, editFormData, config);

            setScholarships(scholarships.map(s => s._id === editingId ? response.data : s));
            setEditingId(null);
            toast.success('Scholarship updated successfully');
        } catch (error) {
            toast.error('Failed to update scholarship');
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditFormData({});
    };

    const createNewDraft = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${(JSON.parse(localStorage.getItem('pengu_final_v4_user') || '{}')?.token)}` } };
            const newDraft = {
                title: 'New Scholarship Draft',
                country: 'Select Country',
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                degreeLevel: 'BSc',
                fundingType: 'Fully Funded',
                minCgpa: 3.0,
                minIelts: 6.0,
                description: 'Draft description. Please update with details.',
                baseFee: 1500,
                status: 'DRAFT'
            };

            const response = await axios.post('/api/scholarships', newDraft, config);
            setScholarships([response.data, ...scholarships]);
            startEdit(response.data);
            toast.success('New draft created. Please edit details.');
        } catch (error) {
            toast.error('Failed to create draft');
        }
    };

    const handleAutoGenerate = async () => {
        setIsGenerating(true);
        toast.info("AI is searching for latest scholarships... This may take up to 20 seconds.");
        const success = await autoGenerateScholarship();
        if (success) {
            toast.success("AI generated a new scholarship draft successfully!");
            await fetchScholarships(); // Refresh list to get the new draft
        }
        setIsGenerating(false);
    };

    const duplicateScholarship = async (scholarship: Scholarship) => {
        try {
            const config = { headers: { Authorization: `Bearer ${(JSON.parse(localStorage.getItem('pengu_final_v4_user') || '{}')?.token)}` } };
            const duplicateData = {
                ...scholarship,
                title: `${scholarship.title} (Copy)`,
                status: 'DRAFT'
            };
            // @ts-ignore - removing _id
            delete duplicateData._id;

            const response = await axios.post('/api/scholarships', duplicateData, config);
            setScholarships([response.data, ...scholarships]);
            toast.success('Scholarship duplicated as DRAFT');
        } catch (error) {
            toast.error('Failed to duplicate scholarship');
        }
    };

    const deleteScholarship = (id: string) => {
        setScholarshipToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!scholarshipToDelete) return;
        try {
            const config = { headers: { Authorization: `Bearer ${(JSON.parse(localStorage.getItem('pengu_final_v4_user') || '{}')?.token)}` } };
            await axios.delete(`/api/scholarships/${scholarshipToDelete}`, config);
            setScholarships(prev => prev.filter(s => s._id !== scholarshipToDelete));
            toast.success('Scholarship deleted');
        } catch (error) {
            toast.error('Failed to delete scholarship');
        } finally {
            setIsDeleteDialogOpen(false);
            setScholarshipToDelete(null);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const config = { headers: { Authorization: `Bearer ${(JSON.parse(localStorage.getItem('pengu_final_v4_user') || '{}')?.token)}` } };
            const response = await axios.put(`/api/scholarships/${id}`, { status: newStatus }, config);
            setScholarships(scholarships.map(s => s._id === id ? response.data : s));
            toast.success(`Scholarship marked as ${newStatus}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const filteredScholarships = scholarships.filter(s => {
        const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.country.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <DashboardLayout>
            <div className="space-y-6">

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-stone-200">
                    <div>
                        <h2 className="text-2xl font-bold text-stone-900">Scholarship CRM</h2>
                        <p className="text-stone-500 text-sm">Manage inventory, duplicate entries, and push drafts to the Discovery Board.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleAutoGenerate}
                            disabled={isGenerating}
                            className={`font-semibold shadow-sm transition-all ${isGenerating ? 'opacity-70 bg-[#3E2723] text-white' : 'bg-[#3E2723] hover:bg-[#2D1B17] text-white'}`}
                        >
                            <Sparkles className={`size-4 mr-2 ${isGenerating ? 'animate-pulse' : ''}`} />
                            {isGenerating ? 'Generating...' : 'Auto Generate (AI)'}
                        </Button>
                        <Link to="/admin/scholarships/new">
                            <Button className="bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200 shadow-sm">
                                <Search className="size-4 mr-2" /> Custom Creator
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
                        <Input
                            placeholder="Search title or country..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                        {(['ALL', 'DRAFT', 'PUBLISHED', 'ARCHIVED'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md whitespace-nowrap transition-colors ${statusFilter === status
                                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                <Card className="overflow-x-auto border border-stone-200 shadow-sm rounded-xl">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#5D4037] text-white uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 font-bold whitespace-nowrap rounded-tl-xl w-64">Title</th>
                                <th className="px-4 py-3 font-bold whitespace-nowrap"><Globe className="size-3.5 inline mr-1" /> Country</th>
                                <th className="px-4 py-3 font-bold whitespace-nowrap"><Calendar className="size-3.5 inline mr-1" /> Deadline</th>
                                <th className="px-4 py-3 font-bold whitespace-nowrap"><GraduationCap className="size-3.5 inline mr-1" /> Lvl</th>
                                <th className="px-4 py-3 font-bold whitespace-nowrap"><Briefcase className="size-3.5 inline mr-1" /> Fund</th>
                                <th className="px-4 py-3 font-bold whitespace-nowrap">Reqs</th>
                                <th className="px-4 py-3 font-bold whitespace-nowrap"><DollarSign className="size-3.5 inline mr-1" /> Base</th>
                                <th className="px-4 py-3 font-bold whitespace-nowrap">Status</th>
                                <th className="px-4 py-3 font-bold whitespace-nowrap text-right rounded-tr-xl">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {isLoading ? (
                                <tr><td colSpan={9} className="p-8 text-center text-stone-500">Loading inventory...</td></tr>
                            ) : filteredScholarships.length === 0 ? (
                                <tr><td colSpan={9} className="p-8 text-center text-stone-500">No scholarships found matching criteria.</td></tr>
                            ) : (
                                filteredScholarships.map((scholarship) => {
                                    const isEditing = editingId === scholarship._id;

                                    return (
                                        <tr key={scholarship._id} className={`hover:bg-stone-50/50 transition-colors ${isEditing ? 'bg-amber-50/30' : ''}`}>
                                            <td className="px-4 py-3 max-w-[200px]">
                                                {isEditing ? (
                                                    <Input
                                                        value={editFormData.title || ''}
                                                        onChange={(e) => handleEditChange('title', e.target.value)}
                                                        className="h-8 text-sm max-w-full"
                                                    />
                                                ) : (
                                                    <div className="font-bold text-stone-900 truncate" title={scholarship.title}>
                                                        {scholarship.title}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {isEditing ? (
                                                    <Input
                                                        value={editFormData.country || ''}
                                                        onChange={(e) => handleEditChange('country', e.target.value)}
                                                        className="h-8 text-sm w-32"
                                                    />
                                                ) : (
                                                    scholarship.country
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {isEditing ? (
                                                    <Input
                                                        type="date"
                                                        value={new Date(editFormData.deadline || Date.now()).toISOString().split('T')[0]}
                                                        onChange={(e) => handleEditChange('deadline', e.target.value)}
                                                        className="h-8 text-sm w-36"
                                                    />
                                                ) : (
                                                    <span className={new Date(scholarship.deadline) < new Date() ? 'text-red-500 font-medium whitespace-nowrap flex items-center gap-1' : ''}>
                                                        {new Date(scholarship.deadline) < new Date() && <AlertCircle className="size-3" />}
                                                        {new Date(scholarship.deadline).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {isEditing ? (
                                                    <select
                                                        value={editFormData.degreeLevel || ''}
                                                        onChange={(e) => handleEditChange('degreeLevel', e.target.value)}
                                                        className="h-8 text-sm w-24 border border-stone-200 rounded-md px-2"
                                                    >
                                                        <option value="BSc">BSc</option>
                                                        <option value="MSc">MSc</option>
                                                        <option value="PhD">PhD</option>
                                                        <option value="All">All</option>
                                                    </select>
                                                ) : (
                                                    <Badge variant="outline" className="text-[10px]">{scholarship.degreeLevel}</Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {isEditing ? (
                                                    <select
                                                        value={editFormData.fundingType || ''}
                                                        onChange={(e) => handleEditChange('fundingType', e.target.value)}
                                                        className="h-8 text-sm w-28 border border-stone-200 rounded-md px-2"
                                                    >
                                                        <option value="Fully Funded">Fully Funded</option>
                                                        <option value="Partial">Partial</option>
                                                        <option value="Self Funded">Self</option>
                                                    </select>
                                                ) : (
                                                    <span className="text-xs text-stone-600 whitespace-nowrap">{scholarship.fundingType}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {isEditing ? (
                                                    <div className="flex gap-1 w-32">
                                                        <Input placeholder="CGPA" type="number" step="0.1" value={editFormData.minCgpa || 0} onChange={(e) => handleEditChange('minCgpa', parseFloat(e.target.value))} className="h-8 text-xs p-1" />
                                                        <Input placeholder="IELTS" type="number" step="0.5" value={editFormData.minIelts || 0} onChange={(e) => handleEditChange('minIelts', parseFloat(e.target.value))} className="h-8 text-xs p-1" />
                                                    </div>
                                                ) : (
                                                    <div className="text-[10px] text-stone-500 flex flex-col">
                                                        <span>CGPA: {scholarship.minCgpa}</span>
                                                        <span>IELTS: {scholarship.minIelts || 'N/A'}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs">
                                                {isEditing ? (
                                                    <Input
                                                        type="number"
                                                        value={editFormData.baseFee || 0}
                                                        onChange={(e) => handleEditChange('baseFee', parseInt(e.target.value))}
                                                        className="h-8 text-sm w-24"
                                                    />
                                                ) : (
                                                    `৳${scholarship.baseFee}`
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {!isEditing && (
                                                    <div className="flex flex-col gap-1">
                                                        <Badge className={`text-[10px] justify-center ${scholarship.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' :
                                                            scholarship.status === 'DRAFT' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' :
                                                                'bg-stone-200 text-stone-600 hover:bg-stone-200'
                                                            }`}>
                                                            {scholarship.status}
                                                        </Badge>
                                                        {scholarship.status === 'DRAFT' && (
                                                            <button onClick={() => updateStatus(scholarship._id, 'PUBLISHED')} className="text-[10px] text-emerald-600 hover:underline">Publish</button>
                                                        )}
                                                        {scholarship.status === 'PUBLISHED' && (
                                                            <button onClick={() => updateStatus(scholarship._id, 'ARCHIVED')} className="text-[10px] text-stone-500 hover:underline">Archive</button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {isEditing ? (
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={saveEdit}>
                                                            <Save className="size-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-stone-400 hover:text-stone-600" onClick={cancelEdit}>
                                                            <X className="size-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link to={`/admin/scholarships/edit/${scholarship._id}`}>
                                                            <Button size="icon" variant="ghost" className="h-7 w-7 text-stone-400 hover:text-indigo-600 bg-white shadow-sm border border-stone-200">
                                                                <Edit2 className="size-3" />
                                                            </Button>
                                                        </Link>
                                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-stone-400 hover:text-amber-600 bg-white shadow-sm border border-stone-200" onClick={() => duplicateScholarship(scholarship)}>
                                                            <Copy className="size-3" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-stone-400 hover:text-red-600 bg-white shadow-sm border border-stone-200" onClick={() => deleteScholarship(scholarship._id)}>
                                                            <Trash2 className="size-3" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </Card>

                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent className="bg-white rounded-2xl border-stone-200">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-xl font-bold text-stone-900">
                                <div className="p-2 bg-red-50 rounded-lg">
                                    <Trash className="size-5 text-red-600" />
                                </div>
                                Permanent Deletion
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-stone-500 pt-2">
                                Are you sure you want to remove this scholarship from your inventory? This action is irreversible and will immediately remove the listing for all students.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-6">
                            <AlertDialogCancel className="rounded-xl border-stone-200 text-stone-600 hover:bg-stone-50">
                                Keep it
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={confirmDelete}
                                className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-md shadow-red-200 transition-all border-none"
                            >
                                Confirm Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

            </div>
        </DashboardLayout>
    );
}
