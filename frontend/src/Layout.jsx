const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Vote, Heart, Sparkles, Info, Trophy, Radio, User, Globe, Users } from "lucide-react";
import HelpChatButton from "@/components/HelpChatButton";
import LanguageSelector from "@/components/LanguageSelector";
import { LanguageProvider, useTranslation } from "@/components/LanguageProvider";
import { useQuery } from "@tanstack/react-query";

function LayoutContent({ children, currentPageName }) {
  const location = useLocation();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showInitialLanguageSetup, setShowInitialLanguageSetup] = useState(false);
  const { t } = useTranslation();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => db.auth.me(),
  });

  useEffect(() => {
    if (user && !user.has_selected_language) {
      setShowInitialLanguageSetup(true);
    }
  }, [user]);

  const navigationItems = [
    { title: t('nav.feed'), url: createPageUrl("Feed"), icon: Home, color: "text-blue-600" },
    { title: t('nav.live'), url: createPageUrl("Live"), icon: Radio, color: "text-red-600" },
    { title: "Teams", url: createPageUrl("Teams"), icon: Users, color: "text-emerald-600" },
    { title: t('nav.polls'), url: createPageUrl("Polls"), icon: Vote, color: "text-purple-600" },
    { title: t('nav.campaigns'), url: createPageUrl("Campaigns"), icon: Sparkles, color: "text-pink-600" },
    { title: t('nav.donate'), url: createPageUrl("Donate"), icon: Heart, color: "text-red-600" },
    { title: t('nav.sponsor'), url: createPageUrl("SponsorFund"), icon: Trophy, color: "text-orange-600" },
    { title: t('nav.about'), url: createPageUrl("About"), icon: Info, color: "text-cyan-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center group">
              <img 
                src="/assets/logo.png"
                alt="My64 Village Connect"
                className="h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.url;
                return (
                  <Link
                    key={item.title}
                    to={item.url}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.title}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Icons */}
            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <button
                onClick={() => setShowLanguageSelector(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                title="Change Language"
              >
                <Globe className="w-5 h-5" />
                <span className="hidden md:inline text-sm font-medium">
                  {t('nav.language')}
                </span>
              </button>

              {/* Profile Link */}
              <Link
                to={createPageUrl("Profile")}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              >
                {user?.profile_image_url ? (
                  <img
                    src={user.profile_image_url}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {user?.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <span className="hidden md:inline text-sm font-medium">
                  {user?.full_name || t('nav.profile')}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 md:pb-0">
        {children}
      </main>

      {/* Help Chat Button */}
      <HelpChatButton />

      {/* Language Selector Dialogs */}
      <LanguageSelector
        isOpen={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
        isInitialSetup={false}
      />
      <LanguageSelector
        isOpen={showInitialLanguageSetup}
        onClose={() => setShowInitialLanguageSetup(false)}
        isInitialSetup={true}
      />

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-around py-2 px-2">
          {navigationItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.url;
            return (
              <Link
                key={item.title}
                to={item.url}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                  isActive ? `${item.color} bg-opacity-10` : "text-gray-500"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.title}</span>
              </Link>
            );
          })}
          {/* Profile in mobile nav */}
          <Link
            to={createPageUrl("Profile")}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
              location.pathname === createPageUrl("Profile") ? "text-purple-600 bg-opacity-10" : "text-gray-500"
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">{t('nav.profile')}</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <LanguageProvider>
      <LayoutContent children={children} currentPageName={currentPageName} />
    </LanguageProvider>
  );
}