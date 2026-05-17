const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const TEAM_TYPES = [
  { value: "zakat_collection", label: "Zakat Collection" },
  { value: "needy_support", label: "Needy Person Support" },
  { value: "survey", label: "Village Survey" },
  { value: "general", label: "General Purpose" },
];

export default function CreateTeamDialog({ open, onClose, user }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", description: "", team_type: "general" });

  const mutation = useMutation({
    mutationFn: (data) => db.entities.Team.create(data),
    onSuccess: () => {
      qc.invalidateQueries(["teams"]);
      setForm({ name: "", description: "", team_type: "general" });
      onClose();
    },
  });

  const handleSubmit = () => {
    if (!form.name) return;
    mutation.mutate({ ...form, created_by_name: user?.full_name || user?.email, status: "active" });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">Create New Team</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="mb-1 block">Team Name *</Label>
            <Input
              placeholder="e.g. Helping Hands"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <Label className="mb-1 block">Description</Label>
            <Textarea
              placeholder="Describe the team's purpose..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>
          <div>
            <Label className="mb-1 block">Team Type *</Label>
            <Select value={form.team_type} onValueChange={(v) => setForm({ ...form, team_type: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEAM_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={!form.name || mutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Create Team
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}