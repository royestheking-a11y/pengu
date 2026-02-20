import React, { useEffect, useState } from 'react';
import { DashboardLayout } from './components/Layout';
import { Card } from './components/ui/card';
import { Mail, Calendar, Trash2, AlertTriangle } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';
import { EmptyState } from './components/ui/EmptyState';
import { Loader2 } from 'lucide-react';

export default function AdminContacts() {
    const [contacts, setContacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const { data } = await api.get('/contact');
            setContacts(data);
        } catch (error) {
            console.error("Failed to fetch contacts", error);
            toast.error("Failed to load messages");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        setDeleting(id);
        try {
            await api.delete(`/contact/${id}`);
            setContacts(prev => prev.filter(c => c._id !== id));
            toast.success("Message deleted");
        } catch (error) {
            console.error("Failed to delete contact", error);
            toast.error("Failed to delete message");
        } finally {
            setDeleting(null);
            setConfirmDeleteId(null);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-[#3E2723]">Contact Inquiries</h1>
                    <p className="text-stone-500">Messages from the Contact Us form.</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-stone-400">
                        <Loader2 className="size-8 animate-spin mb-4" />
                        <p className="text-sm font-medium">Loading inbox...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {contacts.length === 0 ? (
                            <EmptyState
                                icon={Mail}
                                title="Inbox is empty"
                                subtitle="You're all caught up! New messages from the Contact Us form will appear here as they arrive."
                                className="my-12 border-none shadow-none bg-transparent"
                            />
                        ) : (
                            contacts.map((contact) => (
                                <Card key={contact._id} className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-stone-100 p-2 rounded-full">
                                                <Mail className="size-5 text-[#5D4037]" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-stone-900">{contact.subject}</h3>
                                                <p className="text-sm text-stone-500">{contact.firstName} {contact.lastName} ({contact.email})</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-stone-400 flex items-center gap-1">
                                                <Calendar className="size-3" />
                                                {new Date(contact.createdAt).toLocaleDateString()}
                                            </span>
                                            {confirmDeleteId === contact._id ? (
                                                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                                                    <AlertTriangle className="size-4 text-red-500 shrink-0" />
                                                    <span className="text-xs text-red-700 font-medium">Delete?</span>
                                                    <button
                                                        onClick={() => handleDelete(contact._id)}
                                                        disabled={deleting === contact._id}
                                                        className="text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-2 py-0.5 rounded-md transition-colors disabled:opacity-50"
                                                    >
                                                        {deleting === contact._id ? 'Deleting...' : 'Yes'}
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmDeleteId(null)}
                                                        className="text-xs font-bold text-stone-500 hover:text-stone-700 px-2 py-0.5 rounded-md transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setConfirmDeleteId(contact._id)}
                                                    className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete message"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-stone-50 p-4 rounded-lg text-sm text-stone-700">
                                        {contact.message}
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
