import React, { useState, useEffect, useMemo } from 'react';
import {
    FileText,
    MessageSquare,
    Pin,
    ChevronRight,
    Search,
    Download,
    ExternalLink,
    Maximize2,
    CheckCircle2,
    Clock,
    User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { toast } from 'sonner';
import { FileAttachment, Order, Request } from '../store';

import { getCleanFileName } from '../lib/fileUtils';

interface ReviewStudioProps {
    order: Order;
    request: Request;
    updateOrder: (orderId: string, updates: Partial<Order>) => void;
}

interface Annotation {
    id: string;
    fileUrl: string;
    x: number;
    y: number;
    text: string;
    author: string;
    timestamp: string;
}

export function ReviewStudio({ order, request, updateOrder }: ReviewStudioProps) {
    const [selectedFile, setSelectedFile] = useState<FileAttachment | string | null>(null);
    const [annotations, setAnnotations] = useState<Annotation[]>(order.annotations || []);
    const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSynced, setIsSynced] = useState(true);
    const [annotationMode, setAnnotationMode] = useState(false); // for PDF overlay
    const [viewerError, setViewerError] = useState(false); // Google Docs Viewer error fallback

    // Consolidated list of all files
    const allFiles = useMemo(() => {
        const files: (FileAttachment | string)[] = [];

        // Helper to add unique files
        const addFiles = (newFiles: (FileAttachment | string)[] | undefined) => {
            if (!newFiles) return;
            newFiles.forEach(nf => {
                // Use the utility to check uniqueness based on clean name
                const name = getCleanFileName(nf);
                if (!files.find(f => getCleanFileName(f) === name)) {
                    files.push(nf);
                }
            });
        };

        addFiles(request.attachments);
        addFiles(request.files);
        addFiles(order.attachments);
        addFiles(order.files);
        order.milestones.forEach(m => addFiles(m.submissions));

        return files;
    }, [order, request]);

    useEffect(() => {
        if (allFiles.length > 0 && !selectedFile) {
            setSelectedFile(allFiles[0]);
        }
    }, [allFiles, selectedFile]);

    // Use shared utility
    const getFileData = (file: FileAttachment | string) => {
        if (typeof file === 'string') return file;
        return file.data || file.url || null;
    };
    const isImage = (fileName: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
    // Check both filename AND url for pdf indicators (Cloudinary URLs often lack .pdf extension)
    const isPDF = (fileName: string, fileData?: string | null) => {
        if (/\.pdf$/i.test(fileName)) return true;
        if (fileData && (/\/pdf\//i.test(fileData) || /\.pdf/i.test(fileData) || /format.*pdf/i.test(fileData))) return true;
        return false;
    };

    const getFileBlob = async (fileData: string | undefined | null) => {
        if (!fileData) return new Blob(["File data not available"], { type: 'text/plain' });

        if (fileData.startsWith('data:') || fileData.startsWith('http')) {
            try {
                const response = await fetch(fileData);
                return await response.blob();
            } catch (e) {
                console.error("Failed to fetch file blob", e);
                return new Blob(["Failed to download file"], { type: 'text/plain' });
            }
        }
        return new Blob([fileData], { type: 'text/plain' });
    };

    const filteredFiles = allFiles.filter(f =>
        getCleanFileName(f).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!selectedFile || order.status === 'COMPLETED') return;
        const fileName = getCleanFileName(selectedFile);
        const fileData = getFileData(selectedFile);
        if (!isImage(fileName) && !isPDF(fileName, fileData)) return;
        // For PDFs, only place pin when annotation mode is explicitly on
        if (isPDF(fileName, fileData) && !annotationMode) return;
        if ((e.target as HTMLElement).closest('.annotation-pin')) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const newAnnotation: Annotation = {
            id: `a${Date.now()}`,
            fileUrl: fileName,
            x,
            y,
            text: '',
            author: 'You',
            timestamp: new Date().toISOString()
        };

        setAnnotations([...annotations, newAnnotation]);
        setActiveAnnotationId(newAnnotation.id);
        setIsSynced(false);
    };

    const updateAnnotationText = (id: string, text: string) => {
        setAnnotations(annotations.map(a => a.id === id ? { ...a, text } : a));
        setIsSynced(false);
    };

    const currentFileAnnotations = annotations.filter(a => selectedFile && a.fileUrl === getCleanFileName(selectedFile));

    const renderViewer = () => {
        if (!selectedFile) return null;
        const fileName = getCleanFileName(selectedFile);
        const fileData = getFileData(selectedFile);

        if (isImage(fileName) && fileData) {
            return (
                <div
                    className="relative w-full max-w-full h-full flex items-center justify-center bg-stone-100 p-8 overflow-auto cursor-crosshair group"
                    onClick={handleCanvasClick}
                >
                    <div className="relative shadow-2xl rounded-lg overflow-hidden bg-white max-w-4xl">
                        <img
                            src={fileData}
                            alt={fileName}
                            className="max-h-[60vh] lg:max-h-[70vh] max-w-full object-contain pointer-events-none select-none"
                        />
                        {currentFileAnnotations.map(anno => (
                            <motion.div
                                key={anno.id}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="annotation-pin absolute size-8 -ml-4 -mt-4 bg-[#5D4037] rounded-full text-white flex items-center justify-center font-bold shadow-lg ring-2 ring-white cursor-pointer hover:scale-110 transition-transform z-10"
                                style={{ left: `${anno.x}%`, top: `${anno.y}%` }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveAnnotationId(anno.id);
                                }}
                            >
                                <Pin className="size-4" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            );
        }

        if (fileData) {
            // Universal document viewer — Google Docs Viewer handles PDF, DOCX, XLSX, PPTX etc.
            // regardless of whether the URL has a .pdf extension (fixes Cloudinary raw URLs)
            const viewerUrl = fileData.startsWith('http')
                ? `https://docs.google.com/gview?url=${encodeURIComponent(fileData)}&embedded=true`
                : fileData;
            return (
                <div className="w-full h-full bg-stone-800 flex flex-col relative" onClick={handleCanvasClick}>
                    {/* Header bar */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-stone-900/80 border-b border-white/5 z-10 shrink-0">
                        <FileText className="size-3.5 text-stone-400" />
                        <span className="text-[10px] text-stone-400 font-medium truncate flex-1">{fileName}</span>
                        <a href={fileData} target="_blank" rel="noopener noreferrer"
                            className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 mr-2">
                            <ExternalLink className="size-3" /> Open
                        </a>
                    </div>

                    {/* Document iframe + annotation overlay */}
                    <div className="relative flex-1 overflow-hidden">
                        {viewerError ? (
                            /* Fallback when Google Docs Viewer fails (e.g. file not publicly accessible) */
                            <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-stone-900 p-6 text-center">
                                <FileText className="size-12 text-stone-500" />
                                <div>
                                    <p className="text-sm font-bold text-white mb-1">Preview requires direct access</p>
                                    <p className="text-[11px] text-stone-400">Google Docs Viewer couldn't load this file. Open it directly instead.</p>
                                </div>
                                <div className="flex gap-3 flex-wrap justify-center">
                                    <button onClick={() => setViewerError(false)}
                                        className="px-4 py-2 bg-stone-700 text-white text-xs font-bold rounded-xl hover:bg-stone-600 transition-all">
                                        Retry Viewer
                                    </button>
                                    <a href={fileData} target="_blank" rel="noopener noreferrer"
                                        className="px-4 py-2 bg-amber-500 text-[#3E2723] text-xs font-bold rounded-xl hover:bg-amber-400 transition-all flex items-center gap-1.5">
                                        <ExternalLink className="size-3" /> Open File
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <iframe
                                key={viewerUrl}
                                src={viewerUrl}
                                className="w-full h-full border-none"
                                title={fileName}
                                allow="fullscreen"
                                onError={() => setViewerError(true)}
                            />
                        )}

                        {/* Annotation overlay — only active when annotationMode is ON */}
                        {!viewerError && annotationMode && order.status !== 'COMPLETED' && (
                            <div
                                className="absolute inset-0 z-10 cursor-crosshair"
                                style={{ background: 'rgba(93,64,55,0.04)' }}
                                onClick={handleCanvasClick}
                            >
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#3E2723]/80 text-white text-[10px] font-bold px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none">
                                    Click anywhere to drop a pin
                                </div>
                            </div>
                        )}

                        {/* Render pins on top of overlay */}
                        {currentFileAnnotations.map(anno => (
                            <motion.div
                                key={anno.id}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="annotation-pin absolute size-8 -ml-4 -mt-4 bg-[#5D4037] rounded-full text-white flex items-center justify-center font-bold shadow-lg ring-2 ring-white cursor-pointer hover:scale-110 transition-transform z-20"
                                style={{ left: `${anno.x}%`, top: `${anno.y}%` }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveAnnotationId(anno.id);
                                }}
                            >
                                <Pin className="size-4" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 bg-stone-50">
                <FileText className="size-20 mb-4 opacity-10" />
                <p className="font-medium">Selected file is not previewable in Review Studio</p>
                <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={async () => {
                        const data = getFileData(selectedFile);
                        if (data) {
                            // If it's a direct URL, we might want to try triggering a download logic
                            // or just use the blob fetcher
                            const blob = await getFileBlob(data);
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = fileName;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            setTimeout(() => URL.revokeObjectURL(url), 10000);
                        } else {
                            toast.error('Cannot download this file.');
                        }
                    }}>
                        <Download className="mr-2 size-4" /> Download
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6 h-auto lg:h-[800px] animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Sidebar - File Navigator */}
            <div className="lg:col-span-1 bg-white border border-stone-200 rounded-2xl flex flex-col overflow-hidden shadow-sm max-h-[300px] lg:max-h-none">
                <div className="p-4 border-b border-stone-100 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-[#3E2723] flex items-center gap-2">
                            <FileText className="size-4" /> Studio Assets
                        </h3>
                        <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded-full font-bold text-stone-500">
                            {allFiles.length} FILES
                        </span>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Filter project files..."
                            className="w-full pl-9 pr-4 py-2 bg-stone-50 border-none rounded-xl text-xs focus:ring-1 focus:ring-[#5D4037]/20 outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {filteredFiles.map((file, i) => {
                        const name = getCleanFileName(file);
                        const isSelected = selectedFile && getCleanFileName(selectedFile) === name;
                        const isDeliverable = order.milestones.some(m => m.submissions?.some(s => (typeof s === 'string' ? s : s.name) === name));

                        return (
                            <button
                                key={i}
                                onClick={() => setSelectedFile(file)}
                                className={`
                                    w-full flex items-center gap-3 p-3 rounded-xl transition-all group
                                    ${isSelected
                                        ? 'bg-[#5D4037] text-white shadow-md'
                                        : 'hover:bg-stone-50 text-stone-600'}
                                `}
                            >
                                <div className={`
                                    size-8 rounded-lg flex items-center justify-center flex-shrink-0
                                    ${isSelected ? 'bg-white/20' : 'bg-stone-100 group-hover:bg-white transition-colors'}
                                `}>
                                    <FileText className={`size-4 ${isSelected ? 'text-white' : 'text-stone-400'}`} />
                                </div>
                                <div className="min-w-0 text-left">
                                    <p className="text-xs font-bold truncate">{name}</p>
                                    <p className={`text-[10px] ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                                        {isDeliverable ? 'DELIVERABLE' : 'RESOURCE'}
                                    </p>
                                </div>
                                {isDeliverable && !isSelected && (
                                    <CheckCircle2 className="size-3 text-green-500 ml-auto opacity-0 group-hover:opacity-100" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Stage - Viewer */}
            <div className="lg:col-span-2 flex flex-col bg-stone-200 border border-stone-300 rounded-2xl overflow-hidden shadow-inner relative h-[520px] lg:h-auto lg:min-h-0">
                <div className="absolute top-4 left-4 z-20 flex gap-2">
                    <div className="bg-white/90 backdrop-blur-md border border-stone-200 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                        <div className="size-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-stone-600 uppercase tracking-tighter">Live Review Studio</span>
                    </div>
                </div>

                <div className="absolute top-4 right-4 z-20 flex gap-2">
                    <button className="p-2 bg-white/90 backdrop-blur-md rounded-full border border-stone-200 text-stone-500 hover:text-[#5D4037] transition-colors shadow-sm">
                        <Maximize2 className="size-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden h-full">
                    {renderViewer()}
                </div>

                {/* Toolbar */}
                <div className="bg-white/90 backdrop-blur-xl border-t border-stone-200 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 min-h-16 h-auto">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="bg-[#5D4037]/5 px-3 py-1.5 rounded-lg border border-[#5D4037]/10 w-full sm:w-auto">
                            <p className="text-[10px] text-[#5D4037] font-bold truncate max-w-full sm:max-w-[150px]">
                                {selectedFile ? getCleanFileName(selectedFile) : 'No file selected'}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                        {/* Annotate Mode Toggle — shown only for PDF files */}
                        {selectedFile && isPDF(getCleanFileName(selectedFile), getFileData(selectedFile)) && order.status !== 'COMPLETED' && (
                            <Button
                                variant="outline"
                                size="sm"
                                className={`flex-1 sm:flex-none h-9 px-4 text-xs font-bold transition-all ${annotationMode
                                    ? 'bg-[#5D4037] text-white border-[#5D4037] hover:bg-[#4E342E]'
                                    : 'bg-white text-stone-600 hover:text-[#5D4037]'
                                    }`}
                                onClick={() => setAnnotationMode(m => !m)}
                            >
                                <Pin className="mr-2 size-3.5" />
                                <span className="whitespace-nowrap">{annotationMode ? 'Exit Annotate' : 'Annotate PDF'}</span>
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none h-9 px-4 text-xs font-bold bg-white"
                            onClick={async () => {
                                // Resolve data (either base64 or URL)
                                const data = getFileData(selectedFile);
                                if (data) {
                                    if (data.startsWith('http') || data.startsWith('blob:') || data.startsWith('data:')) {
                                        // If it's already a usable URL/DataURI, open it directly
                                        if (data.startsWith('http')) {
                                            window.open(data, '_blank');
                                        } else {
                                            // Data URI or Blob logic
                                            const blob = await getFileBlob(data);
                                            const url = URL.createObjectURL(blob);
                                            window.open(url, '_blank');
                                            setTimeout(() => URL.revokeObjectURL(url), 10000);
                                        }
                                    } else {
                                        // Some other string data? Treat as plain text file or error
                                        toast.error('Cannot open this file type natively.');
                                    }
                                } else {
                                    toast.error('Native preview not available for this file.');
                                }
                            }}
                        >
                            <ExternalLink className="mr-2 size-3.5" /> <span className="whitespace-nowrap">Open Native</span>
                        </Button>
                        {order.status !== 'COMPLETED' && (
                            <Button
                                size="sm"
                                className="flex-1 sm:flex-none h-9 px-4 text-xs font-bold"
                                onClick={() => {
                                    if (annotations.length === 0) {
                                        toast.error('Please add annotations before requesting changes.');
                                        return;
                                    }
                                    toast.success('Change request sent to the expert.');
                                    updateOrder(order.id, {
                                        status: 'Review',
                                        annotations: annotations,
                                        revisionsResolved: false
                                    });
                                    setIsSynced(true);
                                }}
                            >
                                <span className="whitespace-nowrap">Request Changes</span>
                            </Button>
                        )}
                        {order.status === 'COMPLETED' && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-lg border border-stone-200">
                                <CheckCircle2 className="size-4 text-green-600" />
                                <span className="text-[10px] font-bold text-stone-500 uppercase">Project Locked</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Panel - Comments & Activity */}
            <div className="lg:col-span-1 bg-white border border-stone-200 rounded-2xl flex flex-col overflow-hidden shadow-sm max-h-[400px] lg:max-h-none">
                <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                    <h3 className="font-bold text-[#3E2723] flex items-center gap-2">
                        <MessageSquare className="size-4" /> Observations
                    </h3>
                    <div className="size-7 rounded-full bg-stone-100 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-stone-500">{currentFileAnnotations.length}</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {currentFileAnnotations.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-stone-50/30 rounded-2xl border border-dashed border-stone-100">
                            <Pin className="size-10 mb-3 text-stone-200" />
                            <p className="text-xs font-bold text-stone-400">Collaborative Review</p>
                            <p className="text-[10px] text-stone-300 mt-1">Click anywhere on an image deliverable to initiate a pin and start a discussion.</p>
                        </div>
                    ) : (
                        currentFileAnnotations.map((anno) => (
                            <motion.div
                                key={anno.id}
                                layoutId={anno.id}
                                className={`
                                    p-4 rounded-2xl border transition-all cursor-pointer
                                    ${activeAnnotationId === anno.id
                                        ? 'bg-[#5D4037]/5 border-[#5D4037] shadow-sm ring-1 ring-[#5D4037]'
                                        : 'bg-white border-stone-100 hover:border-stone-200 shadow-sm'}
                                `}
                                onClick={() => setActiveAnnotationId(anno.id)}
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="flex size-6 bg-[#5D4037] text-white rounded-lg items-center justify-center text-[10px] font-bold shadow-soft">
                                        <Pin className="size-3" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-bold text-stone-900 truncate">Annotation Point</p>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="size-2.5 text-stone-300" />
                                            <span className="text-[9px] text-stone-400 font-medium">Just now</span>
                                        </div>
                                    </div>
                                    {activeAnnotationId === anno.id && (
                                        <div className="p-1 hover:bg-[#5D4037]/10 rounded-md transition-colors">
                                            <CheckCircle2 className="size-3.5 text-[#5D4037]" />
                                        </div>
                                    )}
                                </div>
                                <textarea
                                    className={`w-full text-xs bg-stone-50/50 p-3 rounded-xl border border-stone-100 focus:border-[#5D4037]/30 transition-all resize-none focus:outline-none text-stone-600 leading-relaxed font-medium ${order.status === 'COMPLETED' ? 'cursor-default' : ''}`}
                                    placeholder="Annotate this specific point..."
                                    rows={3}
                                    value={anno.text}
                                    readOnly={order.status === 'COMPLETED'}
                                    autoFocus={activeAnnotationId === anno.id && order.status !== 'COMPLETED'}
                                    onChange={(e) => updateAnnotationText(anno.id, e.target.value)}
                                />
                                <div className="mt-3 flex items-center justify-between pt-3 border-t border-stone-100">
                                    <div className="flex items-center gap-1.5">
                                        <div className="size-4 rounded-full bg-[#5D4037]/10 flex items-center justify-center">
                                            <User className="size-2.5 text-[#5D4037]" />
                                        </div>
                                        <span className="text-[9px] font-bold text-stone-500 uppercase tracking-tighter">Student Reviewer</span>
                                    </div>
                                    {order.status !== 'COMPLETED' && (
                                        <button className="text-[9px] font-bold text-stone-300 hover:text-red-400 transition-colors" onClick={(e) => {
                                            e.stopPropagation();
                                            setAnnotations(annotations.filter(a => a.id !== anno.id));
                                        }}>
                                            REMOVE
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                <div className="p-4 bg-stone-900 text-white rounded-b-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-stone-500 uppercase font-bold tracking-widest">Global Status</span>
                            <span className="text-xs font-bold text-[#A1887F]">
                                {isSynced ? 'All Feedback Synced' : 'Unsynced Review Session'}
                            </span>
                        </div>
                        <Button
                            size="sm"
                            disabled={order.status === 'COMPLETED'}
                            className={`
                                border-none text-white h-8 px-5 rounded-lg text-[10px] font-bold shadow-lg transition-all
                                ${isSynced || order.status === 'COMPLETED' ? 'bg-stone-700 cursor-default' : 'bg-[#A1887F] hover:bg-[#8D6E63]'}
                            `}
                            onClick={() => {
                                if (isSynced || order.status === 'COMPLETED') return;
                                toast.promise(
                                    new Promise((resolve) => setTimeout(resolve, 1500)),
                                    {
                                        loading: 'Syncing annotations...',
                                        success: () => {
                                            updateOrder(order.id, {
                                                annotations: annotations,
                                                revisionsResolved: false
                                            });
                                            setIsSynced(true);
                                            return 'Feedback synchronized with project timeline.';
                                        },
                                        error: 'Sync failed. Please try again.',
                                    }
                                );
                            }}
                        >
                            {isSynced ? 'FEEDBACK SYNCED' : 'SYNC FEEDBACK'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

