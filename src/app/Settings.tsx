import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from './store';
import { DashboardLayout } from './components/Layout';
import { Card } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Button } from './components/ui/button';
import {
  User,
  Bell,
  Shield,
  CreditCard,
  LogOut,
  Camera,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import api from '../lib/api'; // Import API

export default function Settings() {
  const { currentUser, logout, experts, addPayoutMethod, removePayoutMethod, updateProfile } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as any) || 'profile';
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'billing'>(initialTab);

  // Sync tab with URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab as any);
    }
  }, [searchParams]);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };
  const [loading, setLoading] = useState(false);

  // Form state initialized from currentUser
  const [profile, setProfile] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    bio: currentUser?.bio || '',
    phone: currentUser?.phone || '',
    avatar: currentUser?.avatar || ''
  });

  const [notifications, setNotifications] = useState({
    emailOrderUpdates: true,
    emailMarketing: false,
    pushMessages: true,
    pushMilestones: true
  });

  // Update local state if currentUser changes (e.g. after save)
  useEffect(() => {
    if (currentUser) {
      setProfile(prev => ({
        ...prev,
        name: currentUser.name || prev.name,
        email: currentUser.email || prev.email,
        bio: currentUser.bio || prev.bio,
        phone: currentUser.phone || prev.phone,
        avatar: currentUser.avatar || prev.avatar
      }));
    }
  }, [currentUser]);

  const handleSave = async () => {
    setLoading(true);
    const success = await updateProfile({
      name: profile.name,
      email: profile.email,
      bio: profile.bio,
      phone: profile.phone,
      avatar: profile.avatar
    });
    setLoading(false);
    if (success) toast.success('Settings saved successfully!');
  };

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    ...(currentUser?.role === 'expert' ? [{ id: 'billing', label: 'Billing & Payouts', icon: CreditCard }] : [])
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3E2723]">Settings</h1>
          <p className="text-stone-500">Manage your account preferences and profile.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <Card className="h-fit p-2 md:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as any)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
                    ${activeTab === tab.id
                      ? 'bg-[#5D4037] text-white shadow-md'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'}
                  `}
                >
                  <tab.icon className="size-4" />
                  {tab.label}
                </button>
              ))}
              <div className="pt-4 mt-4 border-t border-stone-100">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="size-4" />
                  Sign Out
                </button>
              </div>
            </nav>
          </Card>

          {/* Content Area */}
          <div className="md:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card className="p-8">
                    <h2 className="text-lg font-bold text-stone-900 mb-6">Profile Information</h2>

                    {/* Avatar */}
                    <div className="flex items-center gap-6 mb-8">
                      <div className="relative group cursor-pointer">
                        <div className="size-24 rounded-full bg-[#5D4037] text-white flex items-center justify-center text-3xl font-bold border-4 border-white shadow-lg overflow-hidden">
                          {profile.avatar ? (
                            <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            profile.name.charAt(0)
                          )}
                        </div>
                        <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <Camera className="size-8 text-white" />
                        </label>
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            try {
                              const formData = new FormData();
                              formData.append('file', file);

                              toast.loading("Uploading avatar...");
                              const response = await api.post('/upload', formData, {
                                headers: { 'Content-Type': 'multipart/form-data' }
                              });

                              setProfile(prev => ({ ...prev, avatar: response.data.url }));
                              toast.dismiss();
                              toast.success("Avatar updated!");
                            } catch (error) {
                              console.error("Avatar upload failed", error);
                              toast.dismiss();
                              toast.error("Failed to upload avatar");
                            }
                          }}
                        />
                      </div>
                      <div>
                        <Button variant="outline" size="sm" className="mb-2" onClick={() => document.getElementById('avatar-upload')?.click()}>Change Avatar</Button>
                        <p className="text-xs text-stone-500">JPG, GIF or PNG. Max size 800K</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input
                          value={profile.email}
                          disabled
                          className="bg-stone-50 text-stone-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Bio</Label>
                        <textarea
                          className="w-full p-3 rounded-md border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5D4037] min-h-[100px]"
                          value={profile.bio}
                          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                      <Button onClick={handleSave} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card className="p-8">
                    <h2 className="text-lg font-bold text-stone-900 mb-6">Notification Preferences</h2>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between pb-6 border-b border-stone-100">
                        <div>
                          <h3 className="font-medium text-stone-900">Order Updates</h3>
                          <p className="text-sm text-stone-500">Receive emails about your order status changes.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={notifications.emailOrderUpdates}
                            onChange={(e) => setNotifications({ ...notifications, emailOrderUpdates: e.target.checked })}
                          />
                          <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#5D4037]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5D4037]"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between pb-6 border-b border-stone-100">
                        <div>
                          <h3 className="font-medium text-stone-900">New Messages</h3>
                          <p className="text-sm text-stone-500">Get notified when you receive a message.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={notifications.pushMessages}
                            onChange={(e) => setNotifications({ ...notifications, pushMessages: e.target.checked })}
                          />
                          <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#5D4037]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5D4037]"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between pb-6 border-b border-stone-100">
                        <div>
                          <h3 className="font-medium text-stone-900">Marketing Emails</h3>
                          <p className="text-sm text-stone-500">Receive news, updates, and special offers.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={notifications.emailMarketing}
                            onChange={(e) => setNotifications({ ...notifications, emailMarketing: e.target.checked })}
                          />
                          <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#5D4037]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5D4037]"></div>
                        </label>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                      <Button onClick={handleSave} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Preferences'}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card className="p-8">
                    <h2 className="text-lg font-bold text-stone-900 mb-6">Security Settings</h2>

                    <div className="space-y-4 max-w-md">
                      <div className="space-y-2">
                        <Label>Current Password</Label>
                        <Input type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label>New Password</Label>
                        <Input type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label>Confirm New Password</Label>
                        <Input type="password" />
                      </div>

                      <Button className="mt-4" onClick={() => toast.success('Password updated!')}>
                        Update Password
                      </Button>
                    </div>

                    <div className="mt-8 pt-8 border-t border-stone-100">
                      <h3 className="text-red-600 font-bold mb-2">Danger Zone</h3>
                      <p className="text-sm text-stone-500 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                      <Button
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                        onClick={() => {
                          if (window.confirm("ARE YOU ABSOLUTELY SURE? This will permanently delete your account and all associated data. This action cannot be undone.")) {
                            toast.error("Account deleted permanently.");
                            logout();
                          }
                        }}
                      >
                        Delete Account
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}
              {activeTab === 'billing' && currentUser?.role === 'expert' && (
                <motion.div
                  key="billing"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card className="p-8">
                    <h2 className="text-lg font-bold text-stone-900 mb-6">Billing & Payouts</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="p-6 bg-[#5D4037]/5 rounded-xl border border-[#5D4037]/10">
                        <p className="text-stone-500 text-sm font-medium mb-1">Available Balance</p>
                        <h3 className="text-3xl font-bold text-[#3E2723]">TK {experts.find(e => e.userId === currentUser.id)?.balance?.toLocaleString() || 0}</h3>
                        <Button className="mt-4 w-full" variant="outline" onClick={() => toast.info("Go to Payouts page to withdraw.")}>
                          Withdraw Funds
                        </Button>
                      </div>
                      <div className="p-6 bg-stone-50 rounded-xl border border-stone-100">
                        <p className="text-stone-500 text-sm font-medium mb-1">Total Earnings</p>
                        <h3 className="text-3xl font-bold text-stone-900">{experts.find(e => e.userId === currentUser.id)?.earnings?.toLocaleString() || 'TK 0'}</h3>
                        <p className="text-xs text-green-600 font-medium mt-2 flex items-center gap-1">
                          +12% from last month
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h3 className="font-bold text-stone-900 border-b border-stone-100 pb-2">Payout Methods</h3>

                      <div className="space-y-4">
                        {(experts.find(e => e.userId === currentUser.id)?.payoutMethods || []).map((method, index) => (
                          <div key={method.id || method._id || index} className="flex items-center justify-between p-4 border border-stone-200 rounded-xl hover:border-[#5D4037]/30 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="size-10 bg-stone-100 rounded-full flex items-center justify-center">
                                <CreditCard className="size-5 text-stone-600" />
                              </div>
                              <div>
                                <p className="font-medium text-stone-900">
                                  {method.type} {method.isPrimary && <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase">Primary</span>}
                                </p>
                                <p className="text-xs text-stone-500">
                                  {method.accountName && method.accountNumber ? `${method.accountName} • ${method.accountNumber}` : 'Incomplete Details'}
                                  {method.type === 'Bank' && method.bankName && ` • ${method.bankName}`}
                                  {method.type === 'Bank' && method.branchName && ` (${method.branchName})`}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => removePayoutMethod(currentUser.id, method.id || method._id)}>
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}

                        {/* Add Method Form / Quick Inline Add */}
                        <PayoutMethodForm expertId={currentUser.id} onSuccess={() => toast.success('Method added!')} />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function PayoutMethodForm({ expertId, onSuccess }: { expertId: string; onSuccess: () => void }) {
  const { addPayoutMethod } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [method, setMethod] = useState({
    type: 'Bank' as const,
    accountName: '',
    accountNumber: '',
    bankName: '',
    branchName: '',
    isPrimary: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!method.accountName || !method.accountNumber) {
      toast.error('Please fill in all fields');
      return;
    }
    if (method.type === 'Bank' && (!method.bankName || !method.branchName)) {
      toast.error('Please fill in bank and branch names');
      return;
    }
    addPayoutMethod(expertId, method);
    setMethod({ type: 'Bank', accountName: '', accountNumber: '', bankName: '', branchName: '', isPrimary: false });
    setShowForm(false);
    onSuccess();
  };

  if (!showForm) {
    return (
      <Button
        variant="outline"
        className="w-full border-dashed py-6 text-stone-500 hover:text-[#5D4037] hover:border-[#5D4037]/50"
        onClick={() => setShowForm(true)}
      >
        + Add New Payout Method
      </Button>
    );
  }

  return (
    <Card className="p-4 border-[#5D4037]/20 bg-stone-50">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Method Type</Label>
            <select
              className="w-full h-10 px-3 rounded-md border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
              value={method.type}
              onChange={(e) => setMethod({ ...method, type: e.target.value as any })}
            >
              <option value="Bank">Bank Transfer</option>
              <option value="bKash">bKash</option>
              <option value="Nagad">Nagad</option>
              <option value="Rocket">Rocket</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Account Name</Label>
            <Input
              placeholder="e.g. John Doe"
              value={method.accountName}
              onChange={(e) => setMethod({ ...method, accountName: e.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Account Number / Phone</Label>
            <Input
              placeholder="e.g. 017XXXXXXXX"
              value={method.accountNumber}
              onChange={(e) => setMethod({ ...method, accountNumber: e.target.value })}
            />
          </div>
          {method.type === 'Bank' && (
            <>
              <div className="space-y-2">
                <Label>Bank Name</Label>
                <Input
                  placeholder="e.g. Dutch Bangla Bank"
                  value={method.bankName}
                  onChange={(e) => setMethod({ ...method, bankName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Branch Name</Label>
                <Input
                  placeholder="e.g. Motijheel"
                  value={method.branchName}
                  onChange={(e) => setMethod({ ...method, branchName: e.target.value })}
                />
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
          <Button type="submit" size="sm">Add Method</Button>
        </div>
      </form>
    </Card>
  );
}
