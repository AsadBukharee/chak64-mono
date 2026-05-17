const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Plus, Loader2, ArrowLeft, Edit, Trash2, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminCampaigns() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    description: '',
    media_url: '',
    media_type: 'image',
    target_amount: '',
    start_date: '',
    end_date: '',
    is_active: true,
  });

  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => db.auth.me(),
  });

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['adminCampaigns'],
    queryFn: () => db.entities.Campaign.list('-created_date'),
    enabled: currentUser?.role === 'admin',
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      setCampaignForm({
        ...campaignForm,
        media_url: file_url,
        media_type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document'
      });
    } catch (error) {
      console.error("Error uploading file:", error);
    }
    setIsUploading(false);
  };

  const generateCampaignId = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `C64-${num}`;
  };

  const createCampaignMutation = useMutation({
    mutationFn: (data) => db.entities.Campaign.create({
      ...data,
      campaign_id: generateCampaignId(),
      collected_amount: 0,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminCampaigns']);
      setShowCreateDialog(false);
      resetForm();
    },
  });

  const updateCampaignMutation = useMutation({
    mutationFn: ({ campaignId, data }) => db.entities.Campaign.update(campaignId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminCampaigns']);
      setEditingCampaign(null);
    },
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: (campaignId) => db.entities.Campaign.delete(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminCampaigns']);
    },
  });

  const resetForm = () => {
    setCampaignForm({
      title: '',
      description: '',
      media_url: '',
      media_type: 'image',
      target_amount: '',
      start_date: '',
      end_date: '',
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
              <h1 className="text-2xl font-bold text-gray-900">Campaigns Management</h1>
              <p className="text-gray-600 text-sm">{campaigns.length} total campaigns</p>
            </div>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </div>

        {/* Campaigns Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : campaigns.length === 0 ? (
            <Card className="col-span-full bg-white p-12 text-center shadow-sm border border-gray-200 rounded-xl">
              <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No campaigns created yet</p>
            </Card>
          ) : (
            campaigns.map((campaign) => (
              <Card key={campaign.id} className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                {campaign.media_url && (
                  <div className="h-40 bg-gray-100">
                    {campaign.media_type === 'image' && (
                      <img src={campaign.media_url} alt={campaign.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded">
                      {campaign.campaign_id}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      campaign.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {campaign.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{campaign.title}</h3>
                  <div className="text-sm text-gray-600 mb-3">
                    <div className="flex justify-between">
                      <span>Collected:</span>
                      <span className="font-semibold">${campaign.collected_amount?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Target:</span>
                      <span className="font-semibold">${campaign.target_amount?.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingCampaign(campaign)}
                      className="flex-1 text-blue-600 hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this campaign?')) {
                          deleteCampaignMutation.mutate(campaign.id);
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

        {/* Create Campaign Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={campaignForm.title}
                  onChange={(e) => setCampaignForm({...campaignForm, title: e.target.value})}
                  placeholder="Campaign title"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Description *</Label>
                <Textarea
                  value={campaignForm.description}
                  onChange={(e) => setCampaignForm({...campaignForm, description: e.target.value})}
                  placeholder="Campaign description"
                  className="mt-1 min-h-[100px]"
                />
              </div>
              <div>
                <Label>Media</Label>
                <input
                  type="file"
                  accept="image/*,video/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="media-upload-create"
                />
                <label htmlFor="media-upload-create">
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
                          {campaignForm.media_url ? 'Change Media' : 'Upload Media'}
                        </>
                      )}
                    </span>
                  </Button>
                </label>
                {campaignForm.media_url && (
                  <div className="mt-2">
                    {campaignForm.media_type === 'image' && (
                      <img src={campaignForm.media_url} alt="Preview" className="w-full h-32 object-cover rounded" />
                    )}
                  </div>
                )}
              </div>
              <div>
                <Label>Target Amount ($) *</Label>
                <Input
                  type="number"
                  value={campaignForm.target_amount}
                  onChange={(e) => setCampaignForm({...campaignForm, target_amount: e.target.value})}
                  placeholder="10000"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={campaignForm.start_date}
                    onChange={(e) => setCampaignForm({...campaignForm, start_date: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>End Date *</Label>
                  <Input
                    type="date"
                    value={campaignForm.end_date}
                    onChange={(e) => setCampaignForm({...campaignForm, end_date: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active-create"
                  checked={campaignForm.is_active}
                  onCheckedChange={(checked) => setCampaignForm({...campaignForm, is_active: checked})}
                />
                <label htmlFor="active-create" className="text-sm text-gray-700 cursor-pointer">
                  Campaign is active
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => createCampaignMutation.mutate(campaignForm)}
                disabled={!campaignForm.title || !campaignForm.description || !campaignForm.target_amount || !campaignForm.start_date || !campaignForm.end_date || createCampaignMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {createCampaignMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Campaign'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Campaign Dialog */}
        {editingCampaign && (
          <Dialog open={!!editingCampaign} onOpenChange={() => setEditingCampaign(null)}>
            <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Campaign</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={editingCampaign.title}
                    onChange={(e) => setEditingCampaign({...editingCampaign, title: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={editingCampaign.description}
                    onChange={(e) => setEditingCampaign({...editingCampaign, description: e.target.value})}
                    className="mt-1 min-h-[100px]"
                  />
                </div>
                <div>
                  <Label>Target Amount ($)</Label>
                  <Input
                    type="number"
                    value={editingCampaign.target_amount}
                    onChange={(e) => setEditingCampaign({...editingCampaign, target_amount: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={editingCampaign.start_date}
                      onChange={(e) => setEditingCampaign({...editingCampaign, start_date: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={editingCampaign.end_date}
                      onChange={(e) => setEditingCampaign({...editingCampaign, end_date: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="active-edit"
                    checked={editingCampaign.is_active}
                    onCheckedChange={(checked) => setEditingCampaign({...editingCampaign, is_active: checked})}
                  />
                  <label htmlFor="active-edit" className="text-sm text-gray-700 cursor-pointer">
                    Campaign is active
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingCampaign(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    updateCampaignMutation.mutate({
                      campaignId: editingCampaign.id,
                      data: {
                        title: editingCampaign.title,
                        description: editingCampaign.description,
                        target_amount: editingCampaign.target_amount,
                        start_date: editingCampaign.start_date,
                        end_date: editingCampaign.end_date,
                        is_active: editingCampaign.is_active,
                      }
                    });
                  }}
                  disabled={updateCampaignMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {updateCampaignMutation.isPending ? (
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