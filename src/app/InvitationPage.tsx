import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Target,
    Zap,
    ShieldCheck,
    ArrowRight,
    Sparkles,
    GraduationCap,
    Briefcase,
    Clock,
    DollarSign,
    Check,
    Globe,
    Gamepad2,
    Brain,
    HeartPulse,
    Rocket,
    Trophy,
    Star
} from 'lucide-react';
import { Button } from './components/ui/button';
import { PenguLogoDark } from './components/PenguLogoDark';
import SEO from './components/SEO';

export default function InvitationPage() {
    const { type } = useParams<{ type: string }>();
    const isExpert = type === 'expert';

    const expertContent = {
        title: "Shape the Future of Learning",
        subtitle: "Why waste your expertise when you can empower thousands? Join Pengu as an elite expert.",
        motivation: "Turn your academic mastery into a rewarding career. Flexible hours, global impact, and premium payouts.",
        cta: "Join as Expert",
        features: [
            { icon: DollarSign, title: "Premium Payouts", desc: "Get paid what you're worth with our transparent, high-yield commission system." },
            { icon: Globe, title: "Global Impact", desc: "Guide ambitious students worldwide through scholarships, academics, and careers." },
            { icon: Briefcase, title: "Flexible Autonomy", desc: "Work from anywhere, anytime. You control your schedule and task load." },
            { icon: Rocket, title: "Career Mentorship", desc: "Shape the future workforce by providing specialized resume reviews and interview prep." },
            { icon: Brain, title: "AI-Assisted Workflow", desc: "Leverage our intelligent platform tools to streamline your research and grading." },
            { icon: Trophy, title: "Exclusive Community", desc: "Build your reputation and network within an elite, gamified expert ecosystem." }
        ],
        benefits: [
            "Weekly verified payouts",
            "Direct expert-student chat",
            "AI-assisted research tools",
            "Global professional network",
            "Career acceleration mentoring",
            "Gamified expert rewards"
        ]
    };

    const studentContent = {
        title: "Master Your Academic Journey",
        subtitle: "Stop struggling alone. Join a premium ecosystem where AI and top experts pave your way to success.",
        motivation: "Customized support, real-time guidance, and tools designed for the modern student.",
        cta: "Start Your Journey",
        features: [
            { icon: Globe, title: "Global Scholarships", desc: "AI-powered Discovery Board to find and apply for high-probability global scholarships." },
            { icon: Brain, title: "Universal Problem Solver", desc: "Instant, intelligent study tools and automated flashcards to conquer any subject." },
            { icon: Rocket, title: "Career Acceleration", desc: "Access the Career Vault for resume building, interview prep, and hidden job discovery." },
            { icon: Gamepad2, title: "Pengu Arcade", desc: "Recharge with skill-based gaming competitions, leaderboards, and real rewards." },
            { icon: Star, title: "Expert Mentorship", desc: "1-on-1 guidance from top 1% experts for assignments, research, and presentations." },
            { icon: HeartPulse, title: "Mental Wellness", desc: "Track and manage your academic stress with our built-in Mood Swing tracker." }
        ],
        benefits: [
            "Smart Scholarship Matching",
            "Universal AI Problem Solver",
            "Skill-based Gaming Rewards",
            "Expert-vetted solutions",
            "Pay-per-milestone security",
            "100% Confidentiality"
        ]
    };

    const content = isExpert ? expertContent : studentContent;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1] // Cubic-Bezier for more premium easeOutExpo
            } as const
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 selection:bg-[#5D4037] selection:text-white overflow-hidden font-sans">
            <SEO
                title={isExpert ? "Join as an Expert | Pengu VIP" : "Premium Academic OS | Pengu VIP"}
                description={content.subtitle}
                url={`https://pengu.work.gd/join/${type}`}
                keywords={isExpert ? "become an expert, academic tutoring jobs, assignment help gigs, expert network" : "academic tools, study help, scholarship discovery, expert mentorship"}
            />
            {/* Dynamic Mesh Gradient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#5D4037]/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#A1887F]/8 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
                <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] bg-stone-200/20 rounded-full blur-[100px]" />
            </div>

            {/* Premium Navbar */}
            <nav className="relative z-50 px-6 py-6 border-b border-stone-200/50 bg-white/20 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2 group">
                        <PenguLogoDark className="h-8 w-auto transition-transform group-hover:scale-105" />
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link to="/signup">
                            <Button className="rounded-full px-6 bg-[#5D4037] hover:bg-[#3E2723] shadow-lg shadow-stone-200">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid lg:grid-cols-2 gap-20 items-center"
                >
                    {/* Left Side: Impactful Lead */}
                    <div className="space-y-10 lg:sticky lg:top-32 self-start">
                        <motion.div variants={itemVariants}>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-stone-200 shadow-sm text-[#5D4037] text-xs font-black uppercase tracking-widest mb-8">
                                <Sparkles className="size-3" /> Premium Invitation
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black text-[#3E2723] leading-[0.95] tracking-tighter mb-8">
                                {content.title.split(' ').map((word, i) => (
                                    <span key={i} className={i === 1 || i === 4 ? "text-stone-400 block" : "block"}>
                                        {word}{' '}
                                    </span>
                                ))}
                            </h1>
                            <p className="text-2xl text-stone-600 font-medium leading-tight max-w-lg">
                                {content.subtitle}
                            </p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-6">
                            <p className="text-lg text-stone-500 max-w-md leading-relaxed">
                                {content.motivation}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
                                {content.benefits.map((benefit, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm font-bold text-[#3E2723]/70">
                                        <div className="size-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                            <Check className="size-3 stroke-[3px]" />
                                        </div>
                                        {benefit}
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link to="/signup">
                                    <Button className="h-16 px-12 text-lg font-black rounded-2xl bg-[#3E2723] hover:bg-black shadow-2xl hover:shadow-[#3E2723]/20 hover:-translate-y-1 transition-all group">
                                        {content.cta} <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                                <Link to="/about">
                                    <Button variant="outline" className="h-16 px-10 text-lg rounded-2xl border-2 border-stone-200 text-stone-600 hover:bg-white">
                                        Our Values
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Side: Visual Glass Grid */}
                    <div className="relative">
                        {/* Visual background accents */}
                        <div className="absolute -inset-10 bg-gradient-to-br from-[#5D4037]/10 to-transparent rounded-[4rem] blur-3xl -z-10" />

                        <div className="grid sm:grid-cols-2 gap-6">
                            {content.features.map((feature, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={itemVariants}
                                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                    className="group p-8 rounded-[2.5rem] bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(93,64,55,0.1)] transition-all duration-500"
                                >
                                    <div className="size-16 rounded-3xl bg-white flex items-center justify-center text-[#5D4037] mb-8 group-hover:bg-[#5D4037] group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-lg group-hover:shadow-[#5D4037]/20">
                                        <feature.icon className="size-8" />
                                    </div>
                                    <h3 className="text-2xl font-black text-[#3E2723] mb-4 tracking-tight">{feature.title}</h3>
                                    <p className="text-stone-500 leading-relaxed font-medium">{feature.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </main>

            {/* Refined Perspective Footer */}
            <footer className="relative z-10 max-w-7xl mx-auto px-6 py-32 border-t border-stone-200/50">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <div className="flex justify-center gap-1">
                        {[1, 2, 3, 4, 5].map(i => <Sparkles key={i} className="size-5 text-stone-200" />)}
                    </div>
                    <blockquote className="text-3xl md:text-5xl font-serif italic text-[#3E2723]/80 leading-tight">
                        "{isExpert
                            ? "Your brilliance deserves a platform as sharp as your mind. Stop idling, start impacting."
                            : "Excellence is never accidental. It's the result of high intention and intelligent execution."}"
                    </blockquote>
                    <div className="h-px w-24 bg-stone-200 mx-auto" />
                    <p className="font-black text-[#5D4037] tracking-widest uppercase text-sm">Empowering {isExpert ? 'Experts' : 'Students'} Globally</p>
                </div>
            </footer>
        </div>
    );
}
