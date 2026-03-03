import React from 'react';
import { PublicLayout } from './components/Layout';
import SEO from './components/SEO';

export default function About() {
  return (
    <PublicLayout>
      <SEO
        title="About Us | Pengu Premium OS"
        description="Learn about Pengu's mission to empower students with expert support, AI study tools, global scholarships, and career acceleration."
        url="https://pengu.work.gd/about"
        keywords="about Pengu, premium academic OS, study abroad, expert mentorship, student empowerment"
      />
      <div className="bg-[#FAFAFA] min-h-screen pb-20">
        <div className="bg-white border-b border-stone-100 py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4 text-[#3E2723]">About Pengu</h1>
            <p className="text-stone-500 text-lg">We're on a mission to empower students with expert support.</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-[#3E2723] mb-4">Our Story</h2>
            <p className="text-stone-600 leading-relaxed text-lg">
              Founded in 2023, Pengu started with a simple observation: students are often overwhelmed, not because they lack ability, but because they lack time and targeted guidance. We set out to build a platform that connects ambitious students with subject matter experts who can provide the support they need to succeed.
            </p>
            <p className="text-stone-600 leading-relaxed text-lg mt-4">
              Today, Pengu has evolved into a comprehensive <b>Premium Academic OS & Career Accelerator</b>. We've expanded far beyond basic assignment help. Our ecosystem now includes an AI-driven Global Scholarship Discovery board, intelligent study tools, dynamic career preparation resources, and even an integrated gamified Arcade. We are here to guide you from your first college assignment to securing your dream global career.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#3E2723] mb-4">What We Offer</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
                <h3 className="font-bold text-amber-900 mb-2">Global Scholarships</h3>
                <p className="text-stone-600 text-sm">Our AI-powered Discovery Board finds high-probability global scholarships using a proprietary Smart Match system, eliminating the guesswork from studying abroad.</p>
              </div>
              <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                <h3 className="font-bold text-indigo-900 mb-2">Expert & AI Support</h3>
                <p className="text-stone-600 text-sm">From our AI Problem Solver and automated Flashcard generators to deep-dive 1-on-1 mentorship with verified experts, we offer hybrid support tailored to your learning style.</p>
              </div>
              <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
                <h3 className="font-bold text-emerald-900 mb-2">Career Acceleration</h3>
                <p className="text-stone-600 text-sm">Access our Career Vault to discover hidden jobs, build targeted resumes, and prepare for interviews. Your academic success seamlessly translates into career momentum.</p>
              </div>
              <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100">
                <h3 className="font-bold text-rose-900 mb-2">Pengu Arcade</h3>
                <p className="text-stone-600 text-sm">All work and no play isn't our style. Recharge with our gamified platform offering skill-based gaming competitions, leaderboards, and real rewards.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#3E2723] mb-4">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                <h3 className="font-bold text-[#5D4037] mb-2">Integrity</h3>
                <p className="text-stone-500">We believe in ethical assistance. Our goal is to help students learn and improve, not just pass.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                <h3 className="font-bold text-[#5D4037] mb-2">Quality</h3>
                <p className="text-stone-500">We don't settle for average. Every expert is vetted, and every deliverable is reviewed.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                <h3 className="font-bold text-[#5D4037] mb-2">Accessibility</h3>
                <p className="text-stone-500">Expert help should be available when you need it, at a price that makes sense for students.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                <h3 className="font-bold text-[#5D4037] mb-2">Privacy</h3>
                <p className="text-stone-500">Your academic journey is personal. We protect your data and identity with bank-level security.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#3E2723] mb-4">The Team</h2>
            <p className="text-stone-600 leading-relaxed text-lg">
              We are a diverse team of educators, engineers, and support specialists distributed globally. United by our passion for education, we work around the clock to ensure Pengu delivers the best possible experience for our users.
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
