import React from 'react';
import { PublicLayout } from './components/Layout';
import { Button } from './components/ui/button';
import {
  ArrowRight,
  CheckCircle,
  ShieldCheck,
  Clock,
  Star,
  ChevronDown,
  Mail,
  HelpCircle,
  GraduationCap,
  Users,
  BookOpen,
  Sparkles,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SERVICES } from './data/services';
import { HeroCarousel } from './components/HeroCarousel';
import { SmartActions } from './components/SmartActions';
import { useStore } from './store';
import { HomeSkeleton } from './components/HomeSkeleton';
import SEO from './components/SEO';
import SocialSchema from './components/SocialSchema';
import {
  ReviewsSection
} from './ReviewsSection';

// Verified HeroCarousel import
export default function LandingPage() {
  const { isInitialized } = useStore();
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  if (!isInitialized) return <HomeSkeleton />;

  const faqs = [
    {
      question: "Is Pengu confidential?",
      answer: "Yes, absolutely. We operate with a strict privacy policy. Your personal information is never shared with experts, and your order details are kept secure."
    },
    {
      question: "How do I communicate with my expert?",
      answer: "Once an expert is assigned, you can chat directly with them through our secure dashboard to provide updates, ask questions, or clarify instructions."
    },
    {
      question: "What if I'm not satisfied with the work?",
      answer: "We offer free revisions to ensure the work meets your requirements. If standards are not met, we have a money-back guarantee policy."
    },
    {
      question: "Are the experts qualified?",
      answer: "Every expert on Pengu undergoes a rigorous vetting process, including subject matter exams and background checks. Only the top 5% of applicants are accepted."
    }
  ];

  return (
    <PublicLayout>
      <SEO
        title="Premium Academic OS & Career Accelerator"
        description="Meet Pengu. The premium workspace for students and professionals. Use our AI Live Canvas, secure expert assignment support, and build your career portfolio."
        url="https://pengu.work.gd/"
        keywords="premium academic support, AI study workspace, career acceleration platform, university assignment help, Pengu platform"
      />
      <SocialSchema />
      <div className="bg-[#FAFAFA]">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-[#3E2723] text-white">
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Mobile Background Image - Removed in favor of Carousel */}
          {/* <div className="absolute inset-0 lg:hidden pointer-events-none">
            <img
              src="/penguteam.png"
              alt=""
              className="w-full h-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#3E2723] via-[#3E2723]/40 to-[#3E2723]/80"></div>
          </div> */}

          <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-6 pb-6 md:pt-8 md:pb-8 relative z-10">
            <HeroCarousel />
          </div>

          {/* Smart Actions Section - Premium Feature */}
          <div className="relative z-20">
            <SmartActions />
          </div>

          {/* Decorative Elements */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block translate-x-1/4">
            <div className="w-[600px] h-[600px] rounded-full bg-[#5D4037] blur-3xl opacity-50"></div>
          </div>
        </div>

        {/* ── Universal Problem Solver Hook Card ── */}
        <div className="bg-white py-6 md:py-12 px-4 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative overflow-hidden rounded-3xl bg-[#3E2723] shadow-2xl shadow-stone-300"
            >
              {/* Glow effects */}
              <div className="absolute -right-10 -top-10 w-48 h-48 md:w-72 md:h-72 bg-[#FF7043]/15 blur-3xl rounded-full pointer-events-none" />
              <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/5 blur-2xl rounded-full pointer-events-none" />

              <div className="relative flex flex-row items-center gap-4 p-5 sm:p-8 md:p-10">

                {/* Icon — compact on mobile */}
                <div className="size-12 sm:size-16 shrink-0 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                  <Sparkles className="size-6 sm:size-8 text-amber-400" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="size-1.5 bg-amber-400 rounded-full animate-pulse shrink-0" />
                    <span className="text-[9px] sm:text-[10px] font-black text-amber-400 uppercase tracking-widest">Premium Feature</span>
                  </div>
                  <h2 className="text-base sm:text-2xl md:text-3xl font-black text-white leading-tight">Universal Problem Solver</h2>
                  <p className="text-white/60 text-[11px] sm:text-sm mt-1 leading-snug line-clamp-2 sm:line-clamp-none">
                    Students. Graduates. Professionals — drop your files and let Pengu solve it.
                  </p>
                </div>

                {/* Button — icon-only on very small, full on sm+ */}
                <Link to="/problem-solver" className="shrink-0">
                  <button className="hidden sm:flex items-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-white font-black rounded-2xl transition-all text-sm whitespace-nowrap shadow-lg shadow-amber-900/20 active:scale-95">
                    <Zap className="size-4" /> Solve Now
                  </button>
                  {/* Mobile: just icon button */}
                  <button className="sm:hidden size-11 flex items-center justify-center bg-amber-500 hover:bg-amber-400 text-white rounded-2xl transition-all shadow-lg active:scale-95">
                    <Zap className="size-5" />
                  </button>
                </Link>
              </div>

              {/* Mobile-only bottom CTA bar */}
              <Link to="/problem-solver" className="sm:hidden block border-t border-white/10">
                <div className="flex items-center justify-center gap-2 py-3 text-amber-400 hover:text-amber-300 transition-colors">
                  <Zap className="size-3.5" />
                  <span className="text-xs font-black uppercase tracking-widest">Solve Now — Get Started Free</span>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Services Section */}
        <div className="bg-stone-50 pt-8 pb-24 border-b border-stone-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-[#5D4037] font-bold tracking-wider text-sm uppercase mb-4 block">Our Services</span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#3E2723] mb-6">Expert Solutions for Every Need</h2>
              <p className="text-stone-500 text-lg">Whether you need help with a complex assignment or career guidance, we have you covered.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {SERVICES.map((service) => {
                const Icon = service.icon;
                return (
                  <div key={service.id} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-all hover:-translate-y-1 group">
                    <div className={`size-12 rounded-xl flex items-center justify-center mb-6 transition-colors ${service.bg} ${service.color} group-hover:bg-[#5D4037] group-hover:text-white`}>
                      <Icon className="size-6" />
                    </div>
                    <h3 className="text-xl font-bold text-stone-900 mb-2">{service.title}</h3>
                    <p className="text-stone-500 text-sm leading-relaxed mb-4 line-clamp-2">
                      {service.shortDescription}
                    </p>
                    <Link to={`/services/${service.id}`} className={`font-bold text-sm flex items-center group-hover:gap-2 transition-all ${service.color}`}>
                      Learn more <ArrowRight className="ml-1 size-4" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="py-24 max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#5D4037] font-bold tracking-wider text-sm uppercase mb-4 block">Why Pengu</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#3E2723] mb-6">More than just a service. <br />A partner in your success.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
              <div className="size-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <ShieldCheck className="size-7" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3">Vetted Experts</h3>
              <p className="text-stone-500 leading-relaxed">
                We don't crowd-source. Every expert is tested and interviewed to ensure they meet our high academic standards.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
              <div className="size-14 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-6">
                <Clock className="size-7" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3">On-Time Delivery</h3>
              <p className="text-stone-500 leading-relaxed">
                Deadlines matter. Our system tracks milestones to ensure you receive your work well before the due date.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
              <div className="size-14 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-6">
                <CheckCircle className="size-7" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3">Quality Control</h3>
              <p className="text-stone-500 leading-relaxed">
                Every deliverable goes through a QA process and plagiarism check before it reaches you.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <ReviewsSection />

        {/* Stats Section moved after Reviews */}
        <div className="bg-white py-16 border-b border-stone-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 min-[450px]:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Subjects Covered", value: "50+", icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Satisfaction Rate", value: "98%", icon: ShieldCheck, color: "text-green-600", bg: "bg-green-50" },
                { label: "Support Available", value: "24/7", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
                { label: "Average Rating", value: "4.9/5", icon: Star, color: "text-purple-600", bg: "bg-purple-50" }
              ].map((stat, i) => (
                <div key={i} className="bg-stone-50 p-6 rounded-2xl border border-stone-100 flex flex-col items-center text-center hover:shadow-md transition-all duration-300 group">
                  <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 mb-4 ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                    <stat.icon className="size-6" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-stone-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-stone-500 font-medium uppercase tracking-wide">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white py-24 border-y border-stone-100">
          <div className="max-w-3xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-[#3E2723] mb-4">Frequently Asked Questions</h2>
              <p className="text-stone-500">Everything you need to know about using Pengu.</p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-stone-200 rounded-xl overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-6 bg-white hover:bg-stone-50 transition-colors text-left"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span className="font-bold text-stone-800 text-lg">{faq.question}</span>
                    <ChevronDown className={`size-5 text-stone-400 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-stone-50"
                      >
                        <div className="p-6 pt-0 text-stone-600 leading-relaxed border-t border-stone-100">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact CTA Section */}
        <div className="py-24 max-w-7xl mx-auto px-4">
          <div className="bg-[#3E2723] rounded-3xl p-12 md:p-24 text-center text-white relative overflow-hidden">
            {/* Abstract Circles */}
            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Still have questions?</h2>
              <p className="text-stone-300 text-lg mb-10">
                Our support team is available 24/7 to help you with any questions or custom requests.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button size="lg" className="bg-white text-[#3E2723] hover:bg-stone-100 font-bold w-full sm:w-auto">
                    <Mail className="mr-2 size-4" /> Contact Support
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="ghost" size="lg" className="border border-white text-white hover:bg-white/10 w-full sm:w-auto">
                    <HelpCircle className="mr-2 size-4" /> Visit Help Center
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </PublicLayout>
  );
}
