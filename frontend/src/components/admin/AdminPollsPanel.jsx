const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Vote, Plus, Loader2, Edit, Trash2, X, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const EMPTY_FORM = { question: '', description: '', end_date: '', is_active: true, options: ['', ''] };

export default function AdminPollsPanel() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: polls = [], isLoading } = useQuery({
    queryKey: ['admin-polls'],
    queryFn: () => db.entities.Poll.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: async (d) => {
      const poll = await db.entities.Poll.create({ question: d.question, description: d.description, end_date: d.end_date, is_active: d.is_active, total_votes: 0 });
      for (const opt of d.options) { if (opt.trim()) await db.entities.PollOption.create({ poll_id: poll.id, option_text: opt, votes_count: 0 }); }
      return poll;
    },
    onSuccess: () => { qc.invalidateQueries(['admin-polls']); setShowCreate(false); setForm(EMPTY_FORM); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.Poll.update(id, data),
    onSuccess: () => { qc.invalidateQueries(['admin-polls']); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.Poll.delete(id),
    onSuccess: () => qc.invalidateQueries(['admin-polls']),
  });

  const addOption = () => setForm({ ...form, options: [...form.options, ''] });
  const removeOption = (i) => setForm({ ...form, options: form.options.filter((_, idx) => idx !== i) });
  const updateOption = (i, v) => { const o = [...form.options]; o[i] = v; setForm({ ...form, options: o }); };

  const filtered = polls.filter(p => p.question?.toLowerCase().includes(search.toLowerCase()));
  const active = polls.filter(p => p.is_active).length;
  const totalVotes = polls.reduce((s, p) => s + (p.total_votes || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Polls Management</h1>
          <p className="text-gray-500 text-sm mt-1">{polls.length} total polls</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Create Poll
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="p-4 bg-purple-50 border-0"><p className="text-xs text-purple-600 mb-1">Total Polls</p><p className="text-2xl font-bold text-purple-700">{polls.length}</p></Card>
        <Card className="p-4 bg-green-50 border-0"><p className="text-xs text-green-600 mb-1">Active</p><p className="text-2xl font-bold text-green-700">{active}</p></Card>
        <Card className="p-4 bg-blue-50 border-0"><p className="text-xs text-blue-600 mb-1">Total Votes</p><p className="text-2xl font-bold text-blue-700">{totalVotes}</p></Card>
      </div>

      <Card className="bg-white p-4 border border-gray-200 rounded-xl mb-4">
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input placeholder="Search polls..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 border-gray-200" /></div>
      </Card>

      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div> : (
        <div className="space-y-3">
          {filtered.map(poll => (
            <Card key={poll.id} className="bg-white p-5 border border-gray-200 rounded-xl">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-gray-900">{poll.question}</h3>
                    <Badge className={`${poll.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'} border-0 text-xs`}>
                      {poll.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {poll.description && <p className="text-sm text-gray-500 mb-2">{poll.description}</p>}
                  <div className="flex gap-4 text-sm text-gray-400">
                    <span>🗳️ {poll.total_votes || 0} votes</span>
                    {poll.end_date && <span>Ends: {new Date(poll.end_date).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setEditing({...poll})} className="text-blue-600 hover:bg-blue-50 h-8 w-8 p-0"><Edit className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => { if(confirm('Delete?')) deleteMutation.mutate(poll.id); }} className="text-red-500 hover:bg-red-50 h-8 w-8 p-0"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Create Poll</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Question *</Label><Input className="mt-1" value={form.question} onChange={e => setForm({...form, question: e.target.value})} placeholder="Poll question" /></div>
            <div><Label>Description</Label><Textarea className="mt-1" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
            <div><Label>End Date</Label><Input type="date" className="mt-1" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} /></div>
            <div className="flex items-center gap-2"><Checkbox id="poll-active" checked={form.is_active} onCheckedChange={v => setForm({...form, is_active: v})} /><label htmlFor="poll-active" className="text-sm cursor-pointer">Active</label></div>
            <div>
              <div className="flex items-center justify-between mb-2"><Label>Options *</Label><Button type="button" size="sm" variant="outline" onClick={addOption}><Plus className="w-3 h-3 mr-1" />Add</Button></div>
              <div className="space-y-2">
                {form.options.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={opt} onChange={e => updateOption(i, e.target.value)} placeholder={`Option ${i+1}`} />
                    {form.options.length > 2 && <Button type="button" size="sm" variant="ghost" onClick={() => removeOption(i)} className="text-red-500 h-9 w-9 p-0"><X className="w-4 h-4" /></Button>}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={() => createMutation.mutate(form)} disabled={!form.question || form.options.filter(o=>o.trim()).length < 2 || createMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editing && (
        <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Edit Poll</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div><Label>Question</Label><Input className="mt-1" value={editing.question} onChange={e => setEditing({...editing, question: e.target.value})} /></div>
              <div><Label>Description</Label><Textarea className="mt-1" value={editing.description||''} onChange={e => setEditing({...editing, description: e.target.value})} /></div>
              <div><Label>End Date</Label><Input type="date" className="mt-1" value={editing.end_date||''} onChange={e => setEditing({...editing, end_date: e.target.value})} /></div>
              <div className="flex items-center gap-2"><Checkbox id="edit-active" checked={editing.is_active} onCheckedChange={v => setEditing({...editing, is_active: v})} /><label htmlFor="edit-active" className="text-sm cursor-pointer">Active</label></div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                <Button onClick={() => updateMutation.mutate({ id: editing.id, data: editing })} disabled={updateMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}