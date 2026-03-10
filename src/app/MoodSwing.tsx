import React, { useState, useRef, useEffect } from 'react';
import { DashboardLayout } from './components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles, HeartPulse, UserCircle } from 'lucide-react';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import { Skeleton } from './components/ui/skeleton';
import { useStore } from './store';
import api from '../lib/api';
import SEO from './components/SEO';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Message = {
    id?: string;
    _id?: string;
    role: 'model' | 'user';
    content: string;
    timestamp: Date;
};

export default function MoodSwing() {
    const { currentUser } = useStore();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch chat history on component mount
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get('/companion');
                if (response.data && response.data.length > 0) {
                    setMessages(response.data);
                } else {
                    // No history, set the initial default greeting
                    setMessages([
                        {
                            id: '1',
                            role: 'model',
                            content: "Hi there! I'm Pengu. I'm here to listen, support, and help you through whatever you're feeling right now. How's your day going so far?",
                            timestamp: new Date()
                        }
                    ]);
                }
            } catch (error) {
                console.error("Failed to fetch chat history:", error);
                // Fallback to initial greeting on error
                setMessages([
                    {
                        id: '1',
                        role: 'model',
                        content: "Hi there! I'm Pengu. I'm here to listen, support, and help you through whatever you're feeling right now. How's your day going so far?",
                        timestamp: new Date()
                    }
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue.trim(),
            timestamp: new Date()
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInputValue('');
        setIsLoading(true);

        try {
            // Only send the text content to the backend
            const history = newMessages.map(msg => ({ role: msg.role, content: msg.content }));

            const response = await api.post('/companion/chat', { history });

            if (response.data?.reply) {
                const modelMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'model',
                    content: response.data.reply,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, modelMessage]);
            }
        } catch (error: any) {
            console.error('Chat error:', error);
            toast.error(error.response?.data?.message || 'Pengu is taking a quick nap. Please try again!');
            // Remove the user message if failed? Or just leave it? Usually leave it so they can try again or just show error.
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <DashboardLayout>
            <SEO
                title="Mood Swing - Your Personal AI Confidant"
                description="Talk to Pengu, your safe space for emotional support, venting, and personal cheerleading."
                url="https://pengui.tech/student/mood-swing"
            />
            <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-4 md:gap-8 pb-4 md:pb-8">
                {/* Left Side: Avatar & Info - Compact on Mobile */}
                <div className="w-full md:w-1/3 flex flex-col shrink-0">
                    <Card className="p-4 md:p-8 bg-gradient-to-br from-[#3E2723] to-[#5D4037] text-white flex-1 flex flex-row md:flex-col items-center justify-start md:justify-center text-left md:text-center gap-4 md:gap-6 relative overflow-hidden border-none shadow-2xl rounded-3xl group min-h-[0] md:min-h-0">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>

                        <div className="relative z-10 w-16 h-16 md:w-48 md:h-48 rounded-full overflow-hidden border-2 md:border-4 border-amber-400 shadow-[0_0_40px_rgba(251,191,36,0.2)] bg-white/10 backdrop-blur-sm group-hover:scale-105 transition-transform duration-700 shrink-0">
                            <img
                                src="/pengu.png"
                                alt="Pengu Companion"
                                className="w-full h-full object-cover scale-110 translate-y-1 md:translate-y-2"
                            />
                        </div>

                        <div className="relative z-10 space-y-1 md:space-y-3">
                            <div className="inline-flex items-center gap-2 px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-amber-500/20 text-amber-300 text-[8px] md:text-[10px] font-black uppercase tracking-widest border border-amber-500/30">
                                <HeartPulse className="size-3 animate-pulse" /> Always Listening
                            </div>
                            <h2 className="text-lg md:text-3xl font-bold tracking-tight">
                                Mood Swing
                            </h2>
                            <p className="text-stone-300 text-xs md:text-sm leading-relaxed max-w-xs mx-auto hidden md:block">
                                I'm Pengu. Your safe space, your trusted confidant, and your personal cheerleader. Tell me what's on your mind.
                            </p>
                        </div>
                    </Card>
                </div>

                {/* Right Side: Chat Interface */}
                <Card className="w-full md:w-2/3 flex flex-col bg-stone-50/50 backdrop-blur-xl border-stone-200 shadow-xl overflow-hidden rounded-3xl relative">

                    {/* Chat Header */}
                    <div className="h-12 md:h-16 border-b border-stone-200 bg-white/80 backdrop-blur-md px-4 md:px-6 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-amber-100 overflow-hidden border border-amber-200 flex items-center justify-center">
                                    <img src="/pengu.png" alt="Pengu" className="w-8 h-8 object-cover translate-y-1" />
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            <div>
                                <h3 className="font-bold text-[#3E2723] leading-none">Pengu Companion</h3>
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">Online</p>
                            </div>
                        </div>
                        <Sparkles className="text-amber-400 size-5 opacity-50" />
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {isLoading && messages.length === 0 ? (
                            <div className="space-y-6">
                                <div className="flex justify-start">
                                    <div className="flex gap-3 max-w-[85%]">
                                        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                                        <Skeleton className="h-20 w-64 rounded-2xl rounded-bl-sm" />
                                    </div>
                                </div>
                                <div className="flex justify-start">
                                    <div className="flex gap-3 max-w-[85%]">
                                        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                                        <Skeleton className="h-16 w-80 rounded-2xl rounded-bl-sm" />
                                    </div>
                                </div>
                                <div className="flex justify-start">
                                    <div className="flex gap-3 max-w-[85%]">
                                        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                                        <Skeleton className="h-24 w-72 rounded-2xl rounded-bl-sm" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <AnimatePresence initial={false}>
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id || message._id}
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`flex gap-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                                            {/* Avatar */}
                                            <div className="shrink-0 mt-auto mb-1">
                                                {message.role === 'model' ? (
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 overflow-hidden shadow-sm flex items-center justify-center border-2 border-white">
                                                        <img src="/pengu.png" alt="Pengu" className="w-6 h-6 object-cover translate-y-0.5" />
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-stone-200 shadow-sm flex items-center justify-center border-2 border-white">
                                                        {currentUser?.avatar ? (
                                                            <img src={currentUser.avatar} alt="User" className="w-full h-full rounded-full object-cover" />
                                                        ) : (
                                                            <UserCircle className="w-5 h-5 text-stone-500" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Message Bubble */}
                                            <div className={`relative px-5 py-3.5 rounded-2xl shadow-sm text-sm ${message.role === 'user'
                                                ? 'bg-[#3E2723] text-white rounded-br-sm'
                                                : 'bg-white text-stone-800 border border-stone-100 rounded-bl-sm'
                                                }`}>
                                                {message.role === 'model' ? (
                                                    <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-p:mb-2 prose-p:last:mb-0">
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                            {message.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                ) : (
                                                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex justify-start"
                            >
                                <div className="flex gap-3 max-w-[85%]">
                                    <div className="shrink-0 mt-auto mb-1">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 overflow-hidden shadow-sm flex items-center justify-center border-2 border-white">
                                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                                        </div>
                                    </div>
                                    <div className="px-5 py-3.5 rounded-2xl bg-white text-stone-800 border border-stone-100 rounded-bl-sm flex items-center gap-1 shadow-sm">
                                        <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 md:p-4 bg-white border-t border-stone-100 shrink-0">
                        <div className="flex items-end gap-2 md:gap-3 bg-stone-50 rounded-2xl p-1.5 md:p-2 border border-stone-200 focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-400/10 transition-all">
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Share what's on your mind..."
                                className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none focus:ring-0 resize-none py-3 px-4 text-sm text-stone-800 placeholder:text-stone-400"
                                rows={1}
                                style={{ height: 'auto' }}
                            />
                            <Button
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || isLoading}
                                className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#3E2723] to-[#5D4037] hover:from-amber-600 hover:to-amber-500 text-white shrink-0 mb-[2px] shadow-md transition-all disabled:opacity-50"
                            >
                                <Send className="size-4" />
                            </Button>
                        </div>
                        <p className="text-center text-[10px] text-stone-400 mt-3 uppercase tracking-widest font-bold">
                            Pengu is an AI and not a replacement for professional help.
                        </p>
                    </div>

                </Card>
            </div>
        </DashboardLayout>
    );
}
