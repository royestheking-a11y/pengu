import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { PublicLayout } from './components/Layout';
import { Button } from './components/ui/button';
import { ArrowLeft, CheckCircle, Clock, ShieldCheck, Star } from 'lucide-react';
import { SERVICES } from './data/services';
import { motion } from 'motion/react';

export default function ServiceDetails() {
  const { id } = useParams();
  const service = SERVICES.find(s => s.id === id);

  if (!service) {
    return <Navigate to="/services" replace />;
  }

  const Icon = service.icon;

  return (
    <PublicLayout>
      <div className="bg-[#FAFAFA] min-h-screen">
        {/* Hero Section */}
        <div className="bg-[#3E2723] text-white pt-32 pb-20 relative overflow-hidden">
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

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <Link to="/services" className="inline-flex items-center text-stone-300 hover:text-white mb-8 transition-colors">
              <ArrowLeft className="mr-2 size-4" /> Back to Services
            </Link>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className={`p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 text-white`}>
                <Icon className="size-12" />
              </div>
              <div className="max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-bold mb-6">{service.title}</h1>
                <p className="text-xl text-stone-200 leading-relaxed mb-8">
                  {service.shortDescription}
                </p>
                <div className="flex gap-4">
                  <Link to="/signup">
                    <Button size="lg" className="bg-white text-[#3E2723] hover:bg-stone-100 font-bold px-8">
                      Get Started
                    </Button>
                  </Link>
                  <div className="flex items-center gap-2 text-stone-300 px-4 py-2">
                    <Star className="size-5 text-amber-400 fill-amber-400" />
                    <span className="font-bold text-white">4.9/5</span> Rating
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-3 gap-12">

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="text-2xl font-bold text-[#3E2723] mb-6">About This Service</h2>
                <p className="text-lg text-stone-600 leading-relaxed">
                  {service.fullDescription}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3E2723] mb-6">What's Included</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {service.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-stone-100">
                      <CheckCircle className="size-5 text-green-600 mt-0.5 shrink-0" />
                      <span className="text-stone-700 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-[#3E2723] mb-6">How It Works</h2>
                <div className="space-y-6">
                  {service.process && service.process.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 size-8 rounded-full bg-[#5D4037] text-white flex items-center justify-center font-bold text-sm">
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-stone-900 mb-1">Step {i + 1}</h3>
                        <p className="text-stone-600">{step}</p>
                      </div>
                    </div>
                  ))}
                  {!service.process && <p className="text-stone-500">Contact us for details on the process.</p>}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                <h3 className="font-bold text-xl text-stone-900 mb-6">Service Highlights</h3>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-stone-600">
                    <Clock className="size-5 text-amber-500" />
                    <span>Fast Turnaround</span>
                  </div>
                  <div className="flex items-center gap-3 text-stone-600">
                    <ShieldCheck className="size-5 text-green-500" />
                    <span>100% Confidential</span>
                  </div>
                  <div className="flex items-center gap-3 text-stone-600">
                    <Star className="size-5 text-blue-500" />
                    <span>Expert Support</span>
                  </div>
                </div>


                <Link to="/signup" className="block w-full">
                  <Button className="w-full font-bold text-lg h-12">
                    Order Now
                  </Button>
                </Link>
              </div>

              <div className="bg-[#5D4037] p-6 rounded-2xl text-white">
                <h3 className="font-bold text-lg mb-2">Need a Custom Solution?</h3>
                <p className="text-stone-300 text-sm mb-4">
                  We can tailor this service to your specific requirements.
                </p>
                <Link to="/contact">
                  <Button className="w-full bg-transparent border border-white text-white hover:bg-white/10 shadow-none">
                    Contact Support
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
