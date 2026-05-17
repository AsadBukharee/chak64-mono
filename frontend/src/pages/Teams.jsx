const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import TeamsList from "@/components/teams/TeamsList";
import TeamDetail from "@/components/teams/TeamDetail";
import CreateTeamDialog from "@/components/teams/CreateTeamDialog";

export default function Teams() {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => db.auth.me(),
  });

  const isAdmin = user?.role === "admin";

  if (selectedTeam) {
    return (
      <TeamDetail
        team={selectedTeam}
        user={user}
        onBack={() => setSelectedTeam(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Village Teams</h1>
          </div>
          <p className="text-emerald-100 text-sm max-w-lg">
            Organized volunteer teams that collect Zakat, support needy families, and conduct village surveys.
          </p>
          {isAdmin && (
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="mt-5 bg-white text-emerald-700 hover:bg-emerald-50 font-semibold gap-2"
            >
              <Plus className="w-4 h-4" /> Create New Team
            </Button>
          )}
          {!isAdmin && (
            <div className="mt-4 flex items-center gap-2 text-emerald-200 text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Teams are created by village admins</span>
            </div>
          )}
        </div>
      </div>

      {/* Teams Grid */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <TeamsList onSelect={setSelectedTeam} user={user} />
      </div>

      <CreateTeamDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        user={user}
      />
    </div>
  );
}