import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

const mainLinks = [
  { label: "AI Chat", href: "/chat" },
  { label: "Document Analysis", href: "/documents" },
  { label: "Resume Studio", href: "/resume" },
  { label: "Notes Generator", href: "/notes" },
  { label: "Pricing", href: "/pricing" },
];

const resourceLinks = [
  { label: "Writing", href: "/blog" },
  { label: "Terms of Service", href: "/terms" },
];

export default function Footer() {
  return (
    <footer className="bg-brand-black text-brand-white rounded-t-[3rem] pt-20 pb-10 px-8 md:px-16 mt-20 mx-2">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-16">
        
        {/* Left side: Navigation */}
        <div className="flex flex-col gap-12 max-w-sm w-full">
          {/* Main Links */}
          <div className="flex flex-col gap-2">
            {mainLinks.map((link, idx) => (
              <Link 
                key={idx} 
                href={link.href}
                className="text-4xl md:text-5xl font-display font-medium text-gray-300 hover:text-brand-orange transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <hr className="border-white/20" />

          {/* Resources */}
          <div className="flex flex-col gap-3">
            <span className="text-gray-500 font-medium uppercase tracking-wider text-sm mb-2">Resources</span>
            {resourceLinks.map((link, idx) => (
              <Link 
                key={idx} 
                href={link.href}
                className="text-xl text-gray-300 hover:text-brand-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right side: Branding / Call to action */}
        <div className="flex flex-col justify-between items-end text-right">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-brand-white rounded-full flex items-center justify-center text-brand-black">
               <ArrowUpRight size={32} weight="bold" />
            </div>
            <div className="grid grid-cols-3 gap-1">
              {[...Array(9)].map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i === 4 ? 'bg-brand-orange' : 'bg-white/30'}`}></div>
              ))}
            </div>
          </div>
          
          <div className="mt-20 md:mt-0">
             <h2 className="text-6xl md:text-8xl font-display font-bold text-white tracking-tighter">
               Cognify<span className="text-brand-orange">.</span>
             </h2>
             <p className="text-gray-400 mt-4 text-lg">
               Your complete AI-powered workspace.
             </p>
          </div>
        </div>
        
      </div>
      
      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Cognify. All rights reserved.</p>
        <p>Built with purpose.</p>
      </div>
    </footer>
  );
}
