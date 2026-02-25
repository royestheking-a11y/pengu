import React, { useState } from 'react';
import { DashboardLayout } from './components/Layout';
import { Card } from './components/ui/card';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import {
    Brain, BookOpen, FileQuestion, Sparkles, ChevronRight,
    CheckCircle, XCircle, RotateCcw, Lightbulb, AlertTriangle,
    Loader2, ChevronDown, ChevronUp, Target, ArrowRight,
    User, GraduationCap, FileText, PenLine, ClipboardList, ScanSearch
} from 'lucide-react';
import api from '../lib/api';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'Economics', 'History', 'English Literature', 'Psychology', 'Law',
    'Business Studies', 'Statistics', 'Sociology', 'Geography', 'Philosophy'];

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

// ─── Quiz Component ───────────────────────────────────────────────────────────
function QuizGenerator() {
    const [topic, setTopic] = useState('');
    const [subject, setSubject] = useState('Computer Science');
    const [difficulty, setDifficulty] = useState('intermediate');
    const [count, setCount] = useState(5);
    const [loading, setLoading] = useState(false);
    const [quiz, setQuiz] = useState<any>(null);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [submitted, setSubmitted] = useState(false);

    const score = submitted
        ? quiz?.questions?.filter((q: any, i: number) => answers[i] === q.correctAnswer).length
        : 0;

    const generate = async () => {
        if (!topic.trim()) return toast.error('Please enter a topic');
        setLoading(true);
        setQuiz(null);
        setAnswers({});
        setSubmitted(false);
        try {
            const res = await api.post('/study-tools/quiz', { topic, subject, difficulty, count });
            const data = res.data;
            setQuiz(data);
            toast.success(`${data.questions?.length} questions generated!`);
        } catch (e: any) {
            toast.error(e.message || 'Failed to generate quiz');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Input Panel */}
            <Card className="p-6 border-stone-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 block">Topic</label>
                        <input
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && generate()}
                            placeholder="e.g. Binary Search Trees, World War II, Photosynthesis..."
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5D4037]/20 focus:border-[#5D4037] bg-stone-50"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 block">Subject</label>
                        <select value={subject} onChange={e => setSubject(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5D4037]/20 bg-stone-50">
                            {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 block">Difficulty</label>
                        <div className="flex gap-2">
                            {DIFFICULTIES.map(d => (
                                <button key={d} onClick={() => setDifficulty(d)}
                                    className={`flex-1 py-3 rounded-xl text-xs font-bold capitalize transition-all border
                                        ${difficulty === d ? 'bg-[#5D4037] text-white border-[#5D4037]' : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-300'}`}>
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 block">Questions: {count}</label>
                        <input type="range" min={3} max={10} value={count} onChange={e => setCount(Number(e.target.value))}
                            className="w-full accent-[#5D4037]" />
                    </div>
                    <div className="flex items-end">
                        <button onClick={generate} disabled={loading}
                            className="w-full py-3 bg-[#5D4037] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#4E342E] transition-all disabled:opacity-50">
                            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                            {loading ? 'Generating...' : 'Generate Quiz'}
                        </button>
                    </div>
                </div>
            </Card>

            {/* Quiz Questions */}
            <AnimatePresence>
                {quiz && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-stone-900">{quiz.topic}</h3>
                                <p className="text-xs text-stone-400">{quiz.subject} • {quiz.difficulty}</p>
                            </div>
                            {submitted && (
                                <div className={`px-4 py-2 rounded-xl font-black text-sm ${score / quiz.questions.length >= 0.7 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                    {score}/{quiz.questions.length} Correct
                                </div>
                            )}
                        </div>

                        {quiz.questions?.map((q: any, i: number) => (
                            <Card key={i} className={`p-5 border transition-all ${submitted
                                ? answers[i] === q.correctAnswer ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'
                                : 'border-stone-200'}`}>
                                <p className="font-bold text-stone-900 mb-3 text-sm">
                                    <span className="text-[#5D4037] mr-2">Q{i + 1}.</span>{q.question}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                                    {q.options?.map((opt: string, j: number) => {
                                        const letter = opt.charAt(0);
                                        const isSelected = answers[i] === letter;
                                        const isCorrect = q.correctAnswer === letter;
                                        return (
                                            <button key={j}
                                                onClick={() => !submitted && setAnswers(prev => ({ ...prev, [i]: letter }))}
                                                disabled={submitted}
                                                className={`text-left px-4 py-2.5 rounded-lg text-xs font-medium border transition-all
                                                    ${submitted
                                                        ? isCorrect ? 'bg-green-100 border-green-300 text-green-800'
                                                            : isSelected ? 'bg-red-100 border-red-300 text-red-700'
                                                                : 'bg-stone-50 border-stone-100 text-stone-400'
                                                        : isSelected ? 'bg-[#5D4037]/10 border-[#5D4037]/40 text-[#5D4037] font-bold'
                                                            : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-300'}`}>
                                                {opt}
                                            </button>
                                        );
                                    })}
                                </div>
                                {submitted && (
                                    <div className="mt-2 p-3 bg-white rounded-lg border border-stone-100 flex gap-2">
                                        {answers[i] === q.correctAnswer
                                            ? <CheckCircle className="size-4 text-green-500 shrink-0 mt-0.5" />
                                            : <XCircle className="size-4 text-red-500 shrink-0 mt-0.5" />}
                                        <p className="text-xs text-stone-600">{q.explanation}</p>
                                    </div>
                                )}
                            </Card>
                        ))}

                        <div className="flex gap-3">
                            {!submitted ? (
                                <button onClick={() => setSubmitted(true)}
                                    disabled={Object.keys(answers).length < quiz.questions?.length}
                                    className="flex-1 py-3 bg-[#5D4037] text-white rounded-xl font-bold text-sm disabled:opacity-40 hover:bg-[#4E342E] transition-all flex items-center justify-center gap-2">
                                    <Target className="size-4" /> Submit Answers
                                </button>
                            ) : (
                                <button onClick={() => { setAnswers({}); setSubmitted(false); setQuiz(null); }}
                                    className="flex-1 py-3 bg-stone-100 text-stone-700 rounded-xl font-bold text-sm hover:bg-stone-200 transition-all flex items-center justify-center gap-2">
                                    <RotateCcw className="size-4" /> New Quiz
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Concept Explainer Component ──────────────────────────────────────────────
function ConceptExplainer() {
    const [topic, setTopic] = useState('');
    const [subject, setSubject] = useState('Computer Science');
    const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [expandedSection, setExpandedSection] = useState<string | null>('explanation');

    const explain = async () => {
        if (!topic.trim()) return toast.error('Please enter a concept to explain');
        setLoading(true);
        setResult(null);
        try {
            const res = await api.post('/study-tools/explain', { topic, subject, level });
            const data = res.data;
            setResult(data);
            toast.success('Concept explained!');
        } catch (e: any) {
            toast.error(e.message || 'Failed to explain concept');
        } finally {
            setLoading(false);
        }
    };

    const Section = ({ id, icon, title, children }: { id: string; icon: React.ReactNode; title: string; children: React.ReactNode }) => (
        <div className="border border-stone-200 rounded-xl overflow-hidden">
            <button onClick={() => setExpandedSection(expandedSection === id ? null : id)}
                className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100 transition-colors">
                <div className="flex items-center gap-2 font-bold text-sm text-stone-700">{icon}{title}</div>
                {expandedSection === id ? <ChevronUp className="size-4 text-stone-400" /> : <ChevronDown className="size-4 text-stone-400" />}
            </button>
            <AnimatePresence>
                {expandedSection === id && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="p-4">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    return (
        <div className="space-y-6">
            <Card className="p-6 border-stone-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 block">Concept or Topic</label>
                        <input value={topic} onChange={e => setTopic(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && explain()}
                            placeholder="e.g. Recursion, Keynesian Economics, Mitosis, Quantum Entanglement..."
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5D4037]/20 focus:border-[#5D4037] bg-stone-50" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 block">Subject</label>
                        <select value={subject} onChange={e => setSubject(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5D4037]/20 bg-stone-50">
                            {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 block">Explain it to me as a...</label>
                        <div className="flex gap-2">
                            {(['beginner', 'intermediate', 'advanced'] as const).map(l => {
                                const meta = {
                                    beginner: { icon: <User className="size-3" />, label: 'Beginner' },
                                    intermediate: { icon: <BookOpen className="size-3" />, label: 'Student' },
                                    advanced: { icon: <GraduationCap className="size-3" />, label: 'Expert' }
                                }[l];
                                return (
                                    <button key={l} onClick={() => setLevel(l)}
                                        className={`flex-1 py-3 rounded-xl text-xs font-bold capitalize transition-all border flex items-center justify-center gap-1.5
                                            ${level === l ? 'bg-[#5D4037] text-white border-[#5D4037]' : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-300'}`}>
                                        {meta.icon}{meta.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <button onClick={explain} disabled={loading}
                    className="w-full py-3 bg-[#5D4037] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#4E342E] transition-all disabled:opacity-50">
                    {loading ? <Loader2 className="size-4 animate-spin" /> : <Lightbulb className="size-4" />}
                    {loading ? 'Explaining...' : 'Explain This Concept'}
                </button>
            </Card>

            <AnimatePresence>
                {result && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                        {/* Summary banner */}
                        <div className="p-5 bg-[#5D4037] text-white rounded-2xl">
                            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">{result.subject} • {result.level}</p>
                            <h3 className="text-lg font-black mb-2">{result.topic}</h3>
                            <p className="text-sm text-white/80 leading-relaxed">{result.summary}</p>
                        </div>

                        <Section id="explanation" icon={<BookOpen className="size-4" />} title="Full Explanation">
                            <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">{result.explanation}</p>
                        </Section>

                        <Section id="keypoints" icon={<CheckCircle className="size-4 text-green-500" />} title="Key Points">
                            <div className="space-y-2">
                                {result.keyPoints?.map((pt: string, i: number) => (
                                    <div key={i} className="flex gap-2 items-start">
                                        <span className="size-5 shrink-0 bg-[#5D4037]/10 text-[#5D4037] rounded-full flex items-center justify-center text-[10px] font-black mt-0.5">{i + 1}</span>
                                        <p className="text-sm text-stone-600">{pt}</p>
                                    </div>
                                ))}
                            </div>
                        </Section>

                        <Section id="example" icon={<Sparkles className="size-4 text-amber-500" />} title="Real-World Example">
                            <p className="text-sm text-stone-600 leading-relaxed bg-amber-50 p-4 rounded-xl border border-amber-100">{result.realWorldExample}</p>
                        </Section>

                        <Section id="mistakes" icon={<AlertTriangle className="size-4 text-red-400" />} title="Common Mistakes to Avoid">
                            <div className="space-y-2">
                                {result.commonMistakes?.map((m: string, i: number) => (
                                    <div key={i} className="flex gap-2 items-start p-2.5 bg-red-50 rounded-lg border border-red-100">
                                        <XCircle className="size-4 text-red-400 shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-700">{m}</p>
                                    </div>
                                ))}
                            </div>
                        </Section>

                        <Section id="further" icon={<ArrowRight className="size-4 text-[#5D4037]" />} title="Explore Further">
                            <div className="flex flex-wrap gap-2">
                                {result.furtherReading?.map((t: string, i: number) => (
                                    <span key={i} className="px-3 py-1.5 bg-[#5D4037]/5 text-[#5D4037] rounded-full text-xs font-bold border border-[#5D4037]/20">{t}</span>
                                ))}
                            </div>
                        </Section>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Exam Prep Component ──────────────────────────────────────────────────────
function ExamPrep() {
    const [topic, setTopic] = useState('');
    const [subject, setSubject] = useState('Computer Science');
    const [examType, setExamType] = useState('past-paper');
    const [count, setCount] = useState(4);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [expandedQ, setExpandedQ] = useState<number | null>(null);

    const EXAM_TYPES = [
        { id: 'past-paper', label: 'Past Paper', icon: <FileText className="size-3" /> },
        { id: 'short-answer', label: 'Short Answer', icon: <PenLine className="size-3" /> },
        { id: 'essay', label: 'Essay', icon: <ClipboardList className="size-3" /> },
        { id: 'case-study', label: 'Case Study', icon: <ScanSearch className="size-3" /> },
    ];

    const generate = async () => {
        if (!topic.trim()) return toast.error('Please enter a topic');
        setLoading(true);
        setResult(null);
        setExpandedQ(null);
        try {
            const res = await api.post('/study-tools/exam-prep', { topic, subject, examType, count });
            const data = res.data;
            setResult(data);
            toast.success(`${data.questions?.length} exam questions ready!`);
        } catch (e: any) {
            toast.error(e.message || 'Failed to generate questions');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="p-6 border-stone-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 block">Topic / Syllabus Area</label>
                        <input value={topic} onChange={e => setTopic(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && generate()}
                            placeholder="e.g. Supply and Demand, The French Revolution, Object-Oriented Programming..."
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5D4037]/20 focus:border-[#5D4037] bg-stone-50" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 block">Subject</label>
                        <select value={subject} onChange={e => setSubject(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5D4037]/20 bg-stone-50">
                            {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 block">Question Style</label>
                        <div className="grid grid-cols-2 gap-2">
                            {EXAM_TYPES.map(t => (
                                <button key={t.id} onClick={() => setExamType(t.id)}
                                    className={`py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5
                                        ${examType === t.id ? 'bg-[#5D4037] text-white border-[#5D4037]' : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-300'}`}>
                                    {t.icon}{t.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 block">Questions: {count}</label>
                        <input type="range" min={2} max={8} value={count} onChange={e => setCount(Number(e.target.value))}
                            className="w-full accent-[#5D4037] mt-3" />
                    </div>
                    <div className="flex items-end">
                        <button onClick={generate} disabled={loading}
                            className="w-full py-3 bg-[#5D4037] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#4E342E] transition-all disabled:opacity-50">
                            {loading ? <Loader2 className="size-4 animate-spin" /> : <FileQuestion className="size-4" />}
                            {loading ? 'Generating...' : 'Generate Exam Questions'}
                        </button>
                    </div>
                </div>
            </Card>

            <AnimatePresence>
                {result && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div>
                            <h3 className="font-bold text-stone-900">{result.topic}</h3>
                            <p className="text-xs text-stone-400">{result.subject} • {result.examType?.replace('-', ' ')}</p>
                        </div>
                        {result.questions?.map((q: any, i: number) => (
                            <Card key={i} className="border-stone-200 overflow-hidden">
                                <button onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                                    className="w-full p-5 text-left flex items-start justify-between gap-3 hover:bg-stone-50 transition-colors">
                                    <div className="flex gap-3 items-start">
                                        <span className="size-7 shrink-0 bg-[#5D4037] text-white rounded-full flex items-center justify-center text-xs font-black mt-0.5">{i + 1}</span>
                                        <div>
                                            <p className="text-sm font-medium text-stone-800 leading-relaxed">{q.question}</p>
                                            {q.marks && <span className="text-[10px] font-bold text-[#5D4037] mt-1 inline-block">[{q.marks} marks]</span>}
                                        </div>
                                    </div>
                                    {expandedQ === i ? <ChevronUp className="size-4 text-stone-400 shrink-0 mt-1" /> : <ChevronDown className="size-4 text-stone-400 shrink-0 mt-1" />}
                                </button>
                                <AnimatePresence>
                                    {expandedQ === i && (
                                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                            <div className="px-5 pb-5 space-y-3 border-t border-stone-100 pt-4">
                                                {q.guidance && (
                                                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                                                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Examiner Guidance</p>
                                                        <p className="text-xs text-amber-800">{q.guidance}</p>
                                                    </div>
                                                )}
                                                {q.sampleAnswer && (
                                                    <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                                                        <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">Model Answer</p>
                                                        <p className="text-xs text-green-800 leading-relaxed whitespace-pre-line">{q.sampleAnswer}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        ))}
                        <button onClick={() => { setResult(null); setTopic(''); }}
                            className="w-full py-3 bg-stone-100 text-stone-700 rounded-xl font-bold text-sm hover:bg-stone-200 transition-all flex items-center justify-center gap-2">
                            <RotateCcw className="size-4" /> New Session
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type Tab = 'quiz' | 'explain' | 'exam';

export default function StudyTools() {
    const [activeTab, setActiveTab] = useState<Tab>('quiz');

    const tabs: { id: Tab; label: string; icon: React.ReactNode; desc: string }[] = [
        { id: 'quiz', label: 'Quiz Generator', icon: <Brain className="size-4" />, desc: 'MCQ practice with instant feedback' },
        { id: 'explain', label: 'Concept Explainer', icon: <Lightbulb className="size-4" />, desc: 'Any topic, any level, clearly explained' },
        { id: 'exam', label: 'Exam Prep', icon: <FileQuestion className="size-4" />, desc: 'Past-paper style questions with model answers' },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="size-8 bg-[#5D4037] rounded-xl flex items-center justify-center">
                                <Brain className="size-4 text-white" />
                            </div>
                            <span className="text-[10px] font-bold text-[#5D4037] uppercase tracking-widest">Powered by Pengu AI</span>
                        </div>
                        <h1 className="text-2xl font-black text-[#3E2723]">AI Study Tools</h1>
                        <p className="text-stone-500 text-sm mt-1">Your personal AI tutor — quizzes, explanations, and exam prep on demand.</p>
                    </div>
                </div>

                {/* Tool Tabs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`p-4 rounded-2xl border-2 text-left transition-all ${activeTab === tab.id
                                ? 'border-[#5D4037] bg-[#5D4037]/5'
                                : 'border-stone-200 bg-white hover:border-stone-300'}`}>
                            <div className={`flex items-center gap-2 mb-1 font-bold text-sm ${activeTab === tab.id ? 'text-[#5D4037]' : 'text-stone-700'}`}>
                                {tab.icon} {tab.label}
                                {activeTab === tab.id && <ChevronRight className="size-3 ml-auto" />}
                            </div>
                            <p className="text-[11px] text-stone-400">{tab.desc}</p>
                        </button>
                    ))}
                </div>

                {/* Active Tool */}
                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        {activeTab === 'quiz' && <QuizGenerator />}
                        {activeTab === 'explain' && <ConceptExplainer />}
                        {activeTab === 'exam' && <ExamPrep />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
}
