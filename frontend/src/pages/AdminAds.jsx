const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Image as ImageIcon, Plus, Loader2, ArrowLeft, Edit, Trash2, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminAds() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [adForm, setAdForm] = useState({
    title: '',
    content: '',
    image_url: '',
    link_url: '',
    placement: 'feed',
    is_active: true,
  });

  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => db.auth.me(),
  });

  const { data: ads = [], isLoading } = useQuery({
    queryKey: ['adminAds'],
    queryFn: () => db.entities.Advertisement.list('-created_date'),
    enabled: currentUser?.role === 'admin',
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      setAdForm({...adForm, image_url: file_url});
    } catch (error) {
      console.error("Error uploading file:", error);
    }
    setIsUploading(false);
  };

  const createAdMutation = useMutation({
    mutationFn: (data) => db.entities.Advertisement.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminAds']);
      setShowCreateDialog(false);
      resetForm();
    },
  });

  const updateAdMutation = useMutation({
    mutationFn: ({ adId, data }) => db.entities.Advertisement.update(adId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminAds']);
      setEditingAd(null);
    },
  });

  const deleteAdMutation = useMutation({
    mutationFn: (adId) => db.entities.Advertisement.delete(adId),
    onSuccess: () => queryClient.invalidateQueries(['adminAds']),
  });

  const resetForm = () => {
    setAdForm({
      title: '',
      content: '',
      image_url: '',
      link_url: '',
      placement: 'feed',
      is_active: true,
    });
  };

  if (currentUser?.role !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p>Access Denied</p></div>;
  }

  return (
    <div className="min-h-screen py-6 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("AdminDashboard")}>
              <Button variant="ghost" className="text-gray-600 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Advertisements Management</h1>
              <p className="text-gray-600 text-sm">{ads.length} total ads</p>
            </div>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Ad
          </Button>
        </div>

        {/* Ads Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : ads.length === 0 ? (
            <Card className="col-span-full bg-white p-12 text-center shadow-sm border border-gray-200 rounded-xl">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No advertisements created yet</p>
            </Card>
          ) : (
            ads.map((ad) => (
              <Card key={ad.id} className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                {ad.image_url && (
                  <div className="h-40 bg-gray-100">
                    <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      ad.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {ad.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {ad.placement}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{ad.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ad.content}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingAd(ad)}
                      className="flex-1 text-blue-600 hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this ad?')) {
                          deleteAdMutation.mutate(ad.id);
                        }
                      }}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Create Ad Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="bg-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Advertisement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div>
                <Label>Title *</Label>
                <Input
                  value={adForm.title}
                  onChange={(e) => setAdForm({...adForm, title: e.target.value})}
                  placeholder="Ad title"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Content *</Label>
                <Textarea
                  value={adForm.content}
                  onChange={(e) => setAdForm({...adForm, content: e.target.value})}
                  placeholder="Ad description"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Image</Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="ad-image-upload"
                />
                <label htmlFor="ad-image-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-1"
                    disabled={isUploading}
                    asChild
                  >
                    <span className="cursor-pointer">
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          {adForm.image_url ? 'Change Image' : 'Upload Image'}
                        </>
                      )}
                    </span>
                  </Button>
                </label>
                {adForm.image_url && (
                  <img src={adForm.image_url} alt="Preview" className="w-full h-32 object-cover rounded mt-2" />
                )}
              </div>
              <div>
                <Label>Link URL</Label>
                <Input
                  value={adForm.link_url}
                  onChange={(e) => setAdForm({...adForm, link_url: e.target.value})}
                  placeholder="https://example.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Placement</Label>
                <Select value={adForm.placement} onValueChange={(value) => setAdForm({...adForm, placement: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feed">Feed</SelectItem>
                    <SelectItem value="sidebar">Sidebar</SelectItem>
                    <SelectItem value="banner">Banner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active-create"
                  checked={adForm.is_active}
                  onCheckedChange={(checked) => setAdForm({...adForm, is_active: checked})}
                />
                <label htmlFor="active-create" className="text-sm text-gray-700 cursor-pointer">
                  Advertisement is active
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => createAdMutation.mutate(adForm)}
                disabled={!adForm.title || !adForm.content || createAdMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {createAdMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Ad'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Ad Dialog */}
        {editingAd && (
          <Dialog open={!!editingAd} onOpenChange={() => setEditingAd(null)}>
            <DialogContent className="bg-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Advertisement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={editingAd.title}
                    onChange={(e) => setEditingAd({...editingAd, title: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Content</Label>
                  <Textarea
                    value={editingAd.content}
                    onChange={(e) => setEditingAd({...editingAd, content: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Link URL</Label>
                  <Input
                    value={editingAd.link_url || ''}
                    onChange={(e) => setEditingAd({...editingAd, link_url: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Placement</Label>
                  <Select value={editingAd.placement} onValueChange={(value) => setEditingAd({...editingAd, placement: value})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feed">Feed</SelectItem>
                      <SelectItem value="sidebar">Sidebar</SelectItem>
                      <SelectItem value="banner">Banner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="active-edit"
                    checked={editingAd.is_active}
                    onCheckedChange={(checked) => setEditingAd({...editingAd, is_active: checked})}
                  />
                  <label htmlFor="active-edit" className="text-sm text-gray-700 cursor-pointer">
                    Advertisement is active
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingAd(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    updateAdMutation.mutate({
                      adId: editingAd.id,
                      data: {
                        title: editingAd.title,
                        content: editingAd.content,
                        link_url: editingAd.link_url,
                        placement: editingAd.placement,
                        is_active: editingAd.is_active,
                      }
                    });
                  }}
                  disabled={updateAdMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {updateAdMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}