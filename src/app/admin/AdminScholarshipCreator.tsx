import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { DashboardLayout } from '../components/Layout';
import { ImagePlus, Loader2, Save, X, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';
import { Combobox } from '../components/ui/combobox';
import { MultiSelect } from '../components/ui/multi-select';

const COUNTRIES = [
    'Australia', 'Canada', 'France', 'Germany', 'Hungary', 'India', 'Indonesia', 'Ireland', 'Italy', 'Japan',
    'Malaysia', 'Mexico', 'Netherlands', 'New Zealand', 'Norway', 'Poland', 'Qatar', 'Romania', 'Russia',
    'Saudi Arabia', 'Singapore', 'South Africa', 'South Korea', 'Spain', 'Sweden', 'Switzerland', 'Taiwan',
    'Thailand', 'Turkey', 'United Arab Emirates', 'United Kingdom', 'United States', 'Other'
].sort();

const DEGREE_LEVELS = ['Bachelors', 'Masters', 'PhD', 'Post-Doc', 'Multiple'];

const SCHOLARSHIP_TYPES = ['Fully Funded', 'Tuition Only', 'Monthly Stipend', 'Partial', 'Merit-Based', 'Tuition Fee Waivers'];

export default function AdminScholarshipCreator() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    // Core Data Fields
    const [title, setTitle] = useState('');
    const [universityName, setUniversityName] = useState('');
    const [country, setCountry] = useState('UK');
    const [deadline, setDeadline] = useState('');
    const [degreeLevel, setDegreeLevel] = useState<string[]>([]);
    const [scholarshipType, setScholarshipType] = useState<string[]>([]);
    const [description, setDescription] = useState(''); // Short description
    const [richTextDescription, setRichTextDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    // Monetization Engine
    const [expertApplicationFee, setExpertApplicationFee] = useState('');

    useEffect(() => {
        if (id) {
            fetchScholarship();
        }
    }, [id]);

    const fetchScholarship = async () => {
        setIsFetching(true);
        try {
            const token = (JSON.parse(localStorage.getItem('pengu_final_v4_user') || '{}')?.token);
            const response = await axios.get(`/api/scholarships/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const s = response.data;
            setTitle(s.title || '');
            setUniversityName(s.universityName || '');
            setCountry(s.country || 'UK');
            setDeadline(s.deadline ? new Date(s.deadline).toISOString().split('T')[0] : '');
            setDegreeLevel(s.degreeLevel || 'Masters');
            setScholarshipType(s.scholarshipType || 'Fully Funded');
            setDescription(s.description || '');
            setRichTextDescription(s.richTextDescription || '');
            setImageUrl(s.imageUrl || '');
            setExpertApplicationFee(s.expertApplicationFee?.toString() || '');
        } catch (error) {
            console.error('Failed to fetch scholarship:', error);
            toast.error('Failed to load scholarship details');
        } finally {
            setIsFetching(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = (JSON.parse(localStorage.getItem('pengu_final_v4_user') || '{}')?.token);
            // Using standard Cloudinary upload route
            const response = await axios.post('/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
            setImageUrl(response.data.url);
            toast.success('Image uploaded successfully');
        } catch (error) {
            console.error('Image upload failed:', error);
            toast.error('Failed to upload image. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async (status: 'DRAFT' | 'PUBLISHED') => {
        const isRichTextEmpty = !richTextDescription || richTextDescription === '<p><br></p>' || richTextDescription.trim() === '';

        if (!title || !universityName || !deadline || expertApplicationFee === '' || isRichTextEmpty) {
            toast.error('Please fill in all required fields (Title, University, Deadline, Rich Text, Fee).');
            return;
        }

        setIsSaving(true);
        try {
            const token = (JSON.parse(localStorage.getItem('pengu_final_v4_user') || '{}')?.token);
            const data = {
                title,
                universityName,
                country,
                deadline,
                degreeLevel,
                scholarshipType,
                fundingType: Array.isArray(scholarshipType) ? scholarshipType[0] : scholarshipType,
                description: description || title, // fallback
                richTextDescription,
                imageUrl,
                expertApplicationFee: Number(expertApplicationFee),
                baseFee: 0, // Legacy field
                status
            };

            if (id) {
                await axios.put(`/api/scholarships/${id}`, data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success(`Scholarship updated and ${status.toLowerCase()} successfully!`);
            } else {
                await axios.post('/api/scholarships', data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success(`Scholarship ${status.toLowerCase()} created successfully!`);
            }

            navigate('/admin/scholarships');
        } catch (error: any) {
            console.error('Failed to save scholarship:', error);
            toast.error(error.response?.data?.message || 'Failed to save scholarship');
        } finally {
            setIsSaving(false);
        }
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link'],
            ['clean']
        ],
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <button
                                onClick={() => navigate('/admin/scholarships')}
                                className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-500 transition-colors"
                            >
                                <ArrowLeft className="size-5" />
                            </button>
                            <h2 className="text-2xl font-bold text-stone-900">
                                {id ? 'Edit Scholarship' : 'Custom Creator Studio'}
                            </h2>
                        </div>
                        <p className="text-stone-500 text-sm ml-10">
                            {id ? `Modifying "${title}" funnel.` : 'Craft a premium scholarship funnel for the Discovery Board.'}
                        </p>
                    </div>
                </div>

                {isFetching ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="size-8 text-[#5D4037] animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Left Column: Image & Settings */}
                        <div className="space-y-6">
                            {/* Image Uploader */}
                            <Card className="p-6 border-stone-200">
                                <Label className="block text-sm font-semibold text-stone-700 mb-2">Cover Image *</Label>
                                <p className="text-xs text-stone-500 mb-4">High-quality university campus or crest.</p>

                                <div className="relative group">
                                    {imageUrl ? (
                                        <div className="relative aspect-video rounded-xl overflow-hidden border border-stone-200">
                                            <img src={imageUrl} alt="Cover" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => setImageUrl('')}
                                                className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-sm hover:bg-red-50 text-stone-600 hover:text-red-600 transition-colors"
                                            >
                                                <X className="size-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className={clsx(
                                            "flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors aspect-video",
                                            isUploading ? "bg-stone-50 border-stone-200" : "border-stone-200 hover:border-[#5D4037] hover:bg-orange-50/30"
                                        )}>
                                            {isUploading ? (
                                                <Loader2 className="size-8 text-stone-400 animate-spin" />
                                            ) : (
                                                <>
                                                    <div className="p-3 bg-stone-100 rounded-full mb-3 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                        <ImagePlus className="size-6 text-stone-500 group-hover:text-[#5D4037]" />
                                                    </div>
                                                    <span className="text-sm font-medium text-stone-600">Upload Image</span>
                                                    <span className="text-xs text-stone-400 mt-1">PNG, JPG up to 5MB</span>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/png, image/jpeg, image/webp"
                                                onChange={handleImageUpload}
                                                disabled={isUploading}
                                            />
                                        </label>
                                    )}
                                </div>
                            </Card>

                            {/* Monetization Engine */}
                            <Card className="p-6 border-stone-200 border-l-4 border-l-green-500">
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-sm font-semibold text-stone-800 flex items-center gap-2">
                                            💰 Monetization Engine
                                        </Label>
                                        <p className="text-xs text-stone-500 mt-1 mb-4">Set the premium fee for end-to-end expert handling.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Expert Application Fee (TK) *</Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-stone-500 font-medium font-mono">৳</span>
                                            </div>
                                            <Input
                                                type="number"
                                                value={expertApplicationFee}
                                                onChange={(e) => setExpertApplicationFee(e.target.value)}
                                                className="pl-8 !text-lg font-semibold"
                                                placeholder="e.g. 15000"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Tags & Categories */}
                            <Card className="p-6 border-stone-200 space-y-4">
                                <h3 className="text-sm font-semibold text-stone-800 border-b border-stone-100 pb-2">Classification</h3>

                                <div className="space-y-2">
                                    <Label>Country</Label>
                                    <Combobox
                                        options={COUNTRIES}
                                        value={country}
                                        onChange={setCountry}
                                        placeholder="Select country..."
                                        searchPlaceholder="Search country..."
                                        allowCustom={true}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Degree Level</Label>
                                    <MultiSelect
                                        options={DEGREE_LEVELS}
                                        value={degreeLevel}
                                        onChange={setDegreeLevel}
                                        placeholder="Select degree levels..."
                                        searchPlaceholder="Search degree level..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Scholarship Type</Label>
                                    <MultiSelect
                                        options={SCHOLARSHIP_TYPES}
                                        value={scholarshipType}
                                        onChange={setScholarshipType}
                                        placeholder="Select types..."
                                        searchPlaceholder="Search type..."
                                    />
                                </div>
                            </Card>
                        </div>

                        {/* Right Column: Core Data & Rich Text */}
                        <div className="md:col-span-2 space-y-6">
                            <Card className="p-6 border-stone-200 space-y-5">
                                <h3 className="text-lg font-bold text-stone-800 mb-4">Core Data</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2 col-span-2">
                                        <Label>University Name *</Label>
                                        <Input
                                            value={universityName}
                                            onChange={(e) => setUniversityName(e.target.value)}
                                            placeholder="e.g. University of Oxford"
                                            className="font-medium"
                                        />
                                    </div>

                                    <div className="space-y-2 col-span-2">
                                        <Label>Scholarship Title *</Label>
                                        <Input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g. Clarendon Fund 2026"
                                            className="font-bold text-lg h-12"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Deadline Date *</Label>
                                        <Input
                                            type="date"
                                            value={deadline}
                                            onChange={(e) => setDeadline(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-0 border-stone-200 overflow-hidden flex flex-col">
                                <div className="p-6 pb-2 border-b border-stone-100 bg-stone-50">
                                    <Label className="text-lg font-bold text-stone-800">Rich Text Description *</Label>
                                    <p className="text-sm text-stone-500 mt-1">This forms the main body of the Deep-Dive Sales Funnel page.</p>
                                </div>
                                <div className="bg-white p-4">
                                    <div className="h-[400px]">
                                        <ReactQuill
                                            theme="snow"
                                            value={richTextDescription}
                                            onChange={setRichTextDescription}
                                            modules={modules}
                                            className="h-[350px] w-full"
                                            placeholder="Write a compelling breakdown including: About the Program, Eligibility, and Required Documents..."
                                        />
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Sticky Action Footer */}
                <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-white border-t border-stone-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40 flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={() => handleSave('DRAFT')}
                        disabled={isSaving}
                        className="bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                    >
                        {id ? 'Keep as Draft' : 'Save as Draft'}
                    </Button>
                    <Button
                        onClick={() => handleSave('PUBLISHED')}
                        disabled={isSaving}
                        className="bg-[#3E2723] hover:bg-[#2D1B17] text-white min-w-[150px] gap-2 shadow-sm"
                    >
                        {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                        {id ? 'Update & Publish' : 'Approve & Publish'}
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
}
