const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, HandHeart, Trash2, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { format } from "date-fns";

const STATUS_COLORS = {
  collected: "bg-blue-100 text-blue-700",
  pending: "bg-yellow-100 text-yellow-700",
  distributed: "bg-green-100 text-green-700",
};

export default function ZakatTab({ team, user, isAdmin }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ donor_name: "", donor_address: "", amount: "", notes: "", status: "collected" });

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["zakat", team.id],
    queryFn: () => db.entities.ZakatCollection.filter({ team_id: team.id }, "-created_date"),
  });

  const total = records.reduce((sum, r) => sum + (r.amount || 0), 0);

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.ZakatCollection.create(data),
    onSuccess: () => { qc.invalidateQueries(["zakat", team.id]); setOpen(false); setForm({ donor_name: "", donor_address: "", amount: "", notes: "", status: "collected" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.ZakatCollection.delete(id),
    onSuccess: () => qc.invalidateQueries(["zakat", team.id]),
  });

  const handleSubmit = () => {
    if (!form.donor_name || !form.amount) return;
    createMutation.mutate({
      ...form,
      team_id: team.id,
      amount: parseFloat(form.amount),
      collector_name: user?.full_name || user?.email,
      collector_email: user?.email,
      collection_date: new Date().toISOString().split("T")[0],
    });
  };

  return (
    <div>
      {/* Summary */}
      <Card className="p-5 mb-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-700 font-medium">Total Zakat Collected</p>
            <p className="text-3xl font-bold text-green-800 mt-1">PKR {total.toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-1">{records.length} entries</p>
          </div>
          <TrendingUp className="w-12 h-12 text-green-300" />
        </div>
      </Card>

      <Button onClick={() => setOpen(true)} className="mb-4 bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
        <Plus className="w-4 h-4" /> Add Zakat Entry
      </Button>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : records.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <HandHeart className="w-10 h-10 mx-auto mb-2" />
          <p>No zakat entries yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((r) => (
            <Card key={r.id} className="p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">{r.donor_name}</p>
                  <p className="text-xs text-gray-500">{r.donor_address}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-bold text-green-700">PKR {r.amount?.toLocaleString()}</span>
                    <Badge className={`text-xs border-0 ${STATUS_COLORS[r.status]}`}>{r.status}</Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">By {r.collector_name} · {r.collection_date}</p>
                </div>
                {isAdmin && (
                  <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600" onClick={() => deleteMutation.mutate(r.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add Zakat Entry</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="mb-1 block">Donor Name *</Label>
              <Input value={form.donor_name} onChange={(e) => setForm({ ...form, donor_name: e.target.value })} placeholder="Full name" />
            </div>
            <div><Label className="mb-1 block">Address / House No</Label>
              <Input value={form.donor_address} onChange={(e) => setForm({ ...form, donor_address: e.target.value })} placeholder="House #, Street" />
            </div>
            <div><Label className="mb-1 block">Amount (PKR) *</Label>
              <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" />
            </div>
            <div><Label className="mb-1 block">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="collected">Collected</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="distributed">Distributed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="mb-1 block">Notes</Label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || !form.donor_name || !form.amount}
              className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}