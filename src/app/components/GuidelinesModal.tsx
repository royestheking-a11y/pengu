import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from './ui/dialog';
import {
    BookOpen,
    CheckCircle,
    FileText,
    AlertCircle
} from 'lucide-react';

interface GuidelinesModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function GuidelinesModal({ isOpen, onOpenChange }: GuidelinesModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-[#3E2723]">
                        <BookOpen className="size-6 text-[#5D4037]" />
                        Expert Quality Guidelines
                    </DialogTitle>
                    <DialogDescription>
                        Ensuring the highest standards for every submission.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    <section className="space-y-3">
                        <h3 className="font-bold text-stone-900 flex items-center gap-2">
                            <FileText className="size-4 text-blue-600" />
                            APA 7th Edition Standards
                        </h3>
                        <ul className="text-sm text-stone-600 space-y-2 list-disc pl-5">
                            <li><strong>In-text Citations:</strong> Must include author and year (e.g., Smith, 2023). For direct quotes, include page number (p. 25).</li>
                            <li><strong>Reference List:</strong> Alphabetical order by author's last name. Use hanging indents.</li>
                            <li><strong>Formatting:</strong> 1-inch margins, double-spaced, and a professional font (e.g., Times New Roman 12pt).</li>
                            <li><strong>Header:</strong> Running head is no longer required for student papers unless specified.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h3 className="font-bold text-stone-900 flex items-center gap-2">
                            <CheckCircle className="size-4 text-green-600" />
                            Quality Checklist
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="p-3 bg-stone-50 rounded-lg border border-stone-100 text-sm">
                                <p className="font-semibold text-stone-800 mb-1">Originality</p>
                                <p className="text-stone-500">0% AI usage and thorough plagiarism checks are mandatory.</p>
                            </div>
                            <div className="p-3 bg-stone-50 rounded-lg border border-stone-100 text-sm">
                                <p className="font-semibold text-stone-800 mb-1">Clarity</p>
                                <p className="text-stone-500">Strong logical flow, clear thesis, and evidence-based arguments.</p>
                            </div>
                            <div className="p-3 bg-stone-50 rounded-lg border border-stone-100 text-sm">
                                <p className="font-semibold text-stone-800 mb-1">Instructions</p>
                                <p className="text-stone-500">Must address 100% of the student's requirements and prompt.</p>
                            </div>
                            <div className="p-3 bg-stone-50 rounded-lg border border-stone-100 text-sm">
                                <p className="font-semibold text-stone-800 mb-1">Grammar</p>
                                <p className="text-stone-500">Zero tolerance for significant spelling or syntax errors.</p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-3 bg-amber-50 p-4 rounded-xl border border-amber-100">
                        <h3 className="font-bold text-amber-900 flex items-center gap-2">
                            <AlertCircle className="size-4" />
                            Academic Integrity
                        </h3>
                        <p className="text-sm text-amber-800 leading-relaxed">
                            We uphold the strictest standards of academic honesty. Providing pre-written solutions or enabling academic dishonesty is strictly prohibited. Your role is to provide auxiliary educational support and guidance.
                        </p>
                    </section>
                </div>
            </DialogContent>
        </Dialog>
    );
}
