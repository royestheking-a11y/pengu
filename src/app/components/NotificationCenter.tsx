import React, { useState } from 'react';
import { useStore, Notification } from '../store';
import {
  Bell,
  CheckCircle,
  Clock,
  FileText,
  MessageSquare,
  AlertCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export function NotificationCenter() {
  const { notifications, markNotificationRead, currentUser, clearAllNotifications } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Filter notifications for current user
  const myNotifications = notifications
    .filter(n => n.userId === currentUser?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const unreadCount = myNotifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    myNotifications.forEach(n => {
      if (!n.read) markNotificationRead(n.id);
    });
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markNotificationRead(notification.id);
    }
    setIsOpen(false);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'info': return <MessageSquare className="size-4 text-blue-500" />;
      case 'success': return <CheckCircle className="size-4 text-green-500" />;
      case 'warning': return <AlertCircle className="size-4 text-amber-500" />;
      case 'error': return <AlertCircle className="size-4 text-red-500" />;
      default: return <Bell className="size-4 text-stone-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-stone-100 transition-colors text-stone-500 hover:text-[#5D4037]"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-xl border border-stone-200 z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
                <h3 className="font-bold text-stone-900">Notifications</h3>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs font-medium text-[#5D4037] hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  {myNotifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-xs font-medium text-stone-400 hover:text-red-500 hover:underline ml-2"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {myNotifications.length === 0 ? (
                  <div className="p-8 text-center text-stone-400">
                    <Bell className="mx-auto size-8 mb-2 opacity-20" />
                    <p className="text-sm">No new notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-50">
                    {myNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`
                          p-4 hover:bg-stone-50 cursor-pointer transition-colors relative flex gap-3
                          ${!notification.read ? 'bg-[#5D4037]/5' : ''}
                        `}
                      >
                        {!notification.read && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5D4037]" />
                        )}
                        <div className={`
                            flex-shrink-0 mt-1 size-8 rounded-full flex items-center justify-center
                            ${!notification.read ? 'bg-white shadow-sm' : 'bg-stone-100'}
                        `}>
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm mb-1 ${!notification.read ? 'font-bold text-stone-900' : 'font-medium text-stone-700'}`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-stone-500 mb-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-[10px] text-stone-400">
                            {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
