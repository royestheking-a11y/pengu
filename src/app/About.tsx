import React from 'react';
import { PublicLayout } from './components/Layout';

export default function About() {
  return (
    <PublicLayout>
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
