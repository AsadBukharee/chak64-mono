const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, ClipboardList, ChevronRight, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import SurveyResponseDialog from "./SurveyResponseDialog";

const STATUS_COLORS = {
  draft: "bg-gray-100 text-gray-600",
  active: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
};

const SURVEY_TYPES = [
  { value: "household", label: "Household" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "health", label: "Health" },
  { value: "education", label: "Education" },
  { value: "general", label: "General" },
];

export default function SurveyTab({ team, user, isAdmin }) {
  const qc = useQueryClient();
  const [openCreate, setOpenCreate] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", survey_type: "general" });

  const { data: surveys = [], isLoading } = useQuery({
    queryKey: ["surveys", team.id],
    queryFn: () => db.entities.Survey.filter({ team_id: team.id }, "-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.Survey.create(data),
    onSuccess: () => { qc.invalidateQueries(["surveys", team.id]); setOpenCreate(false); setForm({ title: "", description: "", survey_type: "general" }); },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => db.entities.Survey.update(id, { status }),
    onSuccess: () => qc.invalidateQueries(["surveys", team.id]),
  });

  const handleSubmit = () => {
    if (!form.title) return;
    createMutation.mutate({
      ...form,
      team_id: team.id,
      created_by: user?.email,
      created_by_name: user?.full_name || user?.email,
      status: "draft",
    });
  };

  if (selectedSurvey) {
    return <SurveyResponseDialog survey={selectedSurvey} team={team} user={user} isAdmin={isAdmin} onBack={() => setSelectedSurvey(null)} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-600">{surveys.length} survey(s)</span>
        {isAdmin && (
          <Button onClick={() => setOpenCreate(true)} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white gap-1">
            <Plus className="w-3 h-3" /> New Survey
          </Button>
        )}
      </div>

      {isLoading ? <p className="text-sm text-gray-500">Loading...</p> :
        surveys.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <ClipboardList className="w-10 h-10 mx-auto mb-2" />
            <p>No surveys created yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {surveys.map((s) => (
              <Card key={s.id} className="p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:shadow-sm transition-shadow group"
                onClick={() => setSelectedSurvey(s)}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 group-hover:text-purple-700">{s.title}</p>
                      <Badge className={`text-xs border-0 ${STATUS_COLORS[s.status]}`}>{s.status}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{s.description}</p>
                    <p className="text-xs text-gray-400 mt-1">Type: {s.survey_type} · By {s.created_by_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAdmin && s.status === "draft" && (
                      <Button variant="outline" size="sm" className="text-xs h-7"
                        onClick={(e) => { e.stopPropagation(); updateStatusMutation.mutate({ id: s.id, status: "active" }); }}>
                        Activate
                      </Button>
                    )}
                    {isAdmin && s.status === "active" && (
                      <Button variant="outline" size="sm" className="text-xs h-7"
                        onClick={(e) => { e.stopPropagation(); updateStatusMutation.mutate({ id: s.id, status: "completed" }); }}>
                        Complete
                      </Button>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Create Survey</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="mb-1 block">Survey Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Household Needs 2024" />
            </div>
            <div><Label className="mb-1 block">Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Purpose of this survey..." />
            </div>
            <div><Label className="mb-1 block">Type</Label>
              <Select value={form.survey_type} onValueChange={(v) => setForm({ ...form, survey_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SURVEY_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreate(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || !form.title}
              className="bg-purple-600 hover:bg-purple-700 text-white">
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}