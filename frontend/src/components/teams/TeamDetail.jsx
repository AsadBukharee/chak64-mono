const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, HandHeart, Users, ClipboardList, UserPlus, ToggleLeft, ToggleRight, Settings2, FileText } from "lucide-react";
import ZakatTab from "./ZakatTab";
import NeedyPersonsTab from "./NeedyPersonsTab";
import SurveyTab from "./SurveyTab";
import TeamMembersTab from "./TeamMembersTab";

const TYPE_META = {
  zakat_collection: { label: "Zakat Collection", color: "bg-green-100 text-green-700" },
  needy_support: { label: "Needy Support", color: "bg-blue-100 text-blue-700" },
  survey: { label: "Survey", color: "bg-purple-100 text-purple-700" },
  general: { label: "General", color: "bg-gray-100 text-gray-700" },
};

export default function TeamDetail({ team, user, onBack }) {
  const qc = useQueryClient();
  const isAdmin = user?.role === "admin";
  const meta = TYPE_META[team.team_type] || TYPE_META.general;
  const [activeTab, setActiveTab] = useState("zakat");
  const [mainTab, setMainTab] = useState("entries");

  const toggleStatusMutation = useMutation({
    mutationFn: () =>
      db.entities.Team.update(team.id, {
        status: team.status === "active" ? "inactive" : "active",
      }),
    onSuccess: () => qc.invalidateQueries(["teams"]),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <button onClick={onBack} className="flex items-center gap-2 text-emerald-100 hover:text-white mb-4 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Teams
          </button>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{team.name}</h1>
              <p className="text-emerald-100 text-sm mt-1">{team.description}</p>
              <div className="flex items-center gap-2 mt-3">
                <Badge className={`${meta.color} border-0 text-xs`}>{meta.label}</Badge>
                <Badge className={`${team.status === "active" ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-600"} border-0 text-xs`}>
                  {team.status}
                </Badge>
              </div>
              <p className="text-emerald-200 text-xs mt-2">Created by: {team.created_by_name || "Admin"}</p>
            </div>
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={() => toggleStatusMutation.mutate()}
              >
                {team.status === "active" ? (
                  <><ToggleRight className="w-4 h-4 mr-2" /> Deactivate</>
                ) : (
                  <><ToggleLeft className="w-4 h-4 mr-2" /> Activate</>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Two main tabs: Entries | Manage */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tab switcher */}
        <div className="flex bg-white border border-gray-200 rounded-xl p-1 mb-6 w-fit">
          <button
            onClick={() => { setMainTab("entries"); setActiveTab("zakat"); }}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              mainTab === "entries" ? "bg-emerald-600 text-white shadow" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <FileText className="w-4 h-4" /> Entries
          </button>
          <button
            onClick={() => { setMainTab("manage"); setActiveTab("members"); }}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              mainTab === "manage" ? "bg-emerald-600 text-white shadow" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Settings2 className="w-4 h-4" /> Manage Team
          </button>
        </div>

        {/* Entries sub-dropdown */}
        {mainTab === "entries" && (
          <>
            <div className="mb-5">
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className="w-full md:w-56 bg-white border border-gray-200 rounded-xl h-10 text-sm font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zakat">
                    <div className="flex items-center gap-2"><HandHeart className="w-4 h-4 text-green-600" /> Zakat Collection</div>
                  </SelectItem>
                  <SelectItem value="needy">
                    <div className="flex items-center gap-2"><Users className="w-4 h-4 text-blue-600" /> Needy Persons</div>
                  </SelectItem>
                  <SelectItem value="survey">
                    <div className="flex items-center gap-2"><ClipboardList className="w-4 h-4 text-purple-600" /> Survey</div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {activeTab === "zakat" && <ZakatTab team={team} user={user} isAdmin={isAdmin} />}
            {activeTab === "needy" && <NeedyPersonsTab team={team} user={user} isAdmin={isAdmin} />}
            {activeTab === "survey" && <SurveyTab team={team} user={user} isAdmin={isAdmin} />}
          </>
        )}

        {/* Manage tab — Members only for now, easily extendable */}
        {mainTab === "manage" && (
          <TeamMembersTab team={team} user={user} isAdmin={isAdmin} />
        )}
      </div>
    </div>
  );
}