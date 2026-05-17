const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Shield, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import AdminNav from "@/components/admin/AdminNav";
import AdminFeed from "@/components/admin/AdminFeed";
import AdminTeamsPanel from "@/components/admin/AdminTeamsPanel";
import AdminCampaignsPanel from "@/components/admin/AdminCampaignsPanel";
import AdminDonationsPanel from "@/components/admin/AdminDonationsPanel";
import AdminPollsPanel from "@/components/admin/AdminPollsPanel";

export default function Admin() {
  const [activeSection, setActiveSection] = useState("feed");

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => db.auth.me(),
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
        <Card className="bg-white p-8 shadow-sm border border-gray-200 rounded-xl text-center max-w-sm">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Admin privileges required.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminNav activeSection={activeSection} onSelect={setActiveSection} />
      <div className="flex-1 min-w-0 p-6 overflow-auto">
        {activeSection === "feed" && <AdminFeed />}
        {activeSection === "teams" && <AdminTeamsPanel />}
        {activeSection === "campaigns" && <AdminCampaignsPanel />}
        {activeSection === "donations" && <AdminDonationsPanel />}
        {activeSection === "polls" && <AdminPollsPanel />}
      </div>
    </div>
  );
}