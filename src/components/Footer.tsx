/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Phone, MapPin, Mail, Instagram, Youtube, HelpCircle, Shield, FileText } from "lucide-react";

export function Footer() {
  const navigate = useNavigate();

  return (
    <footer id="footer" className="bg-slate-900 text-white dark:bg-slate-950 border-t border-slate-800 pt-16 pb-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-slate-800">
          
          {/* Logo brand & text (Col 4) */}
          <div className="md:col-span-4 space-y-4 text-left">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 shadow-md">
                <BookOpen className="h-5 w-5 text-slate-950" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight">Academy <span className="text-sky-400">Flow</span></span>
                <p className="text-[10px] text-slate-400 font-medium">Management & Learning CRM</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Providing top-tier online and offline coaching structures for Classes 1st through 10th. Tailoring high-impact curriculum designed inside state regulations.
            </p>
            <div className="flex gap-4 pt-1 text-slate-400">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-pink-500 transition-colors"
                title="Instagram Profile"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://www.youtube.com/@AcademyFlowTution" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-rose-500 transition-colors"
                title="Youtube Channel"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick links (Col 4) */}
          <div className="md:col-span-4 text-left space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-sky-400">Company Policies & About</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              <a href="#" className="hover:text-white flex items-center gap-1.5 transition-colors">
                <Shield className="h-3.5 w-3.5 text-sky-400" />
                <span>Privacy Policy</span>
              </a>
              <a href="#" className="hover:text-white flex items-center gap-1.5 transition-colors">
                <FileText className="h-3.5 w-3.5 text-sky-400" />
                <span>Terms of Service</span>
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate("/"); }} className="hover:text-white flex items-center gap-1.5 transition-colors">
                <HelpCircle className="h-3.5 w-3.5 text-sky-400" />
                <span>About Us</span>
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate("/login"); }} className="hover:text-white flex items-center gap-1.5 transition-colors">
                <BookOpen className="h-3.5 w-3.5 text-sky-400" />
                <span>Tutors Registry</span>
              </a>
            </div>
          </div>

          {/* Contacts (Col 4) */}
          <div className="md:col-span-4 text-left space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-sky-400">Contact & Support</h4>
            <div className="space-y-2.5 text-xs text-slate-350">
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Tutor Enquiries: <strong className="text-white">+91 954239546</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-sky-400 shrink-0" />
                <span>Admin Support: <strong className="text-white">+91 6300227011</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-rose-500 shrink-0" />
                <span>Centers: Hyderabad, Warangal, Karimnagar, Telangana</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>Email: support@academyflow.com</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Rights */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-4">
          <p>© 2026 Academy Flow Institutions. All rights reserved.</p>
          <div className="flex gap-4">
            <span>ISO 9001:2015 Bureau Certified</span>
            <span>•</span>
            <span>Made for Academic Precision</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
