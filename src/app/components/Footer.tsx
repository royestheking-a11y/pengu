import React from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  AtSign
} from 'lucide-react';
import { PenguLogoWhite } from './PenguLogoWhite';

export function Footer() {
  return (
    <footer className="bg-[#3E2723] text-white py-16">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
        {/* Branding & Socials */}
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <PenguLogoWhite className="h-8 w-auto" />
          </div>
          <p className="text-stone-300 text-sm leading-relaxed mb-8">
            Premium academic & career support — managed and secure.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.facebook.com/penguproject"
              target="_blank"
              rel="noopener noreferrer"
              className="size-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-blue-400 transition-all border border-white/10"
              title="Facebook"
            >
              <Facebook className="size-5" />
            </a>
            <a
              href="https://www.instagram.com/project.pengu/"
              target="_blank"
              rel="noopener noreferrer"
              className="size-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-pink-400 transition-all border border-white/10"
              title="Instagram"
            >
              <Instagram className="size-5" />
            </a>
            <a
              href="https://www.threads.com/@project.pengu"
              target="_blank"
              rel="noopener noreferrer"
              className="size-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-stone-300 transition-all border border-white/10"
              title="Threads"
            >
              <AtSign className="size-5" />
            </a>
          </div>
        </div>

        {/* Services */}
        <div>
          <h3 className="font-bold text-lg mb-6">Services</h3>
          <ul className="space-y-3 text-stone-300 text-sm">
            <li><Link to="/services" className="hover:text-white transition-colors">Assignment Support</Link></li>
            <li><Link to="/services" className="hover:text-white transition-colors">Research & Editing</Link></li>
            <li><Link to="/services" className="hover:text-white transition-colors">Presentation Design</Link></li>
            <li><Link to="/services" className="hover:text-white transition-colors">Career Vault</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="font-bold text-lg mb-6">Company</h3>
          <ul className="space-y-3 text-stone-300 text-sm">
            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="/how-it-works" className="hover:text-white transition-colors">How it works</Link></li>
            <li><Link to="/reviews" className="hover:text-white transition-colors">Reviews</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="font-bold text-lg mb-6">Legal</h3>
          <ul className="space-y-3 text-stone-300 text-sm">
            <li><Link to="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/legal/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            <li><Link to="/legal/honor-code" className="hover:text-white transition-colors">Honor Code</Link></li>
          </ul>
        </div>

        {/* Contact Us */}
        <div>
          <h3 className="font-bold text-lg mb-6">Contact Us</h3>
          <ul className="space-y-4 text-stone-300 text-sm">
            <li className="flex gap-3">
              <MapPin className="size-5 text-[#D7CCC8] shrink-0" />
              <span>House 34, Road 16, Nikunja 2, Dhaka-1209</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="size-5 text-[#D7CCC8] shrink-0" />
              <a href="tel:+8801604710170" className="hover:text-white transition-colors">+8801604710170</a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="size-5 text-[#D7CCC8] shrink-0" />
              <a href="mailto:rpenguprojects@gmail.com" className="hover:text-white transition-colors">penguprojects@gmail.com</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-white/10 text-center text-sm text-stone-400">
        <p>© {new Date().getFullYear()} Pengu Inc. All rights reserved.</p>
      </div>
    </footer>
  );
}
