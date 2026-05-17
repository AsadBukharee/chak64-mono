const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Users, Trash2, ToggleRight, ToggleLeft } from "lucide-react";

const TYPE_COLORS = {
  zakat_collection: "bg-green-100 text-green-700",
  needy_support: "bg-blue-100 text-blue-700",
  survey: "bg-purple-100 text-purple-700",
  general: "bg-gray-100 text-gray-700",
};

export default function AdminTeamsPanel() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['admin-teams'],
    queryFn: () => db.entities.Team.list('-created_date'),
  });

  const { data: members = [] } = useQuery({
    queryKey: ['admin-all-members'],
    queryFn: () => db.entities.TeamMember.list(),
  });

  const toggleMutation = useMutation({
    mutationFn: (team) => db.entities.Team.update(team.id, { status: team.status === 'active' ? 'inactive' : 'active' }),
    onSuccess: () => qc.invalidateQueries(['admin-teams']),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.Team.delete(id),
    onSuccess: () => qc.invalidateQueries(['admin-teams']),
  });

  const filtered = teams.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.team_type?.toLowerCase().includes(search.toLowerCase())
  );

  const getMemberCount = (teamId) => members.filter(m => m.team_id === teamId).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Teams Management</h1>
        <p className="text-gray-500 text-sm mt-1">{teams.length} total teams</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {['zakat_collection','needy_support','survey','general'].map(type => (
          <Card key={type} className="p-4 bg-white border border-gray-200">
            <p className="text-xs text-gray-500 mb-1 capitalize">{type.replace(/_/g,' ')}</p>
            <p className="text-2xl font-bold text-gray-900">{teams.filter(t => t.team_type === type).length}</p>
          </Card>
        ))}
      </div>

      {/* Search */}
      <Card className="bg-white p-4 border border-gray-200 rounded-xl mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search teams..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 border-gray-200" />
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(team => (
            <Card key={team.id} className="bg-white p-4 border border-gray-200 rounded-xl">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 text-sm">{team.name}</p>
                      <Badge className={`${TYPE_COLORS[team.team_type] || TYPE_COLORS.general} border-0 text-xs`}>
                        {team.team_type?.replace(/_/g,' ')}
                      </Badge>
                      <Badge className={`${team.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'} border-0 text-xs`}>
                        {team.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{team.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {getMemberCount(team.id)} members · Created by {team.created_by_name || 'Admin'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => toggleMutation.mutate(team)}
                    className={`${team.status === 'active' ? 'text-orange-500 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'} h-8 w-8 p-0`}>
                    {team.status === 'active' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { if (confirm('Delete team?')) deleteMutation.mutate(team.id); }}
                    className="text-red-500 hover:bg-red-50 h-8 w-8 p-0">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}