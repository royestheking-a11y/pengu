import React, { createContext, useContext, useEffect, useState } from 'react';
import { socketService } from './lib/socket';
import api from '../lib/api';
import { toast } from 'sonner';

// --- Types ---
export type Role = 'student' | 'expert' | 'admin';

export interface FileAttachment {
  name: string;
  type: string;
  size: number;
  data: string; // Base64 string or Data URL
  url?: string;
}

export interface User {
  id: string; // Mapped from _id
  name: string;
  email: string;
  password?: string;
  role: Role;
  avatar?: string;
  status: 'active' | 'banned' | 'suspended';
  joinedAt: string;
  token?: string;
  onboardingCompleted?: boolean;
  bio?: string;
  phone?: string;
  pengu_credits?: number;
  total_earned?: number;
}

export interface Request {
  id: string;
  studentId: string;
  serviceType: string;
  topic: string;
  details: string;
  deadline: string;
  status: 'SUBMITTED' | 'QUOTED' | 'NEGOTIATION' | 'ACCEPTED' | 'EXPIRED' | 'CONVERTED';
  createdAt: string;
  files: string[];
  attachments?: FileAttachment[];
}

export interface NegotiationMessage {
  id: string;
  senderId: string;
  senderRole: 'student' | 'admin';
  message: string;
  timestamp: string;
  relatedAmount?: number;
}

export interface Quote {
  id: string;
  requestId: string;
  amount: number;
  currency: string;
  timeline: string;
  milestones: string[];
  revisions: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  version: number;
  scopeNotes: string;
  expiry: string;
  negotiationHistory: NegotiationMessage[];
}

export interface Order {
  id: string;
  requestId: string;
  studentId: string | { id: string; name: string; email: string; _id?: string };
  expertId?: string | { id: string; name: string; email: string; _id?: string };
  topic: string;
  serviceType: string;
  createdAt: string;
  files: string[];
  attachments?: FileAttachment[];
  status: 'PENDING_VERIFICATION' | 'PAID_CONFIRMED' | 'ASSIGNED' | 'IN_PROGRESS' | 'Review' | 'COMPLETED' | 'DISPUTE' | 'CANCELLED';
  progress: number;
  amount: number;
  paymentMethod?: string;
  transactionId?: string;
  paymentStatus?: 'PENDING' | 'VERIFIED' | 'FAILED';
  nextMilestone: string;
  milestones: Milestone[];
  annotations?: Annotation[];
  revisionsResolved?: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'DELIVERED' | 'APPROVED';
  dueDate: string;
  submissions?: (string | FileAttachment)[];
}

export interface Annotation {
  id: string;
  fileUrl: string;
  x: number;
  y: number;
  text: string;
  author: string;
  timestamp: string;
  resolved?: boolean;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  attachments?: { name: string; size: string; url?: string; type?: string }[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface CarouselSlide {
  id: string;
  imageUrl: string;
  linkUrl: string;
  order: number;
  isActive: boolean;
  title: string;
  description: string;
  buttonText: string;
  badge?: string;
}

export interface ExpertProfile {
  id: string;
  userId: string;
  name: string;
  specialty: string;
  status: 'Active' | 'Pending' | 'Suspended';
  online: boolean;
  rating: number;
  completedOrders: number;
  earnings: number;
  joinDate: string;
  avatar: string;
  email: string;
  phone?: string;
  balance: number;
  payoutMethods: PayoutMethod[];
  bio?: string;
  education?: string;
  cvUrl?: string;
  onboardingCompleted?: boolean;
  skills?: string[];
}

export interface Review {
  id: string;
  orderId: string;
  studentId: string;
  expertId: string;
  rating: number;
  text: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface PayoutMethod {
  id: string; // Mapped from _id
  _id?: string; // Raw Mongo ID
  type: 'Bank' | 'bKash' | 'Nagad' | 'Rocket';
  accountName: string;
  accountNumber: string;
  bankName?: string;
  branchName?: string;
  isPrimary: boolean;
}

export interface WithdrawalRequest {
  id: string;
  expertId?: string;
  studentId?: string;
  amount: number;
  amount_credits?: number;
  method?: string;
  phone_number?: string;
  methodId?: string;
  methodDetails?: {
    type: string;
    accountName: string;
    accountNumber: string;
    bankName?: string;
    branchName?: string;
  };
  status: 'PENDING' | 'CONFIRMED' | 'PAID' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}



export interface Skill {
  id: string;
  userId: string;
  name: string;
  category: 'Research' | 'Analysis' | 'Writing' | 'Presentation' | 'Leadership' | 'Technical';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  date: string;
  source: string;
  score: number;
}

export interface SyllabusEvent {
  id: string; // Changed to string for Mongo ID
  title: string;
  date: string;
  type: string;
  course: string;
  weight: string;
}

export interface ExpertApplication {
  id: string;
  userId: string;
  name: string;
  email: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedAt: string;
  skills: { name: string; level: string; score: number }[];
}


export interface FinancialTransaction {
  id: string;
  type: 'PAYOUT' | 'COMMISSION' | 'EXPERT_CREDIT' | 'INCOME' | 'STUDENT_EARNING';
  amount: number;
  expertId: string;
  orderId?: string;
  description: string;
  txRef?: any;
  status?: string;
  date?: string;
  createdAt: string;
}

// --- Store Context ---

interface StoreData {
  currentUser: User | null;
  users: User[];
  requests: Request[];
  quotes: Quote[];
  orders: Order[];
  notifications: Notification[];
  experts: ExpertProfile[];
  login: (email: string, password?: string) => Promise<boolean>;
  loginWithGoogle: (idToken?: string, role?: string, accessToken?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: any) => Promise<boolean>;
  addRequest: (req: Omit<Request, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  createQuote: (quote: Omit<Quote, 'id' | 'status' | 'version' | 'negotiationHistory'>) => void;
  acceptQuote: (quoteId: string, paymentDetails?: { transactionId?: string; method?: string }) => void;
  negotiateQuote: (quoteId: string, message: string, senderRole: 'student' | 'admin') => void;
  updateQuote: (quoteId: string, updates: Partial<Quote>, replyMessage?: string) => void;

  // Notification Actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;

  addUser: (userData: any) => Promise<boolean>;
  updateUserStatus: (id: string, status: User['status']) => void;
  deleteUser: (id: string) => void;

  updateExpertStatus: (id: string, status: ExpertProfile['status']) => void;
  updateExpertProfile: (id: string, data: Partial<ExpertProfile>) => void;
  toggleExpertOnline: (id: string) => void;
  assignExpert: (orderId: string, expertId: string) => void;

  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  verifyOrderPayment: (orderId: string) => Promise<void>;
  rejectOrderPayment: (orderId: string) => Promise<void>;
  updateRequest: (requestId: string, updates: Partial<Request>) => void;
  submitMilestone: (orderId: string, milestoneId: string, files: (string | FileAttachment)[]) => void;
  reviewDeliverable: (orderId: string, milestoneId: string, approved: boolean) => void;

  addPayoutMethod: (expertId: string, method: Omit<PayoutMethod, 'id'>) => void; // Pending real implementation
  removePayoutMethod: (expertId: string, methodId: string) => void; // Pending
  requestWithdrawal: (expertId: string, amount: number, methodId: string) => Promise<void>;
  requestStudentWithdrawal: (amountCredits: number, method: string, phoneNumber: string) => Promise<void>;
  approveStudentWithdrawal: (withdrawalId: string) => Promise<void>;
  rejectStudentWithdrawal: (withdrawalId: string) => Promise<void>;
  updateWithdrawalStatus: (reqId: string, status: WithdrawalRequest['status']) => Promise<void>;


  withdrawalRequests: WithdrawalRequest[];
  financialTransactions: FinancialTransaction[];
  commissionRate: number;
  setCommissionRate: (rate: number) => void;

  messages: Message[];
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => Promise<void>;

  carouselSlides: CarouselSlide[];
  addCarouselSlide: (slide: Omit<CarouselSlide, 'id'>) => Promise<void>;
  updateCarouselSlide: (id: string, updates: Partial<CarouselSlide>) => Promise<void>;
  deleteCarouselSlide: (id: string) => Promise<void>;

  skills: Skill[];
  addSkill: (skill: Omit<Skill, 'id'>) => Promise<void>;

  syllabusEvents: SyllabusEvent[];
  addSyllabusEvent: (event: Omit<SyllabusEvent, 'id'>) => Promise<void>;

  courses: string[]; // List of names
  addCourse: (course: string) => Promise<void>;
  updateCourse: (id: string, newName: string) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;

  expertApplications: ExpertApplication[];
  submitExpertApplication: () => Promise<void>;
  reviewExpertApplication: (appId: string, status: ExpertApplication['status']) => Promise<void>;

  reviews: Review[];
  submitReview: (review: Omit<Review, 'id' | 'createdAt' | 'status'>) => void;
  updateReviewStatus: (reviewId: string, status: Review['status']) => void;

  isInitialized: boolean;
}

const StoreContext = createContext<StoreData | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const item = localStorage.getItem('pengu_final_v4_user');
      return item ? JSON.parse(item) : null;
    } catch { return null; }
  });

  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [experts, setExperts] = useState<ExpertProfile[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [syllabusEvents, setSyllabusEvents] = useState<SyllabusEvent[]>([]);
  const [courses, setCourses] = useState<string[]>([]); // Storing names purely for UI compatibility
  const [courseObjects, setCourseObjects] = useState<{ id: string, name: string, _id?: string }[]>([]); // internal tracker
  const [expertApplications, setExpertApplications] = useState<ExpertApplication[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [financialTransactions, setFinancialTransactions] = useState<FinancialTransaction[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);

  // Pending backend items (Quotes logic is complex, keeping client-side state for now but persisting to Order on accept)
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [commissionRate, setCommissionRateState] = useState(15);

  const setCommissionRate = async (rate: number) => {
    try {
      setCommissionRateState(rate);
      await api.patch('/system/settings', { commissionRate: rate });
    } catch (error) {
      console.error("Error updating commission rate", error);
      toast.error("Failed to persist commission rate to server.");
    }
  };

  const [isInitialized, setIsInitialized] = useState(false);

  // --- Initial Data Load ---
  // --- Initial Data Load ---
  useEffect(() => {
    const normalizeOrder = (o: any) => ({
      ...o,
      id: o._id || o.id,
      milestones: (o.milestones || []).map((m: any) => ({ ...m, id: m._id || m.id }))
    });

    const fetchData = async () => {
      try {
        const promises = [];

        // --- 1. Universal Public Data (Fetch Always) ---
        promises.push(api.get('/experts').then(res => setExperts(res.data.map((d: any) => ({ ...d, id: d._id || d.id })))));
        promises.push(api.get('/carousel').then(res => setCarouselSlides(res.data.map((d: any) => ({ ...d, id: d._id || d.id })))));

        // --- 2. User Specific Data (Fetch only if logged in) ---
        if (currentUser) {
          // Fetch settings for all authenticated users to sync commission rates
          promises.push(api.get('/system/settings').then(res => {
            if (res.data && res.data.commissionRate) {
              setCommissionRateState(res.data.commissionRate);
            }
          }));

          if (currentUser.role === 'admin') {
            promises.push(api.get('/auth/users').then(res => setUsers(res.data.map((d: any) => ({ ...d, id: d._id || d.id })))));
            promises.push(api.get('/requests').then(res => setRequests(res.data.map((d: any) => ({ ...d, id: d._id || d.id })))));
            promises.push(api.get('/quotes').then(res => setQuotes(res.data.map((d: any) => ({ ...d, id: d._id || d.id })))));
            promises.push(api.get('/orders').then(res => setOrders(res.data.map((d: any) => normalizeOrder(d)))));
            promises.push(api.get('/reviews').then(res => setReviews(res.data.map((d: any) => ({ ...d, id: d._id || d.id })))));
            promises.push(api.get('/notifications').then(res => setNotifications(res.data.map((d: any) => ({ ...d, id: d._id || d.id })))));
            promises.push(api.get('/messages').then(res => setMessages(res.data.map((d: any) => ({ ...d, id: d._id || d.id })))));
            promises.push(api.get('/transactions').then(res => setFinancialTransactions(res.data.map((d: any) => ({ ...d, id: d._id || d.id })))));
            promises.push(api.get('/withdrawals').then(res => setWithdrawalRequests(res.data.map((d: any) => ({ ...d, id: d._id || d.id })))));
            promises.push(api.get('/expert-applications').then(res => setExpertApplications(res.data.map((d: any) => ({ ...d, id: d._id || d.id })))));
            promises.push(api.get('/skills').then(res => setSkills(res.data.map((d: any) => ({ ...d, id: d._id || d.id })))));
            promises.push(api.get('/syllabus').then(res => setSyllabusEvents(res.data.map((d: any) => ({ ...d, id: d._id || d.id })))));
            promises.push(api.get('/courses').then(res => {
              setCourseObjects(res.data.map((d: any) => ({ ...d, id: d._id || d.id })));
              setCourses(res.data.map((c: any) => c.name));
            }));

          } else {
            promises.push(api.get('/requests/my').then(res => setRequests(res.data.map((d: any) => ({ ...d, id: d._id || d.id })))));
            promises.push(api.get('/quotes').then(res => setQuotes(res.data.map((d: any) => ({ ...d, id: d._id || d.id })))));

            const orderUrl = currentUser.role === 'expert' ? '/orders/expert/my' : '/orders/my';
            promises.push(api.get(orderUrl).then(res => setOrders(res.data.map((d: any) => normalizeOrder(d)))));

            promises.push(api.get('/messages').then(res => setMessages(res.data.map((d: any) => ({ ...d, id: d._id || d.id })))));
            promises.push(api.get('/notifications/my').then(res => setNotifications(res.data.map((d: any) => ({ ...d, id: d._id || d.id })))));

            if (currentUser.role === 'expert' || currentUser.role === 'student') {
              promises.push(api.get('/withdrawals').then(res => setWithdrawalRequests(res.data.map((d: any) => ({ ...d, id: d._id || d.id })))));
              promises.push(api.get('/transactions').then(res => setFinancialTransactions(res.data.map((d: any) => ({ ...d, id: d._id || d.id })))));
            }
            promises.push(api.get('/skills/my').then(res => setSkills(res.data.map((d: any) => ({ ...d, id: d._id || d.id })))));
            promises.push(api.get('/reviews/my').then(res => setReviews(res.data.map((d: any) => ({ ...d, id: d._id || d.id })))));
            promises.push(api.get('/syllabus').then(res => setSyllabusEvents(res.data.map((d: any) => ({ ...d, id: d._id || d.id })))));
            promises.push(api.get('/courses').then(res => {
              setCourseObjects(res.data.map((d: any) => ({ ...d, id: d._id || d.id })));
              setCourses(res.data.map((c: any) => c.name));
            }));

          }
        }

        await Promise.all(promises);

      } catch (error) {
        console.error("Error loading data", error);
      } finally {
        setIsInitialized(true);
      }
    };

    fetchData();
  }, [currentUser]);

  // Persist User to LocalStorage (Only Session)
  useEffect(() => {
    if (currentUser) localStorage.setItem('pengu_final_v4_user', JSON.stringify(currentUser));
    else localStorage.removeItem('pengu_final_v4_user');
  }, [currentUser]);


  // --- Auth Actions ---
  const login = async (email: string, password?: string) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const user = { ...data, id: data._id };
      setCurrentUser(user);
      return true;
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Login failed");
      return false;
    }
  };

  const loginWithGoogle = async (idToken?: string, role?: string, accessToken?: string) => {
    try {
      const { data } = await api.post('/auth/google', { idToken, role, accessToken });
      const user = { ...data, id: data._id };
      setCurrentUser(user);
      return true;
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Google Login failed");
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    window.location.href = '/login';
  };

  const updateProfile = async (updates: any) => {
    try {
      const { data } = await api.put('/auth/profile', updates);
      const user = { ...data, id: data._id };
      setCurrentUser(user);
      return true;
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Profile update failed");
      return false;
    }
  };


  const addUser = async (userData: any) => {
    try {
      await api.post('/auth/register', userData);
      // Do not auto-login. Let user sign in.
      return true;
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Registration failed");
      return false;
    }
  };

  // --- Socket.io Listeners ---
  useEffect(() => {
    if (currentUser?.id) {
      socketService.init(currentUser.id);
      const socket = (socketService as any).socket;

      const handleMessage = (message: any) => {
        toast.info(`New message from ${message.senderName}`);
      };

      // General Data Updates
      const normalizeOrder = (o: any) => ({ ...o, id: o._id || o.id, milestones: (o.milestones || []).map((m: any) => ({ ...m, id: m._id || m.id })) });

      const handleRequestUpdate = (data: any) => {
        const reqUrl = currentUser.role === 'admin' ? '/requests' : '/requests/my';
        api.get(reqUrl).then(res => setRequests(res.data.map((d: any) => ({ ...d, id: d._id || d.id }))));
        if (currentUser.role === 'admin') toast.info(`New Request: ${data.topic || 'A request was updated.'}`);
      };

      const handleOrderUpdate = (data: any) => {
        const orderUrl = currentUser.role === 'admin' ? '/orders' : currentUser.role === 'expert' ? '/orders/expert/my' : '/orders/my';
        api.get(orderUrl).then(res => setOrders(res.data.map(normalizeOrder)));
        toast.success(`Order Updated: ${data.topic || 'Your order status has changed.'}`);
      };

      const handleWithdrawalUpdate = (data: any) => {
        if (currentUser.role === 'admin') {
          api.get('/withdrawals').then(res => setWithdrawalRequests(res.data.map((d: any) => ({ ...d, id: d._id || d.id }))));
          toast.info('Withdrawal Request updated.');
        }
        if (currentUser.role === 'expert') {
          api.get('/withdrawals').then(res => setWithdrawalRequests(res.data.map((d: any) => ({ ...d, id: d._id || d.id }))));
        }
      };

      const handleQuoteUpdate = (data: any) => {
        api.get('/quotes').then(res => setQuotes(res.data.map((d: any) => ({ ...d, id: d._id || d.id }))));
        const reqUrl = currentUser.role === 'admin' ? '/requests' : '/requests/my';
        api.get(reqUrl).then(res => setRequests(res.data.map((d: any) => ({ ...d, id: d._id || d.id }))));
        if (currentUser.role === 'student') toast.info('You have a new quote ready to review!');
        if (currentUser.role === 'admin') toast.info('Quote status updated.');
      };

      const handleReviewUpdate = (data: any) => {
        api.get('/reviews/my').then(res => setReviews(res.data.map((d: any) => ({ ...d, id: d._id || d.id }))));
        if (currentUser.role === 'expert' && data.status === 'APPROVED') {
          toast.success('Your work was reviewed and approved! Great job.');
        } else if (currentUser.role === 'expert') {
          toast.info('New feedback received on your work.');
        }
      };

      const handleExpertUpdate = (data: any) => {
        // Refresh experts list for admins or own profile for expert
        api.get('/experts').then(res => setExperts(res.data));
        if (currentUser.role === 'expert' && data.userId === currentUser.id) {
          // If own profile updated, maybe refresh currentUser too if relevant
          // currentUser is updated via updateProfile usually, but socket can catch admin-side bans/status changes
        }
      };

      const handleNotification = (data: any) => {
        setNotifications(prev => [{ ...data, id: data._id || data.id }, ...prev]);
        toast.info(data.title || "New Notification");
      };

      const handleTransactionUpdate = (data: any) => {
        const txUrl = currentUser.role === 'admin' ? '/transactions' : '/transactions'; // All same for now
        api.get(txUrl).then(res => setFinancialTransactions(res.data.map((d: any) => ({ ...d, id: d._id || d.id }))));
      };

      if (socket) {
        socket.on('new_message', handleMessage);
        socket.on('request_created', handleRequestUpdate);
        socket.on('request_updated', handleRequestUpdate);
        socket.on('order_created', handleOrderUpdate);
        socket.on('order_updated', handleOrderUpdate);
        socket.on('withdrawal_created', handleWithdrawalUpdate);
        socket.on('withdrawal_updated', handleWithdrawalUpdate);
        socket.on('quote_created', handleQuoteUpdate);
        socket.on('quote_updated', handleQuoteUpdate);
        socket.on('review_created', handleReviewUpdate);
        socket.on('review_updated', handleReviewUpdate);
        socket.on('expert_updated', handleExpertUpdate);
        socket.on('notification_created', handleNotification);
        socket.on('transaction_created', handleTransactionUpdate);
      }

      return () => {
        if (socket) {
          socket.off('new_message', handleMessage);
          socket.off('request_created', handleRequestUpdate);
          socket.off('request_updated', handleRequestUpdate);
          socket.off('order_created', handleOrderUpdate);
          socket.off('order_updated', handleOrderUpdate);
          socket.off('withdrawal_created', handleWithdrawalUpdate);
          socket.off('withdrawal_updated', handleWithdrawalUpdate);
          socket.off('quote_created', handleQuoteUpdate);
          socket.off('quote_updated', handleQuoteUpdate);
          socket.off('review_created', handleReviewUpdate);
          socket.off('review_updated', handleReviewUpdate);
          socket.off('expert_updated', handleExpertUpdate);
          socket.off('notification_created', handleNotification);
          socket.off('transaction_created', handleTransactionUpdate);
        }
      };
    }
  }, [currentUser]);

  // --- Core Actions ---
  const addRequest = async (req: any) => {
    try {
      const { data } = await api.post('/requests', req);
      const mappedData = { ...data, id: data._id || data.id };
      setRequests(prev => [...prev, mappedData]);
      toast.success("Request submitted");
    } catch (e) { toast.error("Failed to submit request"); }
  };

  const updateRequest = async (id: string, updates: any) => {
    // Missing API endpoint for update request provided in older steps, assuming CRUD works
    // Logic from local store:
    setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };


  // --- Notifications ---
  const addNotification = async (n: any) => {
    try {
      const { data } = await api.post('/notifications', n);
      const mappedData = { ...data, id: data._id || data.id };
      setNotifications(prev => [mappedData, ...prev]);
    } catch (e) { console.error(e); }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) { console.error(e); }
  };

  const clearAllNotifications = async () => {
    try {
      await api.delete('/notifications/clear');
      setNotifications([]);
    } catch (e) { console.error(e); }
  };


  // --- CMS Actions ---
  const addCarouselSlide = async (slide: any) => {
    try {
      const { data } = await api.post('/carousel', slide);
      const mappedData = { ...data, id: data._id || data.id };
      setCarouselSlides(prev => [...prev, mappedData]);
      toast.success("Slide added");
    } catch (e) { toast.error("Failed to add slide"); }
  };

  const updateCarouselSlide = async (id: string, updates: any) => {
    try {
      const { data } = await api.put(`/carousel/${id}`, updates);
      const mappedData = { ...data, id: data._id || data.id };
      setCarouselSlides(prev => prev.map(s => s.id === id ? mappedData : s));
      toast.success("Slide updated");
    } catch (e) { toast.error("Failed update"); }
  };

  const deleteCarouselSlide = async (id: string) => {
    try {
      await api.delete(`/carousel/${id}`);
      setCarouselSlides(prev => prev.filter(s => s.id !== id));
      toast.success("Slide deleted");
    } catch (e) { toast.error("Failed delete"); }
  };

  const addCourse = async (name: string) => {
    try {
      const { data } = await api.post('/courses', { name });
      const mappedData = { ...data, id: data._id || data.id };
      setCourseObjects(prev => [...prev, mappedData]);
      setCourses(prev => [...prev, mappedData.name]);
    } catch (e) { toast.error("Failed to add course"); }
  };

  const updateCourse = async (id: string, name: string) => {
    // Treat id as either name or real ID
    const course = courseObjects.find(c => c.name === id) || courseObjects.find(c => c.id === id);
    if (!course) return;

    try {
      const courseId = course._id || course.id;
      const { data } = await api.put(`/courses/${courseId}`, { name });
      const mappedData = { ...data, id: data._id || data.id };
      setCourseObjects(prev => prev.map(c => (c._id === courseId || c.id === courseId) ? mappedData : c));
      setCourses(prev => prev.map(c => c === course.name ? mappedData.name : c));
    } catch (e) { toast.error("Failed update"); }
  };

  const deleteCourse = async (id: string) => {
    const course = courseObjects.find(c => c.name === id) || courseObjects.find(c => c.id === id);
    if (!course) return;
    try {
      const courseId = course._id || course.id;
      await api.delete(`/courses/${courseId}`);
      setCourseObjects(prev => prev.filter(c => (c._id !== courseId && c.id !== courseId)));
      setCourses(prev => prev.filter(c => c !== course.name));
    } catch (e) { toast.error("Failed delete"); }
  };

  const addSyllabusEvent = async (event: any) => {
    try {
      const { data } = await api.post('/syllabus', event);
      const mappedData = { ...data, id: data._id || data.id };
      setSyllabusEvents(prev => [...prev, mappedData]);
      toast.success("Event added");
    } catch (e) { toast.error("Failed add"); }
  };


  // --- Finance ---
  const requestWithdrawal = async (expertId: string, amount: number, methodId: string) => {
    try {
      const { data } = await api.post('/withdrawals', { amount, methodId });
      const mappedData = {
        ...data,
        id: data._id || data.id,
        createdAt: data.createdAt
      };
      setWithdrawalRequests(prev => [mappedData, ...prev]);
      toast.success("Withdrawal requested");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed withdrawal request");
    }
  };

  const updateWithdrawalStatus = async (id: string, status: any) => {
    try {
      const { data } = await api.put(`/withdrawals/${id}`, { status });
      const mappedData = {
        ...data,
        id: data._id || data.id,
        createdAt: data.createdAt
      };

      setWithdrawalRequests(prev => prev.map(r => r.id === id ? mappedData : r));

      // If PAID, update local expert balance for immediate feedback
      if (status === 'PAID') {
        // Find the withdrawal to get expertId and amount
        const request = withdrawalRequests.find(r => r.id === id);
        if (request) {
          setExperts(prev => prev.map(e => {
            if (e.id === request.expertId) {
              return { ...e, balance: e.balance - request.amount };
            }
            return e;
          }));
        }
      }

      toast.success(`Withdrawal ${status.toLowerCase()}`);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed update");
    }
  };

  // --- Expert App ---
  const submitExpertApplication = async () => {
    try {
      const { data } = await api.post('/expert-applications');
      const mappedData = { ...data, id: data._id || data.id };
      setExpertApplications(prev => [...prev, mappedData]);
      toast.success("Application submitted");
    } catch (e: any) { toast.error(e.response?.data?.message || "Failed"); }
  };

  const reviewExpertApplication = async (id: string, status: any) => {
    try { // using crud update
      const { data } = await api.put(`/expert-applications/${id}`, { status });
      const mappedData = { ...data, id: data._id || data.id };
      setExpertApplications(prev => prev.map(a => a.id === id ? mappedData : a));
      toast.success("Application updated");
    } catch (e) { toast.error("Failed"); }
  };


  // --- Messaging ---
  const addMessage = async (msg: any) => {
    try {
      const { data } = await api.post('/messages', msg);
      const mappedData = { ...data, id: data._id || data.id };
      setMessages(prev => [...prev, mappedData]);
    } catch (e) { console.error(e); }
  };


  // --- Existing logic for Quote/Order (Hybrid) ---
  const createQuote = async (quoteData: any) => {
    try {
      const { data } = await api.post('/quotes', quoteData);
      const mappedQuote = { ...data, id: data._id || data.id };

      setQuotes(prev => [...prev, mappedQuote]);
      // Also update request status locally to reflect change immediately
      setRequests(prev => prev.map(r => r.id === quoteData.requestId ? { ...r, status: 'QUOTED' } : r));

      toast.success("Quote sent successfully");
    } catch (e) {
      console.error(e);
      toast.error("Failed to send quote");
    }
  };

  const acceptQuote = async (quoteId: string, paymentDetails?: { transactionId?: string; method?: string }) => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return;
    try {
      const reqItem = requests.find(r => r.id === quote.requestId);
      if (!reqItem) return;
      const { data } = await api.post('/orders', {
        requestId: reqItem.id,
        topic: reqItem.topic,
        serviceType: reqItem.serviceType,
        amount: quote.amount,
        files: reqItem.files,
        milestones: quote.milestones,
        paymentMethod: paymentDetails?.method,
        transactionId: paymentDetails?.transactionId
      });
      const newOrder = { ...data, id: data._id || data.id };
      setOrders(prev => [...prev, newOrder]);
      setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status: 'ACCEPTED' } : q));
      setRequests(prev => prev.map(r => r.id === quote.requestId ? { ...r, status: 'CONVERTED' } : r));
      toast.success("Order confirmed!");
    } catch (e) { toast.error("Failed order creation"); }
  };

  const updateOrder = async (id: string, updates: any) => {
    try {
      const { data } = await api.put(`/orders/${id}`, updates);
      const updatedOrder = {
        ...data,
        id: data._id || data.id,
        milestones: (data.milestones || []).map((m: any) => ({ ...m, id: m._id || m.id }))
      };
      setOrders(prev => prev.map(o => o.id === id ? updatedOrder : o));
      if (updates.status) toast.success(`Order status: ${updates.status}`);
    } catch (e) { toast.error("Failed update order"); }
  };

  const verifyOrderPayment = async (orderId: string) => {
    try {
      const { data } = await api.put(`/orders/${orderId}/payment/verify`);
      const updatedOrder = { ...data, id: data._id || data.id, milestones: (data.milestones || []).map((m: any) => ({ ...m, id: m._id || m.id })) };

      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o)); // Update Order

      // Also fetch new transaction to update stats immediately
      // Since verifyPayment created a transaction, we need to pull it
      const txRes = await api.get('/transactions'); // Optimally we'd just push the new one if returned, but backend returns order
      setFinancialTransactions(txRes.data.map((d: any) => ({ ...d, id: d._id || d.id })));

      toast.success("Payment verified & recorded");
    } catch (e) { toast.error("Verification failed"); }
  };

  const rejectOrderPayment = async (orderId: string) => {
    try {
      const { data } = await api.put(`/orders/${orderId}/payment/reject`);
      const updatedOrder = { ...data, id: data._id || data.id, milestones: (data.milestones || []).map((m: any) => ({ ...m, id: m._id || m.id })) };
      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
      toast.success("Payment rejected");
    } catch (e) { toast.error("Rejection failed"); }
  };

  // --- Complex Actions ---

  const assignExpert = async (orderId: string, expertId: string) => {
    try {
      const { data } = await api.put(`/orders/${orderId}`, { expertId, status: 'ASSIGNED' });
      const mappedData = {
        ...data,
        id: data._id || data.id,
        milestones: (data.milestones || []).map((m: any) => ({ ...m, id: m._id || m.id }))
      };
      setOrders(prev => prev.map(o => o.id === orderId ? mappedData : o));
      toast.success("Expert assigned");
    } catch (e) { toast.error("Failed to assign expert"); }
  };

  const submitMilestone = async (orderId: string, milestoneId: string, files: any[]) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Construct updated milestones array
    const updatedMilestones = order.milestones.map(m =>
      m.id === milestoneId ? { ...m, status: 'DELIVERED', submissions: files } : m
    );

    try {
      const { data } = await api.put(`/orders/${orderId}`, {
        milestones: updatedMilestones,
        status: 'Review'
      });
      const mappedData = {
        ...data,
        id: data._id || data.id,
        milestones: (data.milestones || []).map((m: any) => ({ ...m, id: m._id || m.id }))
      };
      setOrders(prev => prev.map(o => o.id === orderId ? mappedData : o));
      toast.success("Milestone submitted");
    } catch (e) { toast.error("Failed submission"); }
  };

  const reviewDeliverable = async (orderId: string, milestoneId: string, approved: boolean) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const updatedMilestones = order.milestones.map(m =>
      m.id === milestoneId ? { ...m, status: approved ? 'APPROVED' : 'IN_PROGRESS' } : m
    );

    // Progress calculation
    const completedCount = updatedMilestones.filter(m => m.status === 'APPROVED').length;
    const progress = Math.round((completedCount / updatedMilestones.length) * 100);
    const isComplete = progress === 100;

    try {
      const { data } = await api.put(`/orders/${orderId}`, {
        milestones: updatedMilestones,
        progress,
        status: isComplete ? 'COMPLETED' : 'IN_PROGRESS'
      });
      const mappedData = {
        ...data,
        id: data._id || data.id,
        milestones: (data.milestones || []).map((m: any) => ({ ...m, id: m._id || m.id }))
      };
      setOrders(prev => prev.map(o => o.id === orderId ? mappedData : o));

      if (isComplete) {
        // Trigger Expertt Stats Update via API if needed (backend usually handles this trigger)
        // But strictly mapping frontend logic:
        if (order.expertId) {
          // In a real app backend does this. Here we leave it to backend hooks.
        }
      }
      toast.success(approved ? "Approved" : "Revision requested");
    } catch (e) { toast.error("Failed to review"); }
  };

  const updateExpertStatus = async (id: string, status: any) => {
    // Assuming 'id' is userId (from expert list view usually)
    try {
      const expertP = experts.find(e => e.id === id); // id in frontend expert list is UserID usually
      if (!expertP) return;

      const { data } = await api.put(`/experts/${id}`, { status });
      // Note: expert routes might need adjustment to generic update if not /profile
      // For admin update, we reused profile path or need generic update. 
      // Let's use generic CRUD on backend for admin: api/experts/:id (if implemented as CRUD)
      // Re-checking expertRoutes... it has /:id get. 
      // Let's assume we add PUT /:id for Admin in expertRoutes. (Doing in next step to be safe)
      setExperts(prev => prev.map(e => e.id === id ? { ...e, status } : e));
      toast.success("Status updated");
    } catch (e) { toast.error("Failed update"); }
  };

  const toggleExpertOnline = async (id: string) => {
    try {
      const { data } = await api.put(`/experts/${id}/online`);
      setExperts(prev => prev.map(e => e.id === id ? { ...e, online: data.online } : e));

      if (data.online) {
        toast.success("You are now Online", { description: "You can now receive new orders." });
      } else {
        toast("You are now Offline", {
          description: "Warning: You will not receive any new orders while offline.",
          icon: '⚠️'
        });
      }
    } catch (e) { toast.error("Failed toggle"); }
  };

  const submitReview = async (review: any) => {
    try {
      const { data } = await api.post('/reviews', review);
      const mappedData = { ...data, id: data._id || data.id };
      setReviews(prev => [...prev, mappedData]);
      toast.success("Review submitted");
    } catch (e) { toast.error("Failed submit"); }
  };

  const updateReviewStatus = async (id: string, status: any) => {
    try {
      const { data } = await api.put(`/reviews/${id}`, { status });
      setReviews(prev => prev.map(r => r.id === id ? data : r));
      toast.success("Review updated");
    } catch (e) { toast.error("Failed update"); }
  };

  const addSkill = async (skill: any) => {
    try {
      const { data } = await api.post('/skills', skill);
      const mappedData = { ...data, id: data._id || data.id };
      setSkills(prev => [...prev, mappedData]);
      toast.success("Skill added");
    } catch (e) { toast.error("Failed add"); }
  };

  const updateExpertProfile = async (id: string, data: Partial<ExpertProfile>) => {
    try {
      const targetExpert = experts.find(e => e.id === id);
      const isSelf = currentUser?.role === 'expert' && (currentUser.id === id || targetExpert?.userId === currentUser.id);

      if (isSelf) {
        await api.put('/experts/profile', data);
        // If onboarding is completed, update currentUser status locally to allow dashboard access
        if (data.onboardingCompleted && currentUser) {
          setCurrentUser({ ...currentUser, onboardingCompleted: true });
        }
      } else {
        // Admin update
        await api.put(`/experts/${id}`, data);
      }
      setExperts(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
      toast.success("Profile updated");
    } catch (e) { toast.error("Failed update"); }
  };

  // Placeholders that need implementation if used
  const addPayoutMethod = async (expertId: string, method: any) => {
    try {
      const { data } = await api.post('/experts/payout-methods', method);
      setExperts(prev => prev.map(e => {
        // expertId passed from Settings is currentUser.id (User ID).
        // e.userId is User ID. Match by that.
        if (e.userId === expertId) {
          return { ...e, payoutMethods: [...e.payoutMethods, data] };
        }
        return e;
      }));
      toast.success("Payout method added");
    } catch (e) { toast.error("Failed to add method"); }
  };
  const removePayoutMethod = async (expertId: string, methodId: string) => {
    if (!methodId) {
      toast.error("Invalid method ID");
      return;
    }
    try {
      await api.delete(`/experts/payout-methods/${methodId}`);
      setExperts(prev => prev.map(e => {
        if (e.userId === expertId) {
          return { ...e, payoutMethods: e.payoutMethods.filter(m => m._id !== methodId && m.id !== methodId) };
        }
        return e;
      }));
      toast.success("Payout method removed");
    } catch (e) { toast.error("Failed to remove method"); }
  };
  const deleteUser = async (id: string) => {
    try {
      await api.delete(`/auth/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success("User deleted");
    } catch (e) { toast.error("Failed to delete user"); }
  };

  const updateUserStatus = async (id: string, status: any) => {
    try {
      const { data } = await api.put(`/auth/users/${id}/status`, { status });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
      toast.success("User status updated");
    } catch (e) { toast.error("Failed to update status"); }
  };
  const negotiateQuote = async (id: string, message: string, senderRole: 'student' | 'admin') => {
    try {
      const { data } = await api.put(`/quotes/${id}`, { negotiationMessage: message });
      const mapped = { ...data, id: data._id || data.id };
      setQuotes(prev => prev.map(q => q.id === id ? mapped : q));
      toast.success("Message sent");

      // If student, update request status locally to show interaction?
      // For now, quote update is enough.
    } catch (e) { toast.error("Failed to send message"); }
  };

  const updateQuote = async (id: string, updates: any) => {
    try {
      const { data } = await api.put(`/quotes/${id}`, updates);
      const mapped = { ...data, id: data._id || data.id };
      setQuotes(prev => prev.map(q => q.id === id ? mapped : q));
      toast.success("Quote updated");
    } catch (e) { toast.error("Failed update"); }
  };

  const requestStudentWithdrawal = async (amountCredits: number, method: string, phoneNumber: string) => {
    try {
      const { data } = await api.post('/withdrawals/student/request', { amountCredits, method, phoneNumber });
      const mappedData = { ...data, id: data._id || data.id };
      setWithdrawalRequests(prev => [mappedData, ...prev]);

      // Update local credits immediately
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          pengu_credits: (currentUser.pengu_credits || 0) - amountCredits
        });
      }
      toast.success("Withdrawal requested successfully!");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to request withdrawal");
    }
  };

  const approveStudentWithdrawal = async (withdrawalId: string) => {
    try {
      const { data } = await api.post('/withdrawals/admin/approve', { withdrawalId });
      const mappedData = { ...data, id: data._id || data.id };
      setWithdrawalRequests(prev => prev.map(r => r.id === withdrawalId ? mappedData : r));

      // Also refresh transactions
      const txRes = await api.get('/transactions');
      setFinancialTransactions(txRes.data.map((d: any) => ({ ...d, id: d._id || d.id })));

      toast.success("Withdrawal approved!");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to approve withdrawal");
    }
  };

  const rejectStudentWithdrawal = async (withdrawalId: string) => {
    try {
      const { data } = await api.post('/withdrawals/admin/reject', { withdrawalId });
      const mappedData = { ...data, id: data._id || data.id };
      setWithdrawalRequests(prev => prev.map(r => r.id === withdrawalId ? mappedData : r));

      // Update student credits locally if it's the current user (highly unlikely for admin but good practice)
      if (currentUser && data.studentId === currentUser.id) {
        setCurrentUser({
          ...currentUser,
          pengu_credits: (currentUser.pengu_credits || 0) + data.amount_credits
        });
      }

      toast.success("Withdrawal rejected and credits refunded");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to reject withdrawal");
    }
  };



  return (
    <StoreContext.Provider value={{
      currentUser, users, requests, quotes, orders, notifications, experts, withdrawalRequests,
      financialTransactions, commissionRate, setCommissionRate,
      messages, addMessage,
      carouselSlides, addCarouselSlide, updateCarouselSlide, deleteCarouselSlide,
      login, loginWithGoogle, logout, addRequest, createQuote, acceptQuote, negotiateQuote, updateQuote,
      addNotification, markNotificationRead, clearAllNotifications,
      addUser, updateUserStatus, deleteUser, updateProfile,
      updateExpertStatus, updateExpertProfile, toggleExpertOnline, assignExpert,
      updateOrder, verifyOrderPayment, rejectOrderPayment, updateRequest,
      submitMilestone, reviewDeliverable, addPayoutMethod, removePayoutMethod,
      requestWithdrawal, requestStudentWithdrawal, approveStudentWithdrawal, rejectStudentWithdrawal,
      updateWithdrawalStatus,
      skills, addSkill, syllabusEvents, addSyllabusEvent, courses, addCourse, updateCourse, deleteCourse,
      expertApplications, submitExpertApplication, reviewExpertApplication,
      reviews, submitReview, updateReviewStatus,
      isInitialized
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) throw new Error('useStore must be used within a StoreProvider');
  return context;
}
