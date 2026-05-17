const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from "react";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Shield, Users, Vote, Sparkles, Heart, Trophy, FileText, Image, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdminDashboard() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => db.auth.me(),
  });

  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const [users, polls, campaigns, donations] = await Promise.all([
        db.entities.User.list(),
        db.entities.Poll.list(),
        db.entities.Campaign.list(),
        db.entities.Donation.list(),
      ]);
      return {
        users: users.length,
        polls: polls.length,
        campaigns: campaigns.length,
        donations: donations.length,
      };
    },
    enabled: !!user && user.role === 'admin',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="bg-white p-8 shadow-sm border border-gray-200 rounded-xl text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </Card>
      </div>
    );
  }

  const menuItems = [
    { title: "Users Management", icon: Users, url: createPageUrl("AdminUsers"), color: "from-blue-500 to-cyan-500", count: stats?.users },
    { title: "Polls Management", icon: Vote, url: createPageUrl("AdminPolls"), color: "from-purple-500 to-pink-500", count: stats?.polls },
    { title: "Campaigns Management", icon: Sparkles, url: createPageUrl("AdminCampaigns"), color: "from-pink-500 to-red-500", count: stats?.campaigns },
    { title: "Donations Management", icon: Heart, url: createPageUrl("AdminDonations"), color: "from-red-500 to-pink-500", count: stats?.donations },
    { title: "Sponsors Management", icon: Trophy, url: createPageUrl("AdminSponsors"), color: "from-orange-500 to-yellow-500" },
    { title: "About Section", icon: FileText, url: createPageUrl("AdminAbout"), color: "from-cyan-500 to-blue-500" },
    { title: "Advertisements", icon: Image, url: createPageUrl("AdminAds"), color: "from-indigo-500 to-purple-500" },
  ];

  return (
    <div className="min-h-screen py-6 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="bg-gradient-to-br from-blue-600 to-purple-600 p-8 shadow-lg border-0 rounded-xl mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-white/90">Manage My64 Village Platform</p>
            </div>
          </div>
        </Card>

        {/* Management Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.title} to={item.url}>
                <Card className="bg-white p-6 shadow-sm border border-gray-200 rounded-xl hover:shadow-lg transition-all cursor-pointer group">
                  <div className={`inline-block p-3 rounded-xl bg-gradient-to-br ${item.color} mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  {item.count !== undefined && (
                    <p className="text-gray-600 text-sm">
                      Total: <span className="font-semibold">{item.count}</span>
                    </p>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}