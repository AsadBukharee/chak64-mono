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
import { Plus, Loader2, Users, Trash2, Phone, MapPin, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const PRIORITY_COLORS = { high: "bg-red-100 text-red-700", medium: "bg-yellow-100 text-yellow-700", low: "bg-green-100 text-green-700" };
const STATUS_COLORS = { active: "bg-blue-100 text-blue-700", assisted: "bg-purple-100 text-purple-700", resolved: "bg-green-100 text-green-700" };
const NEED_LABELS = { food: "Food", medical: "Medical", education: "Education", financial: "Financial", housing: "Housing", other: "Other" };

const EMPTY = { full_name: "", address: "", contact_number: "", family_size: "", need_type: "food", monthly_income: "", description: "", priority: "medium" };

export default function NeedyPersonsTab({ team, user, isAdmin }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const { data: persons = [], isLoading } = useQuery({
    queryKey: ["needy", team.id],
    queryFn: () => db.entities.NeedyPerson.filter({ team_id: team.id }, "-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.NeedyPerson.create(data),
    onSuccess: () => { qc.invalidateQueries(["needy", team.id]); setOpen(false); setForm(EMPTY); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.NeedyPerson.delete(id),
    onSuccess: () => qc.invalidateQueries(["needy", team.id]),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => db.entities.NeedyPerson.update(id, { status }),
    onSuccess: () => qc.invalidateQueries(["needy", team.id]),
  });

  const handleSubmit = () => {
    if (!form.full_name || !form.need_type) return;
    createMutation.mutate({
      ...form,
      team_id: team.id,
      family_size: form.family_size ? parseInt(form.family_size) : undefined,
      monthly_income: form.monthly_income ? parseFloat(form.monthly_income) : undefined,
      added_by: user?.email,
      added_by_name: user?.full_name || user?.email,
      status: "active",
    });
  };

  const highCount = persons.filter((p) => p.priority === "high").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{persons.length} person(s) listed</span>
          {highCount > 0 && (
            <Badge className="bg-red-100 text-red-700 border-0 text-xs gap-1">
              <AlertCircle className="w-3 h-3" /> {highCount} High Priority
            </Badge>
          )}
        </div>
        <Button onClick={() => setOpen(true)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1">
          <Plus className="w-3 h-3" /> Add Person
        </Button>
      </div>

      {isLoading ? <p className="text-sm text-gray-500">Loading...</p> :
        persons.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-2" />
            <p>No needy persons added yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {persons.map((p) => (
              <Card key={p.id} className="p-4 bg-white border border-gray-200 rounded-xl">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900">{p.full_name}</p>
                      <Badge className={`text-xs border-0 ${PRIORITY_COLORS[p.priority]}`}>{p.priority} priority</Badge>
                      <Badge className={`text-xs border-0 ${STATUS_COLORS[p.status]}`}>{p.status}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                      {p.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.address}</span>}
                      {p.contact_number && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{p.contact_number}</span>}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-600">
                      <span>Need: <strong>{NEED_LABELS[p.need_type]}</strong></span>
                      {p.family_size && <span>· Family: <strong>{p.family_size}</strong></span>}
                      {p.monthly_income && <span>· Income: <strong>PKR {p.monthly_income}</strong></span>}
                    </div>
                    {p.description && <p className="text-xs text-gray-500 mt-1 italic">{p.description}</p>}
                    <p className="text-xs text-gray-400 mt-1">Added by {p.added_by_name}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-3">
                    {isAdmin && p.status !== "resolved" && (
                      <Button variant="outline" size="sm" className="text-xs h-7"
                        onClick={() => updateStatusMutation.mutate({ id: p.id, status: p.status === "active" ? "assisted" : "resolved" })}>
                        {p.status === "active" ? "Mark Assisted" : "Mark Resolved"}
                      </Button>
                    )}
                    {isAdmin && (
                      <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 w-7 h-7"
                        onClick={() => deleteMutation.mutate(p.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Needy Person</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="mb-1 block">Full Name *</Label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Full name" />
            </div>
            <div><Label className="mb-1 block">Address</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="House #, Street" />
            </div>
            <div><Label className="mb-1 block">Contact Number</Label>
              <Input value={form.contact_number} onChange={(e) => setForm({ ...form, contact_number: e.target.value })} placeholder="Phone" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="mb-1 block">Family Size</Label>
                <Input type="number" value={form.family_size} onChange={(e) => setForm({ ...form, family_size: e.target.value })} placeholder="0" />
              </div>
              <div><Label className="mb-1 block">Monthly Income</Label>
                <Input type="number" value={form.monthly_income} onChange={(e) => setForm({ ...form, monthly_income: e.target.value })} placeholder="PKR" />
              </div>
            </div>
            <div><Label className="mb-1 block">Type of Need *</Label>
              <Select value={form.need_type} onValueChange={(v) => setForm({ ...form, need_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(NEED_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label className="mb-1 block">Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="mb-1 block">Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe their situation..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || !form.full_name}
              className="bg-blue-600 hover:bg-blue-700 text-white">
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}