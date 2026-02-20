import React from 'react';
import { FileText, Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { FileAttachment } from '../store';

import { getCleanFileName } from '../lib/fileUtils';

interface FileAttachmentListProps {
    files: (string | FileAttachment)[];
    className?: string;
}

export function FileAttachmentList({ files, className }: FileAttachmentListProps) {
    if (!files || files.length === 0) {
        return (
            <div className={`p-4 bg-stone-50 border border-dashed border-stone-200 rounded-lg text-center ${className}`}>
                <p className="text-sm text-stone-400">No attachments found.</p>
            </div>
        );
    }

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'pdf': return 'PDF';
            case 'doc':
            case 'docx': return 'DOC';
            case 'ppt':
            case 'pptx': return 'PPT';
            case 'png':
            case 'jpg':
            case 'jpeg': return 'IMG';
            default: return 'FILE';
        }
    };

    const getMimeType = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'pdf': return 'application/pdf';
            case 'png': return 'image/png';
            case 'jpg':
            case 'jpeg': return 'image/jpeg';
            case 'doc':
            case 'docx': return 'application/msword';
            default: return 'text/plain';
        }
    };

    const getFileBlob = async (fileData: string) => {
        if (!fileData) return new Blob(["File not found"], { type: 'text/plain' });
        // Handle Data URIs and HTTP/HTTPS URLs (Cloudinary)
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

    const createFileBlob = (fileName: string) => {
        const mimeType = getMimeType(fileName);
        let content: any = "Mock file content for " + fileName;

        if (mimeType === 'application/pdf') {
            content = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 21 >>\nstream\nBT /F1 24 Tf 100 700 Td (Mock PDF Content) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\n0000000212 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n284\n%%EOF";
        }

        return new Blob([content], { type: mimeType });
    };

    const isImage = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        return ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext || '');
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {files.map((file, index) => {
                const fileName = getCleanFileName(file);
                const isRealFile = typeof file !== 'string';
                const showPreview = isRealFile && isImage(fileName);

                return (
                    <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white border border-stone-200 rounded-lg group hover:border-[#5D4037]/50 transition-all shadow-sm"
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            {showPreview ? (
                                <div className="size-10 rounded border border-stone-200 overflow-hidden flex-shrink-0 bg-stone-50">
                                    <img
                                        src={(file as FileAttachment).url || (file as FileAttachment).data}
                                        alt={fileName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="bg-stone-100 p-2 rounded flex flex-col items-center justify-center min-w-[40px] group-hover:bg-[#5D4037]/10 transition-colors">
                                    <FileText className="size-4 text-[#5D4037]" />
                                    <span className="text-[8px] font-bold text-[#5D4037] mt-0.5">{getFileIcon(fileName)}</span>
                                </div>
                            )}
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-stone-900 truncate">{fileName}</p>
                                <p className="text-[10px] text-stone-500 uppercase tracking-tighter">
                                    {isRealFile ? `${((file as FileAttachment).size / 1024).toFixed(1)} KB • Real File` : 'Simulated File'}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <button
                                onClick={async () => {
                                    toast.info(`Opening preview for ${fileName}...`);
                                    const fileSource = typeof file === 'string' ? file : (file.url || file.data);
                                    if (!fileSource) {
                                        toast.error("File source not found");
                                        return;
                                    }
                                    const blob = typeof file === 'string' ? createFileBlob(file) : await getFileBlob(fileSource);
                                    const url = URL.createObjectURL(blob);
                                    window.open(url, '_blank');
                                    setTimeout(() => URL.revokeObjectURL(url), 10000);
                                }}
                                className="p-1.5 text-stone-400 hover:text-[#5D4037] hover:bg-stone-50 rounded"
                                title="Open in New Tab"
                            >
                                <ExternalLink className="size-4" />
                            </button>
                            <button
                                onClick={async () => {
                                    toast.success(`Downloading ${fileName}...`);
                                    const fileSource = typeof file === 'string' ? file : (file.url || file.data);
                                    if (!fileSource) {
                                        toast.error("File source not found");
                                        return;
                                    }
                                    const blob = typeof file === 'string' ? createFileBlob(file) : await getFileBlob(fileSource);
                                    const url = URL.createObjectURL(blob);
                                    const link = document.createElement("a");
                                    link.href = url;
                                    link.download = fileName;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    setTimeout(() => URL.revokeObjectURL(url), 10000);
                                }}
                                className="p-1.5 text-stone-400 hover:text-[#5D4037] hover:bg-stone-50 rounded"
                                title="Download"
                            >
                                <Download className="size-4" />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
