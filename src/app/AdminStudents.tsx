import React, { useState } from 'react';
import { DashboardLayout } from './components/Layout';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import {
  Users,
  Search,
  Trash2,
  Ban,
  CheckCircle,
  Eye,
  Mail,
  X,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { EmptyState } from './components/ui/EmptyState';
import { toast } from 'sonner';
import { useStore, User } from './store';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function AdminStudents() {
  const { users, orders, addUser, updateUserStatus, deleteUser } = useStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [newStudent, setNewStudent] = useState({ name: '', email: '' });

  const students = users.filter(u => u.role === 'student');

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      deleteUser(id);
      toast.success('Student deleted successfully');
    }
  };

  const handleToggleStatus = (student: User) => {
    const newStatus = student.status === 'active' ? 'banned' : 'active';
    updateUserStatus(student.id, newStatus);
    toast.success(`Student ${newStatus === 'banned' ? 'banned' : 'activated'} successfully`);
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.email) {
      toast.error('Please fill in all fields');
      return;
    }

    addUser({
      name: newStudent.name,
      email: newStudent.email,
      role: 'student',
      password: 'password123'
    });

    toast.success('Student added successfully');
    setIsAddModalOpen(false);
    setNewStudent({ name: '', email: '' });
  };

  const handleView = (student: User) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const handleMail = (student: User) => {
    // Navigate to messages or show toast
    navigate('/admin/messages');
    toast.info(`Opening communication with ${student.name}`);
  };

  const getStudentOrdersCount = (studentId: string) => {
    return orders.filter(o => {
      const sId = typeof o.studentId === 'string' ? o.studentId : o.studentId?._id || o.studentId?.id;
      return sId === studentId;
    }).length;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#3E2723]">Student Management</h1>
            <p className="text-stone-500">Manage student accounts, view activity, and enforce policies.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsAddModalOpen(true)} variant="outline">
              <Plus className="mr-2 size-4" /> Add Directly
            </Button>
            <Button onClick={() => {
              const link = `${window.location.origin}/join/student`;
              navigator.clipboard.writeText(link);
              toast.success('Invitation link copied!', {
                description: 'Share this link to invite new students.'
              });
            }}>
              <Users className="mr-2 size-4" /> Invite Student
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#5D4037]/20 focus:border-[#5D4037]"
              />
            </div>
          </div>

          {filteredStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-stone-50 text-stone-500 font-medium border-b border-stone-100">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-xl text-[#3E2723]">Student</th>
                    <th className="px-4 py-3 text-[#3E2723]">Status</th>
                    <th className="px-4 py-3 text-[#3E2723]">Joined</th>
                    <th className="px-4 py-3 text-[#3E2723]">Balance</th>
                    <th className="px-4 py-3 text-[#3E2723]">Orders</th>
                    <th className="px-4 py-3 rounded-tr-xl text-right text-[#3E2723]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full overflow-hidden bg-stone-100 flex items-center justify-center text-[#5D4037] font-bold border border-stone-200">
                            {student.avatar ? (
                              <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                            ) : (
                              student.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-stone-900">{student.name}</p>
                            <p className="text-xs text-stone-500">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${student.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}>
                          {student.status === 'active' ? <CheckCircle className="size-3 mr-1" /> : <Ban className="size-3 mr-1" />}
                          {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-stone-600">
                        {format(new Date(student.joinedAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-4 text-stone-600 font-bold">
                        ৳{(student.balance || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-stone-600 font-medium">
                        {getStudentOrdersCount(student.id)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            title="View Details"
                            onClick={() => handleView(student)}
                          >
                            <Eye className="size-4 text-stone-500" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            title="Send Message"
                            onClick={() => handleMail(student)}
                          >
                            <Mail className="size-4 text-stone-500" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className={`h-8 w-8 p-0 ${student.status === 'active' ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}`}
                            onClick={() => handleToggleStatus(student)}
                            title={student.status === 'active' ? 'Ban Student' : 'Activate Student'}
                          >
                            {student.status === 'active' ? <Ban className="size-4" /> : <CheckCircle className="size-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(student.id)}
                            title="Delete Student"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No students found"
              subtitle="We couldn't find any student accounts matching your search or filters. New registrations will appear here when they join."
              className="my-12 border-none shadow-none bg-transparent"
            />
          )}
        </Card>
      </div>

      {/* Add Student Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#3E2723]">Add New Student</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                  <X className="size-6" />
                </button>
              </div>

              <form onSubmit={handleAddStudent} className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    placeholder="Enter student name"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    placeholder="student@example.com"
                  />
                  <p className="text-xs text-stone-500">Password will be sent to this email.</p>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Add Student
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Details Modal */}
      <AnimatePresence>
        {isViewModalOpen && selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row h-[600px]"
            >
              {/* Left Sidebar: Profile Info */}
              <div className="md:w-1/3 bg-[#3E2723] text-white p-8 flex flex-col">
                <div className="flex justify-between items-start mb-8">
                  <div className="size-20 rounded-2xl overflow-hidden bg-white/10 flex items-center justify-center text-4xl font-bold border border-white/20">
                    {selectedStudent.avatar ? (
                      <img src={selectedStudent.avatar} alt={selectedStudent.name} className="w-full h-full object-cover" />
                    ) : (
                      selectedStudent.name.charAt(0)
                    )}
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-1">{selectedStudent.name}</h3>
                <p className="text-white/60 text-sm mb-8">{selectedStudent.email}</p>

                <div className="space-y-6 flex-1">
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider font-bold mb-1">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedStudent.status === 'active' ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>
                      {selectedStudent.status.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider font-bold mb-1">Member Since</p>
                    <p className="font-medium">{format(new Date(selectedStudent.joinedAt), 'MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider font-bold mb-1">Total Orders</p>
                    <p className="font-medium text-2xl">{getStudentOrdersCount(selectedStudent.id)}</p>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-white/40 text-xs uppercase tracking-wider font-bold mb-1">Balance</p>
                      <p className="font-bold text-amber-300">৳{(selectedStudent.balance || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs uppercase tracking-wider font-bold mb-1">Lifetime Earned</p>
                      <p className="font-bold text-green-400">৳{((selectedStudent.total_earned || 0) * 1.2).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-white/10 space-y-3">
                  <Button className="w-full bg-white text-[#3E2723] hover:bg-stone-100" onClick={() => handleMail(selectedStudent)}>
                    <Mail className="mr-2 size-4" /> Send Message
                  </Button>
                </div>
              </div>

              {/* Right Content: Stats & Orders */}
              <div className="md:w-2/3 p-8 bg-stone-50 overflow-y-auto relative">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="absolute top-6 right-6 p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-200 rounded-full transition-all z-10"
                >
                  <X className="size-6" />
                </button>

                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-bold text-[#3E2723] text-lg flex items-center gap-2">
                    <Users className="size-5" /> Order History
                  </h4>
                  <button onClick={() => setIsViewModalOpen(false)} className="md:hidden text-stone-400 hover:text-stone-600">
                    <X className="size-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {orders.filter(o => {
                    const sId = typeof o.studentId === 'string' ? o.studentId : o.studentId?._id || o.studentId?.id;
                    return sId === selectedStudent.id;
                  }).length > 0 ? orders.filter(o => {
                    const sId = typeof o.studentId === 'string' ? o.studentId : o.studentId?._id || o.studentId?.id;
                    return sId === selectedStudent.id;
                  }).map(order => (
                    <div key={order.id} className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-stone-900">{order.topic}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide ${order.status === 'COMPLETED' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500">{order.serviceType} • {format(new Date(order.createdAt), 'MMM d, yyyy')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#3E2723]">TK {order.amount?.toLocaleString()}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-stone-200">
                      <p className="text-stone-400 font-medium">No orders found for this student.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
