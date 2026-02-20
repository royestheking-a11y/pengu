import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicLayout } from './components/Layout';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import {
    Send, Paperclip, X, Upload, CheckCircle, Loader2,
    FileText, FileImage, File, User, ArrowRight,
    Phone, MessageSquare, Sparkles, Shield
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Message = { role: 'user' | 'assistant'; content: string };
type AttachedFile = { name: string; url: string; format: string; size: number; uploading?: boolean };

// ─── File Icon ────────────────────────────────────────────────────────────────
function FileIcon({ format }: { format: string }) {
    if (format.includes('image')) return <FileImage className="size-4 text-blue-500" />;
    if (format.includes('pdf')) return <FileText className="size-4 text-red-500" />;
    return <File className="size-4 text-stone-400" />;
}

function formatSize(bytes: number) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProblemSolver() {
    // Chat state
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hi there! 👋 I'm Pengu's intake assistant. What kind of problem are we solving today? Tell me anything — a messy report, a tight deadline, a complex assignment, or a business challenge." }
    ]);
    const [input, setInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const chatBoxRef = useRef<HTMLDivElement>(null);

    // Files state
    const [files, setFiles] = useState<AttachedFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Contact + submit state
    const [name, setName] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Scroll page to top on mount — target all possible scroll containers
    useEffect(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, []);

    // Scroll only the chat box — never the page viewport
    useEffect(() => {
        if (messages.length <= 1) return;
        const box = chatBoxRef.current;
        if (box) box.scrollTop = box.scrollHeight;
    }, [messages, chatLoading]);

    // ─── Send chat message ────────────────────────────────────────────────────
    const sendMessage = async () => {
        const text = input.trim();
        if (!text || chatLoading) return;
        const newMessages: Message[] = [...messages, { role: 'user', content: text }];
        setMessages(newMessages);
        setInput('');
        setChatLoading(true);
        try {
            const res = await fetch('/api/universal-tickets/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newMessages })
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I had a connection issue. Please try again!" }]);
        } finally {
            setChatLoading(false);
        }
    };

    // ─── File upload ──────────────────────────────────────────────────────────
    const uploadFile = async (file: File) => {
        const placeholder: AttachedFile = { name: file.name, url: '', format: file.type, size: file.size, uploading: true };
        setFiles(prev => [...prev, placeholder]);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            setFiles(prev => prev.map(f =>
                f.name === file.name && f.uploading ? { name: data.name, url: data.url, format: data.format, size: data.size } : f
            ));
            toast.success(`${file.name} uploaded ✓`);
        } catch {
            setFiles(prev => prev.filter(f => !(f.name === file.name && f.uploading)));
            toast.error(`Failed to upload ${file.name}`);
        }
    };

    const handleFiles = (fileList: FileList | null) => {
        if (!fileList) return;
        Array.from(fileList).forEach(uploadFile);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    // ─── Submit ticket ────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!name.trim()) return toast.error('Please enter your name');
        if (!whatsapp.trim()) return toast.error('Please enter your WhatsApp number');
        const userMessages = messages.filter(m => m.role === 'user');
        if (userMessages.length === 0) return toast.error('Please describe your problem in the chat first');
        if (files.some(f => f.uploading)) return toast.error('Please wait for all files to finish uploading');

        setSubmitting(true);
        try {
            const res = await fetch('/api/universal-tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, whatsapp, messages, files })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setSubmitted(true);
        } catch (e: any) {
            toast.error(e.message || 'Failed to submit. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Success Screen ───────────────────────────────────────────────────────
    if (submitted) {
        return (
            <PublicLayout>
                <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="text-center max-w-md">
                        <div className="size-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="size-12 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-black text-[#3E2723] mb-3">Ticket Received!</h2>
                        <p className="text-stone-500 text-lg leading-relaxed mb-8">
                            A Pengu Admin is now reviewing your files and chat. They will message you on WhatsApp within <strong>1 hour</strong> with a solution and a custom quote.
                        </p>
                        <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-8 text-left space-y-3">
                            <div className="flex gap-3 items-center">
                                <User className="size-4 text-[#5D4037] shrink-0" />
                                <span className="text-sm font-medium text-stone-700">{name}</span>
                            </div>
                            <div className="flex gap-3 items-center">
                                <Phone className="size-4 text-[#5D4037] shrink-0" />
                                <span className="text-sm font-medium text-stone-700">{whatsapp}</span>
                            </div>
                            {files.length > 0 && (
                                <div className="flex gap-3 items-center">
                                    <Paperclip className="size-4 text-[#5D4037] shrink-0" />
                                    <span className="text-sm font-medium text-stone-700">{files.length} file{files.length > 1 ? 's' : ''} uploaded</span>
                                </div>
                            )}
                        </div>
                        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[#3E2723] text-white rounded-xl font-bold hover:bg-[#5D4037] transition-all">
                            Back to Home <ArrowRight className="size-4" />
                        </Link>
                    </motion.div>
                </div>
            </PublicLayout>
        );
    }

    // ─── Main Split Screen ────────────────────────────────────────────────────
    return (
        <PublicLayout>
            <div className="bg-[#FAFAFA] min-h-screen">
                {/* Page Header */}
                <div className="bg-[#3E2723] text-white py-8 px-4">
                    <div className="max-w-6xl mx-auto flex items-center gap-4">
                        <div className="size-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                            <Sparkles className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black">Universal Problem Solver</h1>
                            <p className="text-white/60 text-xs">Describe your problem. Upload your files. A Pengu expert will solve it.</p>
                        </div>
                        <div className="ml-auto flex items-center gap-1.5 text-white/50 text-xs">
                            <Shield className="size-3" />
                            <span>Secure & Confidential</span>
                        </div>
                    </div>
                </div>

                {/* Split Screen */}
                <div className="max-w-6xl mx-auto p-4 md:p-6">
                    <div className="flex flex-col lg:flex-row gap-5 h-full">

                        {/* ── LEFT: Chat (40%) ── */}
                        <div className="lg:w-[40%] flex flex-col bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden" style={{ height: '70vh' }}>
                            <div className="p-4 border-b border-stone-100 flex items-center gap-2.5">
                                <div className="size-8 bg-[#D7CCC8]/20 rounded-full flex items-center justify-center text-base">
                                    🐧
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-stone-900">Pengu Intake Assistant</p>
                                    <div className="flex items-center gap-1 text-[10px] text-green-500 font-bold">
                                        <span className="size-1.5 bg-green-400 rounded-full inline-block" /> Online
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div ref={chatBoxRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                                {messages.map((msg, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                        className={`flex gap-2 items-end ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`size-6 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-[#5D4037]' : 'bg-stone-100 text-xs'}`}>
                                            {msg.role === 'user' ? <User className="size-3 text-white" /> : '🐧'}
                                        </div>
                                        <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
                                            ${msg.role === 'user'
                                                ? 'bg-[#5D4037] text-white rounded-br-sm'
                                                : 'bg-stone-100 text-stone-800 rounded-bl-sm'}`}>
                                            {msg.content}
                                        </div>
                                    </motion.div>
                                ))}
                                {chatLoading && (
                                    <div className="flex gap-2 items-end">
                                        <div className="size-6 rounded-full bg-stone-100 flex items-center justify-center text-xs">
                                            🐧
                                        </div>
                                        <div className="px-3.5 py-2.5 bg-stone-100 rounded-2xl rounded-bl-sm">
                                            <div className="flex gap-1">
                                                <span className="size-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="size-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="size-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Input */}
                            <div className="p-4 border-t border-stone-100">
                                <div className="flex gap-2">
                                    <input
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                        placeholder="Type your message..."
                                        className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5D4037]/20 focus:border-[#5D4037]"
                                    />
                                    <button onClick={sendMessage} disabled={!input.trim() || chatLoading}
                                        className="size-10 bg-[#5D4037] rounded-xl flex items-center justify-center text-white hover:bg-[#4E342E] transition-all disabled:opacity-40">
                                        <Send className="size-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ── RIGHT: Files + Submit (60%) ── */}
                        <div className="lg:w-[60%] flex flex-col gap-4">

                            {/* Drop Zone */}
                            <div
                                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={onDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all cursor-pointer min-h-[260px]
                                    ${isDragging ? 'border-[#5D4037] bg-[#5D4037]/5 scale-[1.01]' : 'border-stone-300 bg-white hover:border-[#5D4037]/50 hover:bg-stone-50'}`}
                            >
                                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
                                <div className={`size-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${isDragging ? 'bg-[#5D4037]' : 'bg-stone-100'}`}>
                                    <Upload className={`size-8 ${isDragging ? 'text-white' : 'text-stone-400'}`} />
                                </div>
                                <p className="text-lg font-bold text-stone-700 mb-1">Drag & Drop Anything Here</p>
                                <p className="text-sm text-stone-400 text-center px-8">
                                    Excel files, PDFs, Word docs, images, audio notes, screenshots — anything that helps explain your problem
                                </p>
                                <p className="text-xs text-[#5D4037] font-bold mt-3">or click to browse files</p>
                                {isDragging && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="absolute inset-0 border-2 border-[#5D4037] rounded-2xl bg-[#5D4037]/5 flex items-center justify-center">
                                        <p className="text-[#5D4037] font-black text-lg">Drop to Upload</p>
                                    </motion.div>
                                )}
                            </div>

                            {/* Uploaded Files */}
                            <AnimatePresence>
                                {files.length > 0 && (
                                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                        className="bg-white rounded-2xl border border-stone-200 p-4 space-y-2">
                                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Uploaded Files ({files.length})</p>
                                        {files.map((f, i) => (
                                            <div key={i} className="flex items-center gap-3 p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                                                <FileIcon format={f.format} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-stone-700 truncate">{f.name}</p>
                                                    <p className="text-[10px] text-stone-400">{formatSize(f.size)}</p>
                                                </div>
                                                {f.uploading ? (
                                                    <Loader2 className="size-4 text-stone-400 animate-spin shrink-0" />
                                                ) : (
                                                    <>
                                                        <CheckCircle className="size-4 text-green-500 shrink-0" />
                                                        <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                                                            className="p-1 text-stone-300 hover:text-red-400 transition-colors">
                                                            <X className="size-3" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Contact Details + Send */}
                            <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Your Contact Details</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-stone-500 mb-1 block">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
                                            <input value={name} onChange={e => setName(e.target.value)}
                                                placeholder="e.g. John Smith"
                                                className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5D4037]/20 focus:border-[#5D4037]" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-stone-500 mb-1 block">WhatsApp Number</label>
                                        <div className="relative">
                                            <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
                                            <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                                                placeholder="e.g. +44 7911 123456"
                                                className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5D4037]/20 focus:border-[#5D4037]" />
                                        </div>
                                    </div>
                                </div>
                                <button onClick={handleSubmit} disabled={submitting}
                                    className="w-full py-3.5 bg-[#3E2723] hover:bg-[#5D4037] text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md hover:shadow-lg">
                                    {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                                    {submitting ? 'Packaging & Sending...' : 'Send to Admin'}
                                </button>
                                <p className="text-[10px] text-stone-400 text-center">
                                    A Pengu admin will review your ticket and contact you on WhatsApp within 1 hour.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
