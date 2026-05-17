import React from "react";
import { Shield, MessageSquare, Users, Sparkles, Heart, Vote, Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { id: "feed", label: "Feed & Reports", icon: MessageSquare, color: "text-blue-600" },
  { id: "teams", label: "Teams", icon: Users, color: "text-emerald-600" },
  { id: "campaigns", label: "Campaigns", icon: Sparkles, color: "text-pink-600" },
  { id: "donations", label: "Donations", icon: Heart, color: "text-red-600" },
  { id: "polls", label: "Polls", icon: Vote, color: "text-purple-600" },
];

export default function AdminNav({ activeSection, onSelect }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-20 left-3 z-50 bg-white border border-gray-200 rounded-lg p-2 shadow"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <aside className={`
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        fixed md:static top-0 left-0 h-full md:h-auto z-40
        w-56 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200
      `}>
        {/* Logo */}
        <div className="p-5 border-b m-5 rounded-lg">
          <div className="flex flex-col items-center">
            <img src="/assets/logo.png" alt="My64 Logo" className="h-8 w-auto mb-1" />
            <p className="font-bold text-gray-900 text-[10px] uppercase tracking-tighter">Admin Panel</p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onSelect(item.id); setMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                  ? "bg-blue-50 text-blue-700 border border-blue-100"
                  : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : item.color}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/30 z-30" onClick={() => setMobileOpen(false)} />
      )}
    </>
  );
}