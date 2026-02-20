import React from 'react';
import { PublicLayout } from './components/Layout';
import {
  FileText,
  MessageSquare,
  CreditCard,
  CheckCircle,
  ArrowRight,
  Shield,
  Star,
  Clock
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Link } from 'react-router-dom';

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Submit Your Request",
      description: "Tell us what you need. Upload assignment details, rubrics, and set your deadline. The more details, the better.",
      icon: FileText
    },
    {
      number: "02",
      title: "Get a Custom Quote",
      description: "We review your request and provide a fixed price quote. No hidden fees or surprises.",
      icon: CreditCard
    },
    {
      number: "03",
      title: "Expert at Work",
      description: "Once accepted, a qualified expert starts working. You can chat directly with them for updates.",
      icon: MessageSquare
    },
    {
      number: "04",
      title: "Quality Check & Delivery",
      description: "Our QA team reviews the work for quality and plagiarism before it's delivered to you.",
      icon: CheckCircle
    }
  ];

  return (
    <PublicLayout>
      <div className="bg-[#FAFAFA] min-h-screen pb-20">
        {/* Header */}
        <div className="bg-white border-b border-stone-100 py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-[#5D4037] font-bold tracking-wider text-sm uppercase mb-4 block">Process</span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#3E2723]">How Pengu Works</h1>
            <p className="text-xl text-stone-500 max-w-2xl mx-auto">
              A transparent, secure, and professional process designed to get you the best results.
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto px-4 py-20">
          <div className="space-y-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute left-[50%] top-0 bottom-0 w-px bg-stone-200 -translate-x-1/2" />

            {steps.map((step, index) => (
              <div key={index} className={`flex flex-col md:flex-row gap-8 md:gap-16 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>

                {/* Content Side */}
                <div className={`flex-1 text-center ${index % 2 === 1 ? 'md:text-left' : 'md:text-right'}`}>
                  <div className="inline-block md:hidden mb-4 p-3 bg-white rounded-full border border-stone-100 shadow-sm text-[#5D4037]">
                    <step.icon className="size-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#3E2723] mb-3">{step.title}</h3>
                  <p className="text-stone-500 leading-relaxed">{step.description}</p>
                </div>

                {/* Center Marker */}
                <div className="relative z-10 size-12 rounded-full bg-[#5D4037] text-white flex items-center justify-center font-bold text-lg shadow-lg ring-4 ring-white">
                  {step.number}
                </div>

                {/* Icon/Visual Side */}
                <div className={`flex-1 flex ${index % 2 === 1 ? 'justify-end' : 'justify-start'}`}>
                  <div className="hidden md:flex size-32 bg-white rounded-2xl border border-stone-100 shadow-sm items-center justify-center text-[#5D4037]/20">
                    <step.icon className="size-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#5D4037] text-white py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
            <p className="text-stone-200 mb-8 text-lg">
              Join thousands of students achieving their academic goals with Pengu.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto bg-white text-[#5D4037] hover:bg-stone-100 font-bold">
                  Start Your Request
                </Button>
              </Link>
              <Link to="/reviews">
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent border-white text-white hover:bg-white/10">
                  See Reviews
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
