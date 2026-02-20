import React, { useState, useRef, useEffect, useCallback } from 'react';
import { socketService } from '../lib/socket';
import api from '../../lib/api';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useStore } from '../store';
import { getCleanFileName } from '../lib/fileUtils';
import {
  MessageSquare,
  Send,
  Paperclip,
  MoreVertical,
  Smile,
  CheckCheck,
  Clock,
  FileText,
  X,
  Upload,
  Trash2,
  Download,
  Trash
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { toast } from 'sonner';

type Message = {
  id: string;
  sender: 'user' | 'expert' | 'system';
  content: string;
  timestamp: Date;
  status: 'sent' | 'read';
  attachments?: { name: string; size: string; url?: string; type?: string }[];
};

interface ChatInterfaceProps {
  threadId: string;
  expertName?: string;
  expertAvatar?: string;
  hideHeader?: boolean;
  onViewProfile?: () => void;
  onArchiveChat?: () => void;
  onReportIssue?: () => void;
  onClearChat?: () => void;
  onUnarchiveChat?: () => void;
}

export default function ChatInterface({
  threadId,
  expertName = "Support",
  expertAvatar = "S",
  hideHeader = false,
  onViewProfile,
  onArchiveChat,
  onReportIssue,
  onClearChat,
  onUnarchiveChat
}: ChatInterfaceProps) {
  const { messages: allMessages, addMessage, currentUser } = useStore();
  const threadMessages = allMessages.filter(m => m.threadId === threadId);
  const [newMessage, setNewMessage] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<{ file: File; name: string; size: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const EMOJIS = ['😊', '👍', '🔥', '🙏', '💯', '✨', '🙌', '💡', '✅', '🚀', '⭐', '❤️'];

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Socket Thread Management & Typing Listeners
  useEffect(() => {
    socketService.joinThread(threadId);

    const cleanupTyping = socketService.onTypingStatus((data) => {
      if (data.threadId === threadId && data.userId !== currentUser?.id) {
        setIsTyping(data.isTyping);
      }
    });

    return () => {
      socketService.leaveThread(threadId);
      cleanupTyping?.();
    };
  }, [threadId, currentUser?.id]);

  // Handle local typing emission
  const typingTimeoutRef = useRef<any>(null);

  const handleTyping = useCallback(() => {
    socketService.emitTyping(threadId, true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socketService.emitTyping(threadId, false);
    }, 2000);
  }, [threadId]);

  useEffect(() => {
    if (newMessage) {
      handleTyping();
    }
  }, [newMessage, handleTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Clear Chat function updated for store
  const clearChat = () => {
    if (confirm("Are you sure you want to clear all messages for this thread? This cannot be undone.")) {
      // In this mock, we are just clearing local state for display or we'd need a deleteThread in store
      onClearChat?.();
      toast.success("Chat history cleared from view");
    }
  };

  const exportChat = () => {
    const chatText = threadMessages.map(m => {
      const time = format(new Date(m.timestamp), 'yyyy-MM-dd HH:mm:ss');
      const sender = m.senderId === currentUser?.id ? 'YOU' : m.senderName;
      return `[${time}] ${sender}: ${m.content}`;
    }).join('\n\n');

    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat_history_${threadId.replace(':', '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Chat history exported");
  };

  useEffect(() => {
    scrollToBottom();
  }, [threadMessages, isTyping]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachedFiles.length === 0) return;

    let uploadedAttachments: { name: string; size: string; url: string; type: string }[] = [];

    if (attachedFiles.length > 0) {
      try {
        const uploadPromises = attachedFiles.map(async (af) => {
          const formData = new FormData();
          formData.append('file', af.file);
          const response = await api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          return {
            name: af.name,
            size: af.size,
            url: response.data.url,
            type: response.data.format
          };
        });

        uploadedAttachments = await Promise.all(uploadPromises);
      } catch (error) {
        console.error("Failed to upload files", error);
        toast.error("Failed to upload attachments");
        return;
      }
    }

    addMessage({
      threadId,
      senderId: currentUser?.id || 'anonymous',
      senderName: currentUser?.name || 'User',
      content: newMessage,
      attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined
    });

    setNewMessage('');
    setAttachedFiles([]);

    // Explicitly stop typing immediately on send
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socketService.emitTyping(threadId, false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const newAttachments = files.map(file => ({
        file,
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`
      }));
      setAttachedFiles(prev => [...prev, ...newAttachments]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const newAttachments = files.map(file => ({
        file,
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`
      }));
      setAttachedFiles(prev => [...prev, ...newAttachments]);
    }
  };

  return (
    <Card
      className="flex flex-col h-full overflow-hidden border-stone-200 shadow-sm relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#5D4037]/90 flex flex-col items-center justify-center text-white backdrop-blur-sm"
          >
            <Upload className="size-16 mb-4 animate-bounce" />
            <h3 className="text-xl font-bold">Drop files to attach</h3>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      {!hideHeader && (
        <div className="bg-stone-50 border-b border-stone-100 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full overflow-hidden bg-[#3E2723] text-white flex items-center justify-center font-bold text-sm shadow-sm border border-stone-100">
              {expertAvatar && (expertAvatar.startsWith('http') || expertAvatar.startsWith('https') || expertAvatar.startsWith('/')) ? (
                <img src={expertAvatar} alt={expertName} className="w-full h-full object-cover" />
              ) : (
                expertAvatar
              )}
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm">{expertName}</h3>
              <div className="flex items-center gap-1.5">
                <span className={`size-2 rounded-full ${isTyping ? 'bg-stone-400' : 'bg-green-500'} animate-pulse`} />
                <span className="text-xs text-stone-500">
                  {isTyping ? 'Typing...' : 'Online'}
                </span>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="size-4 text-stone-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Chat Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onViewProfile || (() => toast.info("Viewing profile..."))}>
                View Expert Profile
              </DropdownMenuItem>
              {onUnarchiveChat ? (
                <DropdownMenuItem onClick={onUnarchiveChat}>
                  Unarchive Chat
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={onArchiveChat || (() => toast.info("Archiving conversation..."))}>
                  Archive Chat
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={exportChat}>
                <Download className="mr-2 size-4" /> Export Chat History
              </DropdownMenuItem>
              <DropdownMenuItem onClick={clearChat} className="text-red-600 focus:text-red-600">
                <Trash className="mr-2 size-4" /> Clear Chat
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                onClick={onReportIssue || (() => toast.error("Reporting issue..."))}
              >
                Report an Issue
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/50">
        {threadMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-stone-400 space-y-2">
            <MessageSquare className="size-12 opacity-20" />
            <p className="text-sm">No messages yet. Start a conversation!</p>
          </div>
        )}
        {threadMessages.map((msg, i) => {
          const isUser = msg.senderId === currentUser?.id;
          const isSystem = msg.senderId === 'system';

          if (isSystem) {
            return (
              <div key={msg.id || i} className="flex justify-center my-4">
                <span className="bg-stone-100 text-stone-500 text-xs px-3 py-1 rounded-full border border-stone-200">
                  {msg.content}
                </span>
              </div>
            );
          }

          return (
            <motion.div
              key={msg.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`
                max-w-[80%] rounded-2xl p-4 shadow-sm relative group
                ${isUser
                  ? 'bg-[#5D4037] text-white rounded-tr-none'
                  : 'bg-white border border-stone-100 text-stone-800 rounded-tl-none'}
              `}>
                {!isUser && (
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">
                    {msg.senderName}
                  </p>
                )}
                {msg.content && <p className="text-sm leading-relaxed whitespace-pre-wrap mb-2">{msg.content}</p>}

                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {msg.attachments.map((file, i) => (
                      <a
                        key={i}
                        href={file.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`
                        flex items-center gap-3 p-3 rounded-lg text-sm hover:opacity-80 transition-opacity
                        ${isUser ? 'bg-white/10 text-white border border-white/20' : 'bg-stone-50 text-stone-700 border border-stone-200'}
                      `}>
                        <div className={`p-2 rounded-lg ${isUser ? 'bg-white/20' : 'bg-stone-200'}`}>
                          <FileText className="size-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{getCleanFileName(file.url || file.name)}</p>
                          <p className={`text-xs ${isUser ? 'text-stone-300' : 'text-stone-500'}`}>{file.size}</p>
                        </div>
                        <Download className="size-4 opacity-50" />
                      </a>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-end mt-2">
                  <div className={`
                    text-[10px] flex items-center gap-1 opacity-70
                    ${isUser ? 'text-stone-200' : 'text-stone-400'}
                  `}>
                    {msg.timestamp && !isNaN(new Date(msg.timestamp).getTime()) ? format(new Date(msg.timestamp), 'h:mm a') : ''}
                    {isUser && (
                      <CheckCheck className="size-3" />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white border border-stone-100 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-1">
              <span className="size-2 bg-stone-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="size-2 bg-stone-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="size-2 bg-stone-400 rounded-full animate-bounce" />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attachments Preview */}
      <AnimatePresence>
        {attachedFiles.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-stone-50 border-t border-stone-100 px-4 py-2 flex gap-2 overflow-x-auto"
          >
            {attachedFiles.map((file, i) => (
              <div key={i} className="flex items-center gap-2 bg-white border border-stone-200 rounded-lg pl-3 pr-2 py-1.5 text-xs text-stone-600 shadow-sm shrink-0">
                <FileText className="size-3 text-stone-400" />
                <span className="max-w-[150px] truncate">{file.name}</span>
                <button onClick={() => removeAttachment(i)} className="p-1 hover:bg-stone-100 rounded-full">
                  <X className="size-3 text-stone-400" />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-stone-100">
        <div className="flex items-end gap-2 bg-stone-50 p-2 rounded-xl border border-stone-200 focus-within:ring-2 focus-within:ring-[#5D4037]/10 focus-within:border-[#5D4037] transition-all">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
            multiple
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 text-stone-400 hover:text-stone-600 rounded-lg"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="size-5" />
          </Button>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[40px] py-2 text-sm text-stone-900 placeholder:text-stone-400"
            rows={1}
            style={{ height: 'auto', minHeight: '40px' }}
          />
          <div className="relative" ref={emojiPickerRef}>
            <Button
              variant="ghost"
              size="sm"
              className={`h-9 w-9 p-0 rounded-lg hidden sm:flex transition-colors ${showEmojiPicker ? 'bg-stone-200 text-[#5D4037]' : 'text-stone-400 hover:text-stone-600'}`}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="size-5" />
            </Button>

            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute bottom-full right-0 mb-2 p-2 bg-white border border-stone-200 rounded-xl shadow-xl z-50 grid grid-cols-4 gap-1 w-40"
                >
                  {EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => addEmoji(emoji)}
                      className="size-8 flex items-center justify-center hover:bg-stone-100 rounded-lg transition-colors text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() && attachedFiles.length === 0}
            className={`
              h-9 w-9 p-0 rounded-lg transition-all
              ${newMessage.trim() || attachedFiles.length > 0
                ? 'bg-[#5D4037] text-white hover:bg-[#3E2723]'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'}
            `}
          >
            <Send className="size-4" />
          </Button>
        </div>
        <div className="text-center mt-2">
          <span className="text-[10px] text-stone-400 flex items-center justify-center gap-1">
            <Clock className="size-3" />
            Typically replies within 15 minutes
          </span>
        </div>
      </div>
    </Card >
  );
}
