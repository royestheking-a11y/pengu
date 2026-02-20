import React from 'react';
import { PublicLayout } from './components/Layout';
import { Button } from './components/ui/button';
import { Mail, MapPin, Phone, MessageSquare, Clock } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

export default function Contact() {
  const [formData, setFormData] = React.useState({
    firstName: '', lastName: '', email: '', subject: 'General Inquiry', message: ''
  });
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contact', formData);
      toast.success("Message sent successfully!");
      setFormData({ firstName: '', lastName: '', email: '', subject: 'General Inquiry', message: '' });
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <PublicLayout>
      <div className="bg-[#FAFAFA] min-h-screen pb-20">
        <div className="bg-white border-b border-stone-100 py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4 text-[#3E2723]">Contact Us</h1>
            <p className="text-stone-500 text-lg">We're here to help. Reach out to our team anytime.</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-[#3E2723] mb-6">Get in touch</h2>
                <p className="text-stone-500 text-lg leading-relaxed mb-8">
                  Whether you have a question about our services, pricing, or need help with an existing order, our team is ready to assist you.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-6">
                <div className="group bg-white border border-stone-100 p-8 rounded-2xl shadow-sm hover:shadow-md hover:border-[#5D4037]/20 transition-all cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#5D4037]/5 rounded-bl-full translate-x-16 -translate-y-16 group-hover:translate-x-12 group-hover:-translate-y-12 transition-transform" />
                  <div className="relative z-10">
                    <div className="size-14 bg-gradient-to-br from-stone-50 to-stone-100 rounded-2xl flex items-center justify-center text-[#5D4037] mb-6 shadow-inner">
                      <Mail className="size-7" />
                    </div>
                    <h3 className="text-xl font-bold text-[#3E2723] mb-2">Email</h3>
                    <p className="text-stone-600 font-medium mb-1">support@pengu.com</p>
                    <div className="flex items-center gap-2 text-stone-400 text-sm">
                      <Clock className="size-4" />
                      <span>Response within 2 hours</span>
                    </div>
                  </div>
                </div>

                <div className="group bg-white border border-stone-100 p-8 rounded-2xl shadow-sm hover:shadow-md hover:border-[#5D4037]/20 transition-all cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#5D4037]/5 rounded-bl-full translate-x-16 -translate-y-16 group-hover:translate-x-12 group-hover:-translate-y-12 transition-transform" />
                  <div className="relative z-10">
                    <div className="size-14 bg-gradient-to-br from-stone-50 to-stone-100 rounded-2xl flex items-center justify-center text-[#5D4037] mb-6 shadow-inner">
                      <MessageSquare className="size-7" />
                    </div>
                    <h3 className="text-xl font-bold text-[#3E2723] mb-2">Live Chat</h3>
                    <p className="text-stone-600 font-medium mb-1">Available on dashboard</p>
                    <div className="flex items-center gap-2 text-stone-400 text-sm">
                      <Clock className="size-4" />
                      <span>24/7 Support</span>
                    </div>
                  </div>
                </div>

                <div className="group bg-white border border-stone-100 p-8 rounded-2xl shadow-sm hover:shadow-md hover:border-[#5D4037]/20 transition-all cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#5D4037]/5 rounded-bl-full translate-x-16 -translate-y-16 group-hover:translate-x-12 group-hover:-translate-y-12 transition-transform" />
                  <div className="relative z-10">
                    <div className="size-14 bg-gradient-to-br from-stone-50 to-stone-100 rounded-2xl flex items-center justify-center text-[#5D4037] mb-6 shadow-inner">
                      <MapPin className="size-7" />
                    </div>
                    <h3 className="text-xl font-bold text-[#3E2723] mb-2">Office Hours</h3>
                    <p className="text-stone-600 font-medium mb-1">Monday - Sunday</p>
                    <div className="flex items-center gap-2 text-stone-400 text-sm">
                      <Clock className="size-4" />
                      <span>Always Open</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-stone-100">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-[#3E2723] mb-2">Send us a message</h3>
                <p className="text-stone-500">Fill out the form below and we'll get back to you shortly.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">First Name</label>
                    <input name="firstName" value={formData.firstName} onChange={handleChange} required type="text" className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/30 focus:outline-none focus:ring-4 focus:ring-[#5D4037]/5 focus:border-[#5D4037] transition-all placeholder:text-stone-400" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">Last Name</label>
                    <input name="lastName" value={formData.lastName} onChange={handleChange} required type="text" className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/30 focus:outline-none focus:ring-4 focus:ring-[#5D4037]/5 focus:border-[#5D4037] transition-all placeholder:text-stone-400" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Email Address</label>
                  <input name="email" value={formData.email} onChange={handleChange} required type="email" className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/30 focus:outline-none focus:ring-4 focus:ring-[#5D4037]/5 focus:border-[#5D4037] transition-all placeholder:text-stone-400" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Subject</label>
                  <select name="subject" value={formData.subject} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/30 focus:outline-none focus:ring-4 focus:ring-[#5D4037]/5 focus:border-[#5D4037] transition-all appearance-none cursor-pointer">
                    <option>General Inquiry</option>
                    <option>Support with Order</option>
                    <option>Billing Issue</option>
                    <option>Partner with us</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Message</label>
                  <textarea name="message" value={formData.message} onChange={handleChange} required rows={8} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/30 focus:outline-none focus:ring-4 focus:ring-[#5D4037]/5 focus:border-[#5D4037] transition-all placeholder:text-stone-400 resize-none" placeholder="How can we help you?"></textarea>
                </div>
                <Button disabled={loading} className="mt-4 w-full bg-[#5D4037] hover:bg-[#4E342E] text-white h-14 rounded-xl font-bold text-lg shadow-lg shadow-[#5D4037]/20 transition-all active:scale-[0.98]">
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
