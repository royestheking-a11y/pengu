import React, { useState } from 'react';
import {
    FileText,
    MapPin,
    Clock,
    Lock,
    Download,
    Upload,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { DashboardLayout } from '../components/Layout';
import { toast } from 'sonner';
import { useStore } from '../store';

export default function ExpertScholarships() {
    const { scholarshipApplications, uploadScholarshipReceipts, isInitialized } = useStore();
    const [isUploading, setIsUploading] = useState<string | null>(null); // app id

    const handleReceiptUpload = async (applicationId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(applicationId);

        // Simulating file upload to cloud storage
        setTimeout(async () => {
            try {
                const receiptData = [{
                    name: file.name,
                    url: `https://fake-storage.pengu.cloud/${file.name}`,
                    type: 'Submission Receipt'
                }];

                await uploadScholarshipReceipts(applicationId, receiptData);
            } finally {
                setIsUploading(null);
            }
        }, 2000);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="bg-indigo-900 text-white p-8 rounded-2xl relative overflow-hidden shadow-lg border border-indigo-800">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <div className="relative z-10 max-w-2xl">
                        <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-4 py-1">Fulfillment Workspace</Badge>
                        <h1 className="text-3xl font-bold mb-2">Assigned Scholarships</h1>
                        <p className="text-indigo-200">
                            Access student documents securely, draft SOPs, submit to university portals, and upload final confirmation receipts here.
                        </p>
                    </div>
                </div>

                {!isInitialized ? (
                    <div className="text-center py-20 text-stone-500">Loading assignments...</div>
                ) : scholarshipApplications.length === 0 ? (
                    <Card className="text-center py-20 border-dashed">
                        <CheckCircle2 className="size-16 text-stone-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-stone-900 mb-2">Inbox Zero</h3>
                        <p className="text-stone-500 max-w-sm mx-auto">
                            You currently have no active scholarship assignments. Admins will assign tasks based on your expertise.
                        </p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {scholarshipApplications.map((app) => {
                            const scholarship = typeof app.scholarshipId === 'object' ? app.scholarshipId : null;
                            const student = typeof app.studentId === 'object' ? app.studentId : null;

                            if (!scholarship || !student) return null;

                            return (
                                <Card key={app.id} className="overflow-hidden border border-stone-200 shadow-sm flex flex-col">
                                    {/* Header */}
                                    <div className="p-6 border-b border-stone-100 bg-stone-50">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-bold text-stone-900">{(scholarship as any).title}</h3>
                                            <Badge className={
                                                app.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                                                    app.status === 'FINAL_REVIEW' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-indigo-100 text-indigo-700'
                                            }>
                                                {app.status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-stone-500">
                                            <span className="flex items-center gap-1"><MapPin className="size-3" /> {(scholarship as any).country}</span>
                                            <span className="flex items-center gap-1 font-medium text-red-500"><Clock className="size-3" /> Due: {new Date((scholarship as any).deadline).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col">
                                        {/* Student Profile Snapshot */}
                                        <div className="mb-6 bg-white border border-stone-100 rounded-xl p-4 shadow-sm">
                                            <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Applicant Profile</div>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <div className="text-[10px] text-stone-500">Name</div>
                                                    <div className="font-bold text-sm text-stone-900 truncate">{(student as any).name || (student as any).username}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] text-stone-500">CGPA / IELTS</div>
                                                    <div className="font-bold text-sm text-stone-900">{app.cgpa} / {app.ielts || 'N/A'}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] text-stone-500">Major</div>
                                                    <div className="font-bold text-sm text-stone-900 truncate" title={app.major}>{app.major}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Secure Document Access */}
                                        <div className="mb-6">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Lock className="size-4 text-emerald-600" />
                                                <h4 className="font-bold text-sm text-stone-900">Student Document Vault</h4>
                                            </div>
                                            <div className="space-y-2">
                                                {app.documentVault.length === 0 ? (
                                                    <div className="text-xs text-stone-400 italic">No documents uploaded yet.</div>
                                                ) : (
                                                    app.documentVault.map((doc, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="size-4 text-stone-400" />
                                                                <span className="text-sm font-medium text-stone-700">{doc.name}</span>
                                                            </div>
                                                            <Button variant="ghost" size="sm" className="h-8 text-indigo-600 hover:bg-indigo-50">
                                                                <Download className="size-3.5 mr-1" /> Download
                                                            </Button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-6 border-t border-stone-100">
                                            {app.status === 'EXPERT_ASSIGNED' ? (
                                                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                                                    <div className="flex items-start gap-3">
                                                        <AlertCircle className="size-5 text-indigo-600 shrink-0 mt-0.5" />
                                                        <div>
                                                            <h4 className="text-sm font-bold text-indigo-900 mb-1">Submit Application</h4>
                                                            <p className="text-xs text-indigo-700 mb-3 leading-relaxed">
                                                                After submitting the application on the official university portal, please upload the final submission receipt PDF here. This moves the order to Final Review.
                                                            </p>
                                                            <div className="relative inline-block">
                                                                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" disabled={isUploading === app.id}>
                                                                    <Upload className="size-3.5 mr-2" /> {isUploading === app.id ? 'Uploading...' : 'Upload Receipt'}
                                                                </Button>
                                                                <input
                                                                    type="file"
                                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                                    disabled={isUploading === app.id}
                                                                    onChange={(e) => handleReceiptUpload(app.id, e)}
                                                                    accept=".pdf,.png,.jpg"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center p-4 bg-stone-50 rounded-xl border border-stone-200 border-dashed">
                                                    <CheckCircle2 className="size-6 text-emerald-500 mx-auto mb-2" />
                                                    <div className="text-sm font-bold text-stone-900">Receipts Uploaded</div>
                                                    <div className="text-xs text-stone-500">This application is under review or completed.</div>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
