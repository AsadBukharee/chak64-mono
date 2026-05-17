const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useMemo } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Heart, Search, Loader2, Eye, EyeOff, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const PAGE_SIZE = 15;

export default function AdminDonationsPanel() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  const { data: donations = [], isLoading } = useQuery({
    queryKey: ['admin-donations'],
    queryFn: () => db.entities.Donation.list('-created_date', 1000),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_public }) => db.entities.Donation.update(id, { is_public: !is_public }),
    onSuccess: () => qc.invalidateQueries(['admin-donations']),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.Donation.delete(id),
    onSuccess: () => qc.invalidateQueries(['admin-donations']),
  });

  const filtered = useMemo(() => {
    let r = [...donations];
    if (search) r = r.filter(d => d.donor_name?.toLowerCase().includes(search.toLowerCase()) || d.donor_email?.toLowerCase().includes(search.toLowerCase()));
    if (typeFilter !== "all") r = r.filter(d => d.donation_type === typeFilter);
    if (dateFrom) r = r.filter(d => new Date(d.created_date) >= new Date(dateFrom));
    if (dateTo) r = r.filter(d => new Date(d.created_date) <= new Date(dateTo + "T23:59:59"));
    if (sortBy === "newest") r.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    if (sortBy === "oldest") r.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    if (sortBy === "highest") r.sort((a, b) => (b.amount || 0) - (a.amount || 0));
    if (sortBy === "lowest") r.sort((a, b) => (a.amount || 0) - (b.amount || 0));
    return r;
  }, [donations, search, typeFilter, dateFrom, dateTo, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  const totalAmount = donations.reduce((s, d) => s + (d.amount || 0), 0);
  const charityAmt = donations.filter(d => d.donation_type === 'charity').reduce((s, d) => s + (d.amount || 0), 0);
  const campaignAmt = donations.filter(d => d.donation_type === 'campaign').reduce((s, d) => s + (d.amount || 0), 0);
  const sponsorAmt = donations.filter(d => d.donation_type === 'sponsor_fund').reduce((s, d) => s + (d.amount || 0), 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Donations</h1>
        <p className="text-gray-500 text-sm mt-1">{donations.length} records · PKR {totalAmount.toLocaleString()} total</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", amount: totalAmount, color: "bg-gradient-to-br from-red-500 to-pink-500" },
          { label: "Charity", amount: charityAmt, color: "bg-gradient-to-br from-pink-500 to-purple-500" },
          { label: "Campaign", amount: campaignAmt, color: "bg-gradient-to-br from-blue-500 to-cyan-500" },
          { label: "Sponsor Fund", amount: sponsorAmt, color: "bg-gradient-to-br from-orange-500 to-yellow-500" },
        ].map(s => (
          <Card key={s.label} className={`${s.color} p-4 border-0 text-white`}>
            <p className="text-xs opacity-80 mb-1">{s.label}</p>
            <p className="text-lg font-bold">PKR {s.amount.toLocaleString()}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="bg-white p-4 border border-gray-200 rounded-xl mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search donor..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9 border-gray-200" />
          </div>
          <Select value={typeFilter} onValueChange={v => { setTypeFilter(v); setPage(1); }}>
            <SelectTrigger className="border-gray-200"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="charity">Charity</SelectItem>
              <SelectItem value="campaign">Campaign</SelectItem>
              <SelectItem value="sponsor_fund">Sponsor Fund</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="border-gray-200"><SelectValue placeholder="Sort" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="highest">Highest Amount</SelectItem>
              <SelectItem value="lowest">Lowest Amount</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <div><Label className="text-xs text-gray-500">From</Label><Input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} className="border-gray-200 text-xs h-9" /></div>
            <div><Label className="text-xs text-gray-500">To</Label><Input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} className="border-gray-200 text-xs h-9" /></div>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">{filtered.length} results</p>
      </Card>

      <Card className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div> : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Donor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map(d => (
                  <TableRow key={d.id}>
                    <TableCell>
                      <p className="font-medium text-sm text-gray-900">{d.is_public ? d.donor_name : 'Anonymous'}</p>
                      {d.is_public && <p className="text-xs text-gray-400">{d.donor_email}</p>}
                    </TableCell>
                    <TableCell className="font-bold text-green-600">PKR {(d.amount||0).toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        d.donation_type === 'charity' ? 'bg-red-100 text-red-700' :
                        d.donation_type === 'campaign' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>{d.donation_type?.replace('_', ' ')}</span>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">{d.charity_type || d.fund_type || d.campaign_id || '-'}</TableCell>
                    <TableCell className="text-xs text-gray-500">{new Date(d.created_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${d.is_public ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {d.is_public ? 'Public' : 'Private'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => toggleMutation.mutate({ id: d.id, is_public: d.is_public })} className="h-7 w-7 p-0 text-blue-500 hover:bg-blue-50">
                          {d.is_public ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { if(confirm('Delete?')) deleteMutation.mutate(d.id); }} className="h-7 w-7 p-0 text-red-500 hover:bg-red-50">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}><ChevronLeft className="w-4 h-4" /></Button>
              <Button size="sm" variant="outline" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}