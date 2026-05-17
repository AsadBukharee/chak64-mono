const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, Plus, Loader2, ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminSponsors() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [typeForm, setTypeForm] = useState({ name: '', description: '' });
  const [activeTab, setActiveTab] = useState('fund');

  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => db.auth.me(),
  });

  const { data: fundTypes = [] } = useQuery({
    queryKey: ['fundTypes'],
    queryFn: () => db.entities.FundType.list(),
    enabled: currentUser?.role === 'admin',
  });

  const { data: charityTypes = [] } = useQuery({
    queryKey: ['charityTypes'],
    queryFn: () => db.entities.CharityType.list(),
    enabled: currentUser?.role === 'admin',
  });

  const createFundTypeMutation = useMutation({
    mutationFn: (data) => db.entities.FundType.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['fundTypes']);
      setShowCreateDialog(false);
      setTypeForm({ name: '', description: '' });
    },
  });

  const createCharityTypeMutation = useMutation({
    mutationFn: (data) => db.entities.CharityType.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['charityTypes']);
      setShowCreateDialog(false);
      setTypeForm({ name: '', description: '' });
    },
  });

  const updateFundTypeMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.FundType.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['fundTypes']);
      setEditingType(null);
    },
  });

  const updateCharityTypeMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.CharityType.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['charityTypes']);
      setEditingType(null);
    },
  });

  const deleteFundTypeMutation = useMutation({
    mutationFn: (id) => db.entities.FundType.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['fundTypes']),
  });

  const deleteCharityTypeMutation = useMutation({
    mutationFn: (id) => db.entities.CharityType.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['charityTypes']),
  });

  if (currentUser?.role !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p>Access Denied</p></div>;
  }

  const currentTypes = activeTab === 'fund' ? fundTypes : charityTypes;

  return (
    <div className="min-h-screen py-6 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
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
              <h1 className="text-2xl font-bold text-gray-900">Sponsors Management</h1>
              <p className="text-gray-600 text-sm">Manage fund and charity types</p>
            </div>
          </div>
          <Button
            onClick={() => {
              setShowCreateDialog(true);
              setTypeForm({ name: '', description: '' });
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Type
          </Button>
        </div>

        {/* Tabs */}
        <Card className="bg-white p-1 shadow-sm border border-gray-200 rounded-xl mb-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('fund')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'fund'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Sponsor Fund Types ({fundTypes.length})
            </button>
            <button
              onClick={() => setActiveTab('charity')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'charity'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Charity Types ({charityTypes.length})
            </button>
          </div>
        </Card>

        {/* Types List */}
        <div className="space-y-3">
          {currentTypes.length === 0 ? (
            <Card className="bg-white p-12 text-center shadow-sm border border-gray-200 rounded-xl">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No types created yet</p>
            </Card>
          ) : (
            currentTypes.map((type) => (
              <Card key={type.id} className="bg-white p-4 shadow-sm border border-gray-200 rounded-xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{type.name}</h3>
                    <p className="text-gray-600 text-sm">{type.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingType({ ...type, tab: activeTab });
                      }}
                      className="text-blue-600 hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this type?')) {
                          if (activeTab === 'fund') {
                            deleteFundTypeMutation.mutate(type.id);
                          } else {
                            deleteCharityTypeMutation.mutate(type.id);
                          }
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

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>
                Add {activeTab === 'fund' ? 'Sponsor Fund' : 'Charity'} Type
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={typeForm.name}
                  onChange={(e) => setTypeForm({...typeForm, name: e.target.value})}
                  placeholder="Type name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={typeForm.description}
                  onChange={(e) => setTypeForm({...typeForm, description: e.target.value})}
                  placeholder="Type description"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (activeTab === 'fund') {
                    createFundTypeMutation.mutate(typeForm);
                  } else {
                    createCharityTypeMutation.mutate(typeForm);
                  }
                }}
                disabled={!typeForm.name || createFundTypeMutation.isPending || createCharityTypeMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add Type
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        {editingType && (
          <Dialog open={!!editingType} onOpenChange={() => setEditingType(null)}>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Edit Type</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={editingType.name}
                    onChange={(e) => setEditingType({...editingType, name: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={editingType.description || ''}
                    onChange={(e) => setEditingType({...editingType, description: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingType(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (editingType.tab === 'fund') {
                      updateFundTypeMutation.mutate({
                        id: editingType.id,
                        data: { name: editingType.name, description: editingType.description }
                      });
                    } else {
                      updateCharityTypeMutation.mutate({
                        id: editingType.id,
                        data: { name: editingType.name, description: editingType.description }
                      });
                    }
                  }}
                  disabled={updateFundTypeMutation.isPending || updateCharityTypeMutation.isPending}
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