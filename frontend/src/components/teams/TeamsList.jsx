const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from "react";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ClipboardList, HandHeart, BarChart2, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const TYPE_META = {
  zakat_collection: { label: "Zakat Collection", icon: HandHeart, color: "bg-green-100 text-green-700" },
  needy_support: { label: "Needy Support", icon: Users, color: "bg-blue-100 text-blue-700" },
  survey: { label: "Survey", icon: ClipboardList, color: "bg-purple-100 text-purple-700" },
  general: { label: "General", icon: BarChart2, color: "bg-gray-100 text-gray-700" },
};

export default function TeamsList({ onSelect, user }) {
  const { data: teams = [], isLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: () => db.entities.Team.list("-created_date"),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="font-medium">No teams yet</p>
        <p className="text-sm">Village admin can create teams from this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {teams.map((team) => {
        const meta = TYPE_META[team.team_type] || TYPE_META.general;
        const Icon = meta.icon;
        return (
          <Card
            key={team.id}
            onClick={() => onSelect(team)}
            className="p-5 cursor-pointer hover:shadow-md transition-all border border-gray-200 bg-white rounded-xl group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${meta.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                    {team.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{team.description || "—"}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className={`text-xs ${meta.color} border-0`}>{meta.label}</Badge>
                    <Badge variant="outline" className={`text-xs ${team.status === "active" ? "text-green-700 border-green-300" : "text-gray-500"}`}>
                      {team.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}