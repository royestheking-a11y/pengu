import React from 'react';
import { PublicLayout } from './components/Layout';
import {
  CheckCircle,
  Clock,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Link } from 'react-router-dom';
import { SERVICES } from './data/services';

export default function Services() {
  return (
    <PublicLayout>
      <div className="bg-[#FAFAFA] min-h-screen pb-20">
        {/* Hero */}
        <div className="bg-[#3E2723] text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Academic Excellence, On Demand</h1>
            <p className="text-xl text-stone-200 mb-8 max-w-2xl mx-auto">
              From daily assignments to final year projects, connect with vetted experts who help you succeed.
            </p>
            <Link to="/signup">
              <Button size="lg" className="bg-white text-[#5D4037] hover:bg-stone-100 font-bold px-8 py-6 h-auto text-lg">
                Get Started Today
              </Button>
            </Link>
          </div>
        </div>

        {/* Services Grid */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((service) => {
              const Icon = service.icon;
              return (
                <div key={service.id} className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100 hover:shadow-md transition-shadow flex flex-col h-full">
                  <div className={`size-14 ${service.bg} rounded-xl flex items-center justify-center ${service.color} mb-6`}>
                    <Icon className="size-7" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mb-3">{service.title}</h3>
                  <p className="text-stone-500 mb-6 leading-relaxed flex-grow">
                    {service.shortDescription}
                  </p>

                  <div className="space-y-4">
                    <ul className="space-y-3">
                      {service.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-sm text-stone-600">
                          <CheckCircle className="size-4 text-green-500 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link to={`/services/${service.id}`} className="block mt-6 pt-6 border-t border-stone-100">
                      <Button variant="outline" className="w-full justify-between group">
                        View Details
                        <ArrowRight className="size-4 text-stone-400 group-hover:text-[#5D4037] transition-colors" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-white py-16 border-y border-stone-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-[#3E2723]">Why Students Trust Pengu</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="p-6">
                <div className="mx-auto size-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4">
                  <ShieldCheck className="size-8" />
                </div>
                <h3 className="font-bold text-lg mb-2">Vetted Experts</h3>
                <p className="text-stone-500">Every expert passes a rigorous subject matter exam and background check.</p>
              </div>
              <div className="p-6">
                <div className="mx-auto size-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mb-4">
                  <Clock className="size-8" />
                </div>
                <h3 className="font-bold text-lg mb-2">On-Time Delivery</h3>
                <p className="text-stone-500">We respect deadlines. Get your work back on time, every time.</p>
              </div>
              <div className="p-6">
                <div className="mx-auto size-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-4">
                  <CheckCircle className="size-8" />
                </div>
                <h3 className="font-bold text-lg mb-2">Quality Guarantee</h3>
                <p className="text-stone-500">Free revisions and a money-back guarantee if requirements aren't met.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
