import React, { useState } from 'react';
import { DashboardLayout } from './components/Layout';
import { useStore, CarouselSlide } from './store';
import { Button } from './components/ui/button';
import { Plus, Edit2, Trash2, X, Upload, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import api from '../lib/api'; // Import API

export default function AdminCarousel() {
    const { carouselSlides, addCarouselSlide, updateCarouselSlide, deleteCarouselSlide } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<CarouselSlide>>({
        imageUrl: '',
        linkUrl: '',
        title: '',
        description: '',
        buttonText: 'Details',
        badge: '',
        order: 0,
        isActive: true
    });

    const handleOpenModal = (slide?: CarouselSlide) => {
        if (slide) {
            setEditingSlide(slide);
            setFormData(slide);
        } else {
            setEditingSlide(null);
            setFormData({
                imageUrl: '',
                linkUrl: '',
                title: '',
                description: '',
                buttonText: '',
                badge: '',
                order: carouselSlides.length + 1,
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSlide(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.imageUrl || !formData.linkUrl) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (editingSlide) {
            updateCarouselSlide(editingSlide.id, formData);
            toast.success('Slide updated successfully');
        } else {
            addCarouselSlide(formData as Omit<CarouselSlide, 'id'>);
            toast.success('Slide added successfully');
        }
        handleCloseModal();
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this slide?')) {
            deleteCarouselSlide(id);
            toast.success('Slide deleted');
        }
    };

    const handleToggleActive = (slide: CarouselSlide) => {
        updateCarouselSlide(slide.id, { isActive: !slide.isActive });
        toast.success(`Slide ${slide.isActive ? 'deactivated' : 'activated'}`);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                toast.message('Uploading image...', { duration: 1000 });

                const formData = new FormData();
                formData.append('file', file);

                const response = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                setFormData(prev => ({ ...prev, imageUrl: response.data.url }));
                toast.success("Image uploaded successfully");
            } catch (error) {
                console.error("Image upload failed", error);
                toast.error("Failed to upload image");
            }
        }
    };

    // Sort slides by order
    const sortedSlides = [...carouselSlides].sort((a, b) => a.order - b.order);

    return (
        <DashboardLayout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-[#3E2723]">Carousel Management</h1>
                        <p className="text-stone-500">Manage the hero section slides</p>
                    </div>
                    <Button onClick={() => handleOpenModal()} className="bg-[#3E2723] hover:bg-[#2D1B18] text-white">
                        <Plus className="size-4 mr-2" />
                        Add Carousel Slide
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedSlides.map((slide) => (
                        <motion.div
                            layout
                            key={slide.id}
                            className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden group hover:shadow-md transition-shadow"
                        >
                            <div className="relative h-48 bg-stone-100">
                                <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                                    Order: {slide.order}
                                </div>
                                {!slide.isActive && (
                                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                        <span className="bg-stone-800 text-white px-3 py-1 rounded-full text-xs font-bold">Inactive</span>
                                    </div>
                                )}
                            </div>

                            <div className="p-4">
                                <div className="flex items-start gap-2 mb-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-stone-500 truncate flex items-center">
                                            <span className="inline-block size-3 bg-stone-200 rounded-full mr-1.5 align-middle"></span>
                                            {slide.linkUrl}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-2 mt-4">
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => updateCarouselSlide(slide.id, { order: slide.order - 1 })}
                                            className="p-1.5 text-stone-500 hover:bg-stone-100 rounded-md"
                                            title="Move Up"
                                        >
                                            <ArrowUp className="size-4" />
                                        </button>
                                        <button
                                            onClick={() => updateCarouselSlide(slide.id, { order: slide.order + 1 })}
                                            className="p-1.5 text-stone-500 hover:bg-stone-100 rounded-md"
                                            title="Move Down"
                                        >
                                            <ArrowDown className="size-4" />
                                        </button>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleToggleActive(slide)}
                                            className={`h-8 w-8 p-0 ${slide.isActive ? 'text-[#3E2723] bg-[#3E2723]/10' : 'text-stone-400 bg-stone-100'}`}
                                        >
                                            {slide.isActive ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleOpenModal(slide)}
                                            className="h-8 px-3 text-blue-600 bg-blue-50 hover:bg-blue-100"
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(slide.id)}
                                            className="h-8 w-8 p-0 text-red-600 bg-red-50 hover:bg-red-100"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-xl overflow-hidden flex flex-col"
                        >
                            <div className="p-6 border-b border-stone-100 flex justify-between items-center shrink-0">
                                <h2 className="text-xl font-bold text-[#3E2723]">
                                    {editingSlide ? 'Edit Carousel Slide' : 'Add Carousel Slide'}
                                </h2>
                                <button onClick={handleCloseModal} className="text-stone-400 hover:text-stone-600">
                                    <X className="size-5" />
                                </button>
                            </div>

                            <div className="overflow-y-auto p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-stone-700 mb-2">
                                                    Carousel Image *
                                                </label>
                                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-stone-200 border-dashed rounded-xl hover:border-[#3E2723] transition-colors cursor-pointer relative bg-stone-50 group">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    />
                                                    <div className="space-y-2 text-center">
                                                        {formData.imageUrl ? (
                                                            <div className="relative">
                                                                <img src={formData.imageUrl} alt="Preview" className="mx-auto h-48 object-contain rounded-lg shadow-sm" />
                                                                <p className="text-xs text-stone-500 mt-2">Click to replace</p>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="size-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                                                    <Upload className="h-6 w-6 text-stone-400 group-hover:text-[#3E2723]" />
                                                                </div>
                                                                <div className="flex text-sm text-stone-600 justify-center">
                                                                    <span className="relative cursor-pointer font-medium text-[#3E2723] group-hover:underline">
                                                                        Click to upload
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-stone-500">
                                                                    Recommended size: 1920x1080px (16:9 ratio)
                                                                </p>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-stone-700 mb-1">
                                                    Display Order
                                                </label>
                                                <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl border border-stone-100">
                                                    <div className="flex-1">
                                                        <input
                                                            type="number"
                                                            value={formData.order}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                                                            className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#3E2723]/20 focus:border-[#3E2723]"
                                                        />
                                                    </div>
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            id="isActive"
                                                            checked={formData.isActive}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                                            className="h-5 w-5 text-[#3E2723] focus:ring-[#3E2723] border-stone-300 rounded"
                                                        />
                                                        <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-stone-900 cursor-pointer">
                                                            Active
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">

                                            <div>
                                                <label className="block text-sm font-medium text-stone-700 mb-1">
                                                    Link URL *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.linkUrl}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                                                    placeholder="/shop?cat=Women"
                                                    className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#3E2723]/20 focus:border-[#3E2723]"
                                                    required
                                                />
                                                <p className="mt-1 text-xs text-stone-500">Internal path (e.g. /shop) or external URL</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 flex gap-3 border-t border-stone-100">
                                        <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1 h-12 text-lg">
                                            Cancel
                                        </Button>
                                        <Button type="submit" className="flex-1 bg-[#3E2723] hover:bg-[#2D1B18] text-white h-12 text-lg font-bold">
                                            {editingSlide ? 'Update Slide' : 'Add Slide'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
