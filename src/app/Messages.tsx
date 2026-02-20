import React, { useState } from 'react';
import { useStore } from './store';
import { DashboardLayout } from './components/Layout';
import ChatInterface from './components/ChatInterface';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import {
  MessageSquare,
  Search,
  MoreVertical,
  CheckCircle,
  Clock,
  User,
  Archive,
  Inbox
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { EmptyState } from './components/ui/EmptyState';

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: Date;
  unread: number;
  type: 'order' | 'support';
  status: 'active' | 'completed' | 'archived';
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    name: 'Order #1234: Economics Paper',
    lastMessage: 'Here is the draft for your review. Please let me know if you have any feedback.',
    timestamp: new Date(Date.now() - 3600000 * 2),
    unread: 2,
    type: 'order',
    status: 'active'
  },
  {
    id: 'c2',
    name: 'Support Team',
    avatar: 'S',
    lastMessage: 'Your refund request has been processed.',
    timestamp: new Date(Date.now() - 86400000),
    unread: 0,
    type: 'support',
    status: 'active'
  },
  {
    id: 'c3',
    name: 'Order #1230: Chemistry Lab',
    lastMessage: 'Thank you! This looks great.',
    timestamp: new Date(Date.now() - 86400000 * 5),
    unread: 0,
    type: 'order',
    status: 'completed'
  }
];

export default function Messages() {
  const { currentUser, messages: allMessages, orders, experts, users } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'active' | 'archived'>('active');

  // Generate conversations from orders and messages
  const conversations: Conversation[] = orders.flatMap(order => {
    const student = users.find(u => u.id === order.studentId);
    const expert = experts.find(e => e.id === order.expertId);

    const convos: Conversation[] = [];

    // Only show threads relevant to current user
    const isOrderStudent = currentUser?.id === order.studentId;
    const isOrderExpert = currentUser?.id === order.expertId;
    const isAdmin = currentUser?.role === 'admin';

    // Student thread (visible to student and admin)
    if (isOrderStudent || isAdmin) {
      const studentThreadId = `${order.id}:student`;
      const studentMessages = allMessages.filter(m => m.threadId === studentThreadId);
      if (studentMessages.length > 0 || isAdmin) {
        const lastMsg = studentMessages[studentMessages.length - 1];
        convos.push({
          id: studentThreadId,
          name: `Student: ${student?.name || 'Unknown'} (Order #${order.id})`,
          avatar: student?.avatar || student?.name?.charAt(0) || 'S',
          lastMessage: lastMsg?.content || 'No messages yet',
          timestamp: lastMsg ? new Date(lastMsg.timestamp) : new Date(order.createdAt),
          unread: 0,
          type: 'order',
          status: order.status === 'COMPLETED' ? 'completed' : 'active'
        });
      }
    }

    // Expert thread (visible to expert and admin)
    if (isOrderExpert || isAdmin) {
      const expertThreadId = `${order.id}:expert`;
      const expertMessages = allMessages.filter(m => m.threadId === expertThreadId);
      if (expertMessages.length > 0 || isAdmin) {
        const lastMsg = expertMessages[expertMessages.length - 1];
        convos.push({
          id: expertThreadId,
          name: `Expert: ${expert?.name || 'Unknown'} (Order #${order.id})`,
          avatar: expert?.avatar || expert?.name?.charAt(0) || 'E',
          lastMessage: lastMsg?.content || 'No messages yet',
          timestamp: lastMsg ? new Date(lastMsg.timestamp) : new Date(order.createdAt),
          unread: 0,
          type: 'support', // Expert thread is often handled as support
          status: order.status === 'COMPLETED' ? 'completed' : 'active'
        });
      }
    }

    return convos;
  });

  // Add Support threads for Everyone (except Admin sees all users' support threads)
  if (currentUser) {
    if (currentUser.role === 'admin') {
      // Admin sees all threads starting with support:
      // We look at all messages to find unique support threads
      const supportThreads = Array.from(new Set(allMessages.filter(m => m.threadId.startsWith('support:')).map(m => m.threadId)));
      supportThreads.forEach(threadId => {
        const userId = threadId.split(':')[1];
        const user = users.find(u => u.id === userId);
        const threadMessages = allMessages.filter(m => m.threadId === threadId);
        if (threadMessages.length > 0) {
          const lastMsg = threadMessages[threadMessages.length - 1];
          conversations.push({
            id: threadId,
            name: `Support: ${user?.name || 'Unknown User'}`,
            avatar: user?.avatar || user?.name?.charAt(0) || 'U',
            lastMessage: lastMsg.content,
            timestamp: new Date(lastMsg.timestamp),
            unread: 0,
            type: 'support',
            status: 'active'
          });
        }
      });
    } else {
      // Student/Expert sees their personal Support thread
      const supportThreadId = `support:${currentUser.id}`;
      const threadMessages = allMessages.filter(m => m.threadId === supportThreadId);
      const lastMsg = threadMessages[threadMessages.length - 1];

      conversations.push({
        id: supportThreadId,
        name: 'Support Team',
        avatar: 'S',
        lastMessage: lastMsg?.content || 'Need help? Message us!',
        timestamp: lastMsg ? new Date(lastMsg.timestamp) : new Date(currentUser.joinedAt),
        unread: 0,
        type: 'support',
        status: 'active'
      });
    }
  }

  // Final sort
  conversations.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const [selectedId, setSelectedId] = useState<string | null>(conversations.length > 0 ? conversations[0].id : null);

  const selectedConversation = conversations.find(c => c.id === selectedId);

  const filteredConversations = conversations.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    if (view === 'active') {
      return c.status !== 'archived' && matchesSearch;
    } else {
      return c.status === 'archived' && matchesSearch;
    }
  });

  const handleArchive = (id: string) => {
    // In a real app we'd update message status in store
    toast.info("Archiving is not persistent in this mock yet");
  };

  const handleUnarchive = (id: string) => {
    toast.info("Unarchiving is not persistent in this mock yet");
  };

  const handleClearChat = (id: string) => {
    toast.info("Clear chat from list is temporary in this mock");
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6">

        {/* Sidebar List */}
        <Card className="w-full md:w-1/3 flex flex-col overflow-hidden border-stone-200">
          <div className="p-4 border-b border-stone-100 space-y-4">
            <h2 className="text-xl font-bold text-[#3E2723] flex items-center justify-between">
              Messages
              <span className="text-xs bg-[#5D4037]/10 text-[#5D4037] px-2 py-1 rounded-full font-medium">
                {conversations.filter(c => c.unread > 0).length} New
              </span>
            </h2>

            <div className="flex bg-stone-100 p-1 rounded-lg">
              <button
                onClick={() => setView('active')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${view === 'active' ? 'bg-white text-[#3E2723] shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              >
                <Inbox className="size-3.5" />
                Inbox
              </button>
              <button
                onClick={() => setView('archived')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${view === 'archived' ? 'bg-white text-[#3E2723] shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              >
                <Archive className="size-3.5" />
                Archived
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No conversations yet"
                subtitle="Your messaging history is currently empty. Start an order or contact support to begin chatting."
                compact
                className="m-4 bg-transparent border-dashed py-8 shadow-none"
              />
            ) : (
              <div className="divide-y divide-stone-50">
                {filteredConversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={`w-full text-left p-4 hover:bg-stone-50 transition-colors flex gap-3 ${selectedId === conv.id ? 'bg-[#5D4037]/5 border-r-4 border-[#5D4037]' : ''}`}
                  >
                    <div className="relative">
                      <div className={`size-10 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-sm shadow-sm border border-stone-100
                        ${conv.type === 'support' ? 'bg-[#5D4037]' : 'bg-stone-300'}
                      `}>
                        {conv.avatar && (conv.avatar.startsWith('http') || conv.avatar.startsWith('https') || conv.avatar.startsWith('/')) ? (
                          <img src={conv.avatar} alt={conv.name} className="w-full h-full object-cover" />
                        ) : (
                          conv.avatar || <User className="size-5" />
                        )}
                      </div>
                      {conv.unread > 0 && (
                        <div className="absolute -top-1 -right-1 size-3 bg-red-500 rounded-full border-2 border-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className={`font-semibold text-sm truncate ${conv.unread > 0 ? 'text-stone-900' : 'text-stone-600'}`}>
                          {conv.name}
                        </h4>
                        <span className="text-xs text-stone-400 whitespace-nowrap ml-2">
                          {(() => {
                            try {
                              return format(conv.timestamp instanceof Date && !isNaN(conv.timestamp.getTime()) ? conv.timestamp : new Date(), 'MMM d');
                            } catch (e) { return 'N/A'; }
                          })()}
                        </span>
                      </div>
                      <p className={`text-xs truncate ${conv.unread > 0 ? 'text-stone-900 font-medium' : 'text-stone-500'}`}>
                        {conv.type === 'support' && <span className="text-[#5D4037] mr-1">[Support]</span>}
                        {conv.lastMessage}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col overflow-hidden border-stone-200">
          {selectedConversation ? (
            <div className="flex-1 flex flex-col h-full">
              {/* Interface */}
              <div className="flex-1 overflow-hidden relative">
                <ChatInterface
                  threadId={selectedConversation.id}
                  expertName={selectedConversation.name}
                  expertAvatar={selectedConversation.avatar || (selectedId?.endsWith('expert') ? 'E' : 'S')}
                  hideHeader={false}
                  onViewProfile={() => toast.info(`Viewing details of ${selectedConversation.id}`)}
                  onArchiveChat={selectedConversation.status === 'archived' ? undefined : () => handleArchive(selectedConversation.id)}
                  onUnarchiveChat={selectedConversation.status === 'archived' ? () => handleUnarchive(selectedConversation.id) : undefined}
                  onReportIssue={() => toast.warning("Opening support ticket for this conversation...")}
                  onClearChat={() => handleClearChat(selectedConversation.id)}
                />
              </div>
            </div>
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="Select a conversation"
              subtitle="Choose a thread from the list on the left to view messages and start chatting with students or support."
              className="bg-transparent border-none shadow-none"
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
