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
import { Sparkles, Plus, Loader2, Edit, Trash2, Upload, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const EMPTY_FORM = { title:'', description:'', media_url:'', media_type:'image', target_amount:'', start_date:'', end_date:'', is_active:true };

export default function AdminCampaignsPanel() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['admin-campaigns'],
    queryFn: () => db.entities.Campaign.list('-created_date'),
  });

  const genId = () => `C64-${Math.floor(1000 + Math.random() * 9000)}`;

  const createMutation = useMutation({
    mutationFn: (d) => db.entities.Campaign.create({ ...d, campaign_id: genId(), collected_amount: 0 }),
    onSuccess: () => { qc.invalidateQueries(['admin-campaigns']); setShowCreate(false); setForm(EMPTY_FORM); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.Campaign.update(id, data),
    onSuccess: () => { qc.invalidateQueries(['admin-campaigns']); setEditing(null); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.Campaign.delete(id),
    onSuccess: () => qc.invalidateQueries(['admin-campaigns']),
  });

  const handleUpload = async (e, target, setter) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    setter({ ...target, media_url: file_url, media_type: file.type.startsWith('image/') ? 'image' : 'video' });
    setUploading(false);
  };

  const filtered = campaigns.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.campaign_id?.toLowerCase().includes(search.toLowerCase())
  );

  const totalTarget = campaigns.reduce((s, c) => s + (c.target_amount || 0), 0);
  const totalCollected = campaigns.reduce((s, c) => s + (c.collected_amount || 0), 0);

  const CampaignForm = ({ data, onChange, onSubmit, onCancel, submitLabel, isPending, idPrefix }) => (
    <div className="space-y-4 py-2">
      <div><Label>Title *</Label><Input className="mt-1" value={data.title} onChange={e => onChange({...data, title: e.target.value})} placeholder="Campaign title" /></div>
      <div><Label>Description *</Label><Textarea className="mt-1 min-h-[80px]" value={data.description} onChange={e => onChange({...data, description: e.target.value})} placeholder="Description" /></div>
      <div>
        <Label>Media</Label>
        <input type="file" accept="image/*,video/*" onChange={e => handleUpload(e, data, onChange)} className="hidden" id={`upload-${idPrefix}`} />
        <label htmlFor={`upload-${idPrefix}`}>
          <Button type="button" variant="outline" className="w-full mt-1" disabled={uploading} asChild>
            <span className="cursor-pointer">{uploading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Uploading...</> : <><Upload className="w-4 h-4 mr-2" />{data.media_url ? 'Change Media' : 'Upload Media'}</>}</span>
          </Button>
        </label>
        {data.media_url && data.media_type === 'image' && <img src={data.media_url} alt="Preview" className="w-full h-28 object-cover rounded mt-2" />}
      </div>
      <div><Label>Target Amount (PKR) *</Label><Input type="number" className="mt-1" value={data.target_amount} onChange={e => onChange({...data, target_amount: e.target.value})} placeholder="100000" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Start Date *</Label><Input type="date" className="mt-1" value={data.start_date} onChange={e => onChange({...data, start_date: e.target.value})} /></div>
        <div><Label>End Date *</Label><Input type="date" className="mt-1" value={data.end_date} onChange={e => onChange({...data, end_date: e.target.value})} /></div>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id={`active-${idPrefix}`} checked={data.is_active} onCheckedChange={v => onChange({...data, is_active: v})} />
        <label htmlFor={`active-${idPrefix}`} className="text-sm text-gray-700 cursor-pointer">Active</label>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={onSubmit} disabled={!data.title || !data.description || !data.target_amount || !data.start_date || !data.end_date || isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}{submitLabel}
        </Button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-500 text-sm mt-1">{campaigns.length} total</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> New Campaign
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="p-4 bg-pink-50 border-0"><p className="text-xs text-pink-600 mb-1">Total Campaigns</p><p className="text-2xl font-bold text-pink-700">{campaigns.length}</p></Card>
        <Card className="p-4 bg-blue-50 border-0"><p className="text-xs text-blue-600 mb-1">Target</p><p className="text-xl font-bold text-blue-700">PKR {totalTarget.toLocaleString()}</p></Card>
        <Card className="p-4 bg-green-50 border-0"><p className="text-xs text-green-600 mb-1">Collected</p><p className="text-xl font-bold text-green-700">PKR {totalCollected.toLocaleString()}</p></Card>
      </div>

      <Card className="bg-white p-4 border border-gray-200 rounded-xl mb-4">
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input placeholder="Search campaigns..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 border-gray-200" /></div>
      </Card>

      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div> : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(c => (
            <Card key={c.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {c.media_url && c.media_type === 'image' && <img src={c.media_url} alt={c.title} className="w-full h-36 object-cover" />}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{c.campaign_id}</span>
                  <Badge className={`${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'} border-0 text-xs`}>{c.is_active ? 'Active' : 'Inactive'}</Badge>
                </div>
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{c.title}</h3>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${Math.min(100, ((c.collected_amount||0)/(c.target_amount||1))*100)}%` }} />
                </div>
                <p className="text-xs text-gray-500 mb-3">PKR {(c.collected_amount||0).toLocaleString()} / {(c.target_amount||0).toLocaleString()} target</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 text-blue-600 hover:bg-blue-50" onClick={() => setEditing({...c})}>
                    <Edit className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => { if(confirm('Delete?')) deleteMutation.mutate(c.id); }}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Create Campaign</DialogTitle></DialogHeader>
          <CampaignForm data={form} onChange={setForm} onSubmit={() => createMutation.mutate(form)} onCancel={() => setShowCreate(false)} submitLabel="Create" isPending={createMutation.isPending} idPrefix="create" />
        </DialogContent>
      </Dialog>

      {editing && (
        <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Edit Campaign</DialogTitle></DialogHeader>
            <CampaignForm data={editing} onChange={setEditing} onSubmit={() => updateMutation.mutate({ id: editing.id, data: editing })} onCancel={() => setEditing(null)} submitLabel="Save Changes" isPending={updateMutation.isPending} idPrefix="edit" />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}