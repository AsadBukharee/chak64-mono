const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useMemo } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Trash2, Flag, Eye, Loader2, MessageSquare, Heart, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const PAGE_SIZE = 10;

export default function AdminFeed() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [flagFilter, setFlagFilter] = useState("all"); // all | flagged | unflagged
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [viewPost, setViewPost] = useState(null);
  const [activeTab, setActiveTab] = useState("posts"); // posts | reports

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: () => db.entities.Post.list('-created_date', 500),
  });

  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => db.entities.Report.list('-created_date'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.Post.delete(id),
    onSuccess: () => qc.invalidateQueries(['admin-posts']),
  });

  const updateReportMutation = useMutation({
    mutationFn: ({ id, status }) => db.entities.Report.update(id, { status }),
    onSuccess: () => qc.invalidateQueries(['admin-reports']),
  });

  // Stats
  const totalLikes = posts.reduce((s, p) => s + (p.likes_count || 0), 0);
  const pendingReports = reports.filter(r => r.status === 'pending').length;
  const reportedPostIds = new Set(reports.filter(r => r.status === 'pending').map(r => r.post_id));

  // Filter & sort posts
  const filtered = useMemo(() => {
    let result = [...posts];
    if (search) result = result.filter(p =>
      p.author_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.content?.toLowerCase().includes(search.toLowerCase())
    );
    if (flagFilter === "flagged") result = result.filter(p => reportedPostIds.has(p.id));
    if (flagFilter === "unflagged") result = result.filter(p => !reportedPostIds.has(p.id));
    if (dateFrom) result = result.filter(p => new Date(p.created_date) >= new Date(dateFrom));
    if (dateTo) result = result.filter(p => new Date(p.created_date) <= new Date(dateTo + "T23:59:59"));
    if (sortBy === "newest") result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    if (sortBy === "oldest") result.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    if (sortBy === "most_likes") result.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
    return result;
  }, [posts, search, flagFilter, dateFrom, dateTo, sortBy, reportedPostIds]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Feed Management</h1>
        <p className="text-gray-500 text-sm mt-1">Manage posts and review reports</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Posts", value: posts.length, color: "bg-blue-50 text-blue-700", icon: MessageSquare },
          { label: "Total Likes", value: totalLikes, color: "bg-pink-50 text-pink-700", icon: Heart },
          { label: "Pending Reports", value: pendingReports, color: "bg-orange-50 text-orange-700", icon: Flag },
          { label: "Total Reports", value: reports.length, color: "bg-gray-50 text-gray-700", icon: AlertTriangle },
        ].map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className={`p-4 border-0 ${s.color}`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium">{s.label}</span>
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab("posts")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "posts" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
          Posts ({posts.length})
        </button>
        <button onClick={() => setActiveTab("reports")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${activeTab === "reports" ? "bg-orange-500 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>
          Reports ({reports.length})
          {pendingReports > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{pendingReports}</span>}
        </button>
      </div>

      {activeTab === "posts" && (
        <>
          {/* Filters */}
          <Card className="bg-white p-4 border border-gray-200 rounded-xl mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search posts or authors..." value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="pl-9 border-gray-200" />
              </div>
              <Select value={flagFilter} onValueChange={(v) => { setFlagFilter(v); setPage(1); }}>
                <SelectTrigger className="border-gray-200"><SelectValue placeholder="Flag status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Posts</SelectItem>
                  <SelectItem value="flagged">Flagged Only</SelectItem>
                  <SelectItem value="unflagged">Not Flagged</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="border-gray-200"><SelectValue placeholder="Sort by" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="most_likes">Most Likes</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <div>
                  <Label className="text-xs text-gray-500">From</Label>
                  <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="border-gray-200 text-sm h-9" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">To</Label>
                  <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="border-gray-200 text-sm h-9" />
                </div>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-gray-500">{filtered.length} posts found</span>
              {(search || flagFilter !== "all" || dateFrom || dateTo) && (
                <button onClick={() => { setSearch(""); setFlagFilter("all"); setDateFrom(""); setDateTo(""); setPage(1); }}
                  className="text-xs text-blue-600 hover:underline">Clear filters</button>
              )}
            </div>
          </Card>

          {/* Posts Table */}
          <Card className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {postsLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
            ) : paginated.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-2" />
                <p>No posts found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {paginated.map(post => (
                  <div key={post.id} className="p-4 flex items-start gap-3 hover:bg-gray-50">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {post.author_name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-sm text-gray-900">{post.author_name}</span>
                        <span className="text-xs text-gray-400">{new Date(post.created_date).toLocaleDateString()}</span>
                        {reportedPostIds.has(post.id) && (
                          <Badge className="bg-orange-100 text-orange-700 border-0 text-xs">
                            <Flag className="w-3 h-3 mr-1" /> Flagged
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 truncate">{post.content}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span>❤️ {post.likes_count || 0}</span>
                        <span>💬 {post.comments_count || 0}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => setViewPost(post)} className="text-blue-600 hover:bg-blue-50 h-8 w-8 p-0">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => { if (confirm("Delete this post?")) deleteMutation.mutate(post.id); }}
                        className="text-red-500 hover:bg-red-50 h-8 w-8 p-0">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </>
      )}

      {activeTab === "reports" && (
        <Card className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {reportsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Flag className="w-12 h-12 mx-auto mb-2" />
              <p>No reports yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {reports.map(report => (
                <div key={report.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-sm text-gray-900">{report.reporter_name}</span>
                        <Badge className={`border-0 text-xs ${
                          report.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                          report.status === 'reviewed' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>{report.status}</Badge>
                        <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded">{report.reason?.replace(/_/g, ' ')}</span>
                        <span className="text-xs text-gray-400">{new Date(report.created_date).toLocaleDateString()}</span>
                      </div>
                      {report.post_content_preview && (
                        <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded mt-1 line-clamp-2">
                          "{report.post_content_preview}"
                        </p>
                      )}
                      {report.notes && <p className="text-xs text-gray-600 mt-1">Note: {report.notes}</p>}
                    </div>
                    {report.status === 'pending' && (
                      <div className="flex gap-1 flex-shrink-0">
                        <Button size="sm" variant="ghost" onClick={() => updateReportMutation.mutate({ id: report.id, status: 'reviewed' })}
                          className="text-green-600 hover:bg-green-50 h-8 w-8 p-0" title="Mark reviewed">
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => updateReportMutation.mutate({ id: report.id, status: 'dismissed' })}
                          className="text-gray-500 hover:bg-gray-100 h-8 w-8 p-0" title="Dismiss">
                          <XCircle className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { if (confirm("Delete the reported post?")) deleteMutation.mutate(report.post_id); }}
                          className="text-red-500 hover:bg-red-50 h-8 w-8 p-0" title="Delete post">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* View Post Dialog */}
      <Dialog open={!!viewPost} onOpenChange={() => setViewPost(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Post Details</DialogTitle></DialogHeader>
          {viewPost && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {viewPost.author_name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm">{viewPost.author_name}</p>
                  <p className="text-xs text-gray-400">{viewPost.author_email} · {new Date(viewPost.created_date).toLocaleString()}</p>
                </div>
              </div>
              <p className="text-gray-800 bg-gray-50 rounded-lg p-3 text-sm whitespace-pre-wrap">{viewPost.content}</p>
              {viewPost.media_url && viewPost.media_type !== 'none' && (
                <img src={viewPost.media_url} alt="Post media" className="w-full rounded-lg max-h-64 object-cover" />
              )}
              <div className="flex gap-4 text-sm text-gray-500">
                <span>❤️ {viewPost.likes_count || 0} likes</span>
                <span>💬 {viewPost.comments_count || 0} comments</span>
              </div>
              <Button onClick={() => { if (confirm("Delete this post?")) { deleteMutation.mutate(viewPost.id); setViewPost(null); } }}
                className="w-full bg-red-600 hover:bg-red-700 text-white" size="sm">
                <Trash2 className="w-4 h-4 mr-2" /> Delete Post
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}