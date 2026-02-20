import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { toast } from 'sonner';

import { FileAttachment } from '../store';
import api from '../../lib/api'; // Import API

interface FileUploaderProps {
  onUploadComplete?: (files: FileAttachment[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[]; // e.g., ['.pdf', '.docx']
  className?: string;
  autoUpload?: boolean;
}

export function FileUploader({
  onUploadComplete,
  maxFiles = 5,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg', '.mp4', '.avi', '.mov', '.mp3', '.wav'], // Default accepted types
  className,
  autoUpload = true
}: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(file => {
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        return acceptedTypes.includes(ext);
      });

      if (validFiles.length !== newFiles.length) {
        toast.error('Some files were ignored due to invalid type.');
      }

      const updatedFiles = [...files, ...validFiles].slice(0, maxFiles);
      setFiles(updatedFiles);

      if (autoUpload && updatedFiles.length > 0) {
        // We use updatedFiles directly because setFiles is async
        startUploadProcess(updatedFiles);
      }
    }
  };

  const startUploadProcess = async (currentFiles: File[]) => {
    setUploading(true);
    setProgress(0);

    // Track progress for each file: fileIndex -> percent
    const fileProgress = new Map<number, number>();
    currentFiles.forEach((_, index) => fileProgress.set(index, 0));

    const updateAggregateProgress = () => {
      let total = 0;
      fileProgress.forEach(p => total += p);
      const aggregate = Math.round(total / currentFiles.length);
      setProgress(aggregate);
    };

    // Upload Files to Backend
    const attachments: FileAttachment[] = await Promise.all(
      currentFiles.map(async (file, index) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
          const response = await api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
              fileProgress.set(index, percentCompleted);
              updateAggregateProgress();
            }
          });

          return {
            name: response.data.name,
            type: response.data.format,
            size: response.data.size,
            data: response.data.url, // Store URL in data field for compatibility
            url: response.data.url // Add explict url field if needed by consumers
          } as any;
        } catch (error) {
          console.error("Upload failed for file:", file.name, error);
          toast.error(`Failed to upload ${file.name}`);
          // Even if failed, mark as 100% for progress calculation purposes so it doesn't hang
          fileProgress.set(index, 100);
          updateAggregateProgress();

          return {
            name: file.name,
            type: file.type,
            size: file.size,
            data: '' // Return empty data on failure
          };
        }
      })
    );

    setUploading(false);
    if (onUploadComplete) {
      onUploadComplete(attachments.filter(a => a.data !== ''));
    }
    toast.success('Files uploaded successfully!');
    setFiles([]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (files.length === 0) return;
    startUploadProcess(files);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
          ${uploading ? 'opacity-50 pointer-events-none border-stone-200' : 'border-stone-200 hover:border-[#5D4037] hover:bg-stone-50'}
        `}
      >
        <input
          type="file"
          multiple
          className="hidden"
          ref={fileInputRef}
          accept={acceptedTypes.join(',')}
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-center gap-2">
          <div className="size-12 bg-stone-100 rounded-full flex items-center justify-center text-stone-500 mb-2">
            <Upload className="size-6" />
          </div>
          <p className="text-sm font-bold text-stone-900">Click to upload files</p>
          <p className="text-xs text-stone-500">
            Supported: {acceptedTypes.join(', ')}
          </p>
        </div>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            {files.map((file, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white border border-stone-200 rounded-lg shadow-sm">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="bg-stone-100 p-2 rounded">
                    <FileText className="size-4 text-stone-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-900 truncate">{file.name}</p>
                    <p className="text-xs text-stone-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                {!uploading && (
                  <button
                    onClick={() => removeFile(i)}
                    className="text-stone-400 hover:text-red-500 p-1"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            ))}

            {uploading ? (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs text-stone-500">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#5D4037]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <Button onClick={handleUpload} className="w-full">
                Upload {files.length} Files
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
