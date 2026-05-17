const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Radio, Eye, Plus, Loader2, ArrowLeft, Edit, Trash2, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function Live() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingBroadcast, setEditingBroadcast] = useState(null);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    description: '',
    stream_url: '',
    thumbnail_url: '',
  });

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => db.auth.me(),
  });

  const { data: broadcasts = [], isLoading } = useQuery({
    queryKey: ['broadcasts'],
    queryFn: () => db.entities.LiveBroadcast.list('-created_date'),
  });

  const createBroadcastMutation = useMutation({
    mutationFn: (data) => db.entities.LiveBroadcast.create({
      ...data,
      broadcaster_name: user.full_name,
      broadcaster_email: user.email,
      is_live: true,
      viewers_count: 0,
      start_time: new Date().toISOString(),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['broadcasts']);
      setShowCreateDialog(false);
      resetForm();
    },
  });

  const updateBroadcastMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.LiveBroadcast.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['broadcasts']);
      setEditingBroadcast(null);
    },
  });

  const deleteBroadcastMutation = useMutation({
    mutationFn: (id) => db.entities.LiveBroadcast.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['broadcasts']),
  });

  const endBroadcastMutation = useMutation({
    mutationFn: (id) => db.entities.LiveBroadcast.update(id, {
      is_live: false,
      end_time: new Date().toISOString(),
    }),
    onSuccess: () => queryClient.invalidateQueries(['broadcasts']),
  });

  const resetForm = () => {
    setBroadcastForm({
      title: '',
      description: '',
      stream_url: '',
      thumbnail_url: '',
    });
  };

  const liveBroadcasts = broadcasts.filter(b => b.is_live);
  const endedBroadcasts = broadcasts.filter(b => !b.is_live);

  return (
    <div className="min-h-screen py-4 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 p-6 shadow-sm border-0 rounded-xl mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Radio className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Live Broadcasts</h1>
                <p className="text-white/90">Watch live streams from My64 village</p>
              </div>
            </div>
            {user?.role === 'admin' && (
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-white text-red-600 hover:bg-gray-100 rounded-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Go Live
              </Button>
            )}
          </div>
        </Card>

        {/* Live Now Section */}
        {liveBroadcasts.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              Live Now
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveBroadcasts.map((broadcast) => (
                <BroadcastCard
                  key={broadcast.id}
                  broadcast={broadcast}
                  isAdmin={user?.role === 'admin'}
                  onEdit={setEditingBroadcast}
                  onDelete={() => deleteBroadcastMutation.mutate(broadcast.id)}
                  onEnd={() => endBroadcastMutation.mutate(broadcast.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Previous Broadcasts */}
        {endedBroadcasts.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Previous Broadcasts</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {endedBroadcasts.map((broadcast) => (
                <BroadcastCard
                  key={broadcast.id}
                  broadcast={broadcast}
                  isAdmin={user?.role === 'admin'}
                  onEdit={setEditingBroadcast}
                  onDelete={() => deleteBroadcastMutation.mutate(broadcast.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {broadcasts.length === 0 && !isLoading && (
          <Card className="bg-white p-12 text-center shadow-sm border border-gray-200 rounded-xl">
            <Radio className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No broadcasts available</p>
            {user?.role === 'admin' && (
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white"
              >
                Start First Broadcast
              </Button>
            )}
          </Card>
        )}

        {/* Create Broadcast Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="bg-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Start Live Broadcast</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Broadcast Title *</Label>
                <Input
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({...broadcastForm, title: e.target.value})}
                  placeholder="e.g., Village Meeting 2024"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={broadcastForm.description}
                  onChange={(e) => setBroadcastForm({...broadcastForm, description: e.target.value})}
                  placeholder="What's this broadcast about?"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Stream URL/Embed Code *</Label>
                <Textarea
                  value={broadcastForm.stream_url}
                  onChange={(e) => setBroadcastForm({...broadcastForm, stream_url: e.target.value})}
                  placeholder="YouTube embed URL or other streaming platform URL"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Example: https://www.youtube.com/embed/YOUR_VIDEO_ID
                </p>
              </div>
              <div>
                <Label>Thumbnail URL (Optional)</Label>
                <Input
                  value={broadcastForm.thumbnail_url}
                  onChange={(e) => setBroadcastForm({...broadcastForm, thumbnail_url: e.target.value})}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => createBroadcastMutation.mutate(broadcastForm)}
                disabled={!broadcastForm.title || !broadcastForm.stream_url || createBroadcastMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {createBroadcastMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Starting...
                  </>
                ) : (
                  'Go Live'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        {editingBroadcast && (
          <Dialog open={!!editingBroadcast} onOpenChange={() => setEditingBroadcast(null)}>
            <DialogContent className="bg-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Broadcast</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={editingBroadcast.title}
                    onChange={(e) => setEditingBroadcast({...editingBroadcast, title: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={editingBroadcast.description || ''}
                    onChange={(e) => setEditingBroadcast({...editingBroadcast, description: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingBroadcast(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    updateBroadcastMutation.mutate({
                      id: editingBroadcast.id,
                      data: {
                        title: editingBroadcast.title,
                        description: editingBroadcast.description,
                      }
                    });
                  }}
                  disabled={updateBroadcastMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

function BroadcastCard({ broadcast, isAdmin, onEdit, onDelete, onEnd }) {
  const [showPlayer, setShowPlayer] = useState(false);

  return (
    <>
      <Card className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all">
        <div className="relative h-48 bg-gradient-to-br from-red-500 to-purple-500">
          {broadcast.thumbnail_url ? (
            <img src={broadcast.thumbnail_url} alt={broadcast.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Radio className="w-16 h-16 text-white/50" />
            </div>
          )}
          {broadcast.is_live && (
            <div className="absolute top-3 left-3 bg-red-600 px-3 py-1 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white text-sm font-bold">LIVE</span>
            </div>
          )}
          <div className="absolute bottom-3 right-3 bg-black/70 px-2 py-1 rounded flex items-center gap-1">
            <Users className="w-4 h-4 text-white" />
            <span className="text-white text-sm">{broadcast.viewers_count || 0}</span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-gray-900 mb-2">{broadcast.title}</h3>
          {broadcast.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{broadcast.description}</p>
          )}
          
          <div className="text-xs text-gray-500 mb-3">
            By {broadcast.broadcaster_name} • {new Date(broadcast.start_time).toLocaleString()}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setShowPlayer(true)}
              className={`flex-1 ${
                broadcast.is_live
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white rounded-lg`}
            >
              <Eye className="w-4 h-4 mr-2" />
              {broadcast.is_live ? 'Watch Live' : 'Watch'}
            </Button>
            {isAdmin && (
              <>
                {broadcast.is_live && (
                  <Button
                    onClick={onEnd}
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                  >
                    End
                  </Button>
                )}
                <Button
                  onClick={() => onEdit(broadcast)}
                  variant="outline"
                  size="sm"
                  className="text-blue-600 hover:bg-blue-50"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => {
                    if (confirm('Delete this broadcast?')) {
                      onDelete();
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Video Player Modal */}
      {showPlayer && (
        <Dialog open={showPlayer} onOpenChange={setShowPlayer}>
          <DialogContent className="bg-white max-w-5xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {broadcast.is_live && (
                  <span className="flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded text-sm">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    LIVE
                  </span>
                )}
                {broadcast.title}
              </DialogTitle>
            </DialogHeader>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                src={broadcast.stream_url}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
            {broadcast.description && (
              <p className="text-gray-600 text-sm">{broadcast.description}</p>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}