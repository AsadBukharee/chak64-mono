const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useMemo } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, UserPlus, Trash2, Crown, User, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function TeamMembersTab({ team, user, isAdmin }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [role, setRole] = useState("member");

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["team-members", team.id],
    queryFn: () => db.entities.TeamMember.filter({ team_id: team.id }, "-created_date"),
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ["all-users"],
    queryFn: () => db.entities.User.list(),
    enabled: open,
  });

  // Filter users by name or @email prefix, exclude already-added members
  const existingEmails = useMemo(() => new Set(members.map((m) => m.member_email)), [members]);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return allUsers.filter((u) => !existingEmails.has(u.email));
    const q = search.toLowerCase().replace(/^@/, "");
    return allUsers.filter((u) => {
      const nameMatch = u.full_name?.toLowerCase().includes(q);
      const emailMatch = u.email?.toLowerCase().includes(q);
      return (nameMatch || emailMatch) && !existingEmails.has(u.email);
    });
  }, [search, allUsers, existingEmails]);

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.TeamMember.create(data),
    onSuccess: () => {
      qc.invalidateQueries(["team-members", team.id]);
      setOpen(false);
      setSelectedUser(null);
      setSearch("");
      setRole("member");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.TeamMember.delete(id),
    onSuccess: () => qc.invalidateQueries(["team-members", team.id]),
  });

  const handleSubmit = () => {
    if (!selectedUser) return;
    createMutation.mutate({
      team_id: team.id,
      member_name: selectedUser.full_name,
      member_email: selectedUser.email,
      role,
      joined_date: new Date().toISOString().split("T")[0],
    });
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
    setSearch("");
    setRole("member");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-600">{members.length} member(s)</span>
        {isAdmin && (
          <Button onClick={() => setOpen(true)} size="sm" className="bg-teal-600 hover:bg-teal-700 text-white gap-1">
            <UserPlus className="w-3 h-3" /> Add Member
          </Button>
        )}
      </div>

      {isLoading ? <p className="text-sm text-gray-500">Loading...</p> :
        members.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <UserPlus className="w-10 h-10 mx-auto mb-2" />
            <p>No members added yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((m) => (
              <Card key={m.id} className="p-4 bg-white border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm ${m.role === "leader" ? "bg-gradient-to-br from-amber-500 to-orange-600" : "bg-gradient-to-br from-teal-500 to-cyan-600"}`}>
                      {m.member_name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 text-sm">{m.member_name}</p>
                        <Badge className={`text-xs border-0 ${m.role === "leader" ? "bg-amber-100 text-amber-700" : "bg-teal-100 text-teal-700"}`}>
                          {m.role === "leader" ? <Crown className="w-3 h-3 mr-1 inline" /> : <User className="w-3 h-3 mr-1 inline" />}
                          {m.role}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400">{m.member_email}</p>
                      {m.joined_date && <p className="text-xs text-gray-400">Joined: {m.joined_date}</p>}
                    </div>
                  </div>
                  {isAdmin && (
                    <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 w-7 h-7"
                      onClick={() => deleteMutation.mutate(m.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add Team Member</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {/* Search box */}
            <div>
              <Label className="mb-1 block">Search Member</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                <Input
                  className="pl-8"
                  placeholder="Search by name or @email..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setSelectedUser(null); }}
                />
              </div>
            </div>

            {/* User list */}
            {search.trim() && !selectedUser && (
              <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No users found</p>
                ) : (
                  filteredUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => { setSelectedUser(u); setSearch(u.full_name); }}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {u.full_name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{u.full_name}</p>
                        <p className="text-xs text-gray-400">@{u.email}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Selected user chip */}
            {selectedUser && (
              <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-bold text-xs">
                  {selectedUser.full_name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-teal-800">{selectedUser.full_name}</p>
                  <p className="text-xs text-teal-600">@{selectedUser.email}</p>
                </div>
                <button onClick={() => { setSelectedUser(null); setSearch(""); }} className="text-teal-400 hover:text-teal-600 text-xs">✕</button>
              </div>
            )}

            {/* Role */}
            <div>
              <Label className="mb-1 block">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="leader">Team Leader</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || !selectedUser}
              className="bg-teal-600 hover:bg-teal-700 text-white">
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}