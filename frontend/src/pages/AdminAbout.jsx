const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Plus, Loader2, ArrowLeft, Edit, Trash2, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdminAbout() {
  const [editingSection, setEditingSection] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newSection, setNewSection] = useState({ section_key: '', title: '', content: '', order: 0 });

  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => db.auth.me(),
  });

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ['aboutSections'],
    queryFn: () => db.entities.AboutSection.list('order'),
    enabled: currentUser?.role === 'admin',
  });

  const createSectionMutation = useMutation({
    mutationFn: (data) => db.entities.AboutSection.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['aboutSections']);
      setIsCreating(false);
      setNewSection({ section_key: '', title: '', content: '', order: 0 });
    },
  });

  const updateSectionMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.AboutSection.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['aboutSections']);
      setEditingSection(null);
    },
  });

  const deleteSectionMutation = useMutation({
    mutationFn: (id) => db.entities.AboutSection.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['aboutSections']),
  });

  if (currentUser?.role !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p>Access Denied</p></div>;
  }

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
              <h1 className="text-2xl font-bold text-gray-900">About Section Management</h1>
              <p className="text-gray-600 text-sm">Manage the about page content</p>
            </div>
          </div>
          <Button
            onClick={() => setIsCreating(!isCreating)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </Button>
        </div>

        {/* Create New Section */}
        {isCreating && (
          <Card className="bg-white p-6 shadow-sm border border-gray-200 rounded-xl mb-4">
            <h3 className="font-bold text-gray-900 mb-4">New Section</h3>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Section Key (e.g., 'mission', 'vision')"
                  value={newSection.section_key}
                  onChange={(e) => setNewSection({...newSection, section_key: e.target.value})}
                />
              </div>
              <div>
                <Input
                  placeholder="Section Title"
                  value={newSection.title}
                  onChange={(e) => setNewSection({...newSection, title: e.target.value})}
                />
              </div>
              <div>
                <Textarea
                  placeholder="Section Content"
                  value={newSection.content}
                  onChange={(e) => setNewSection({...newSection, content: e.target.value})}
                  className="min-h-[150px]"
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Display Order"
                  value={newSection.order}
                  onChange={(e) => setNewSection({...newSection, order: parseInt(e.target.value)})}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => createSectionMutation.mutate(newSection)}
                  disabled={!newSection.section_key || !newSection.title || !newSection.content || createSectionMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {createSectionMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Section
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Sections List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : sections.length === 0 ? (
            <Card className="bg-white p-12 text-center shadow-sm border border-gray-200 rounded-xl">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No sections created yet</p>
            </Card>
          ) : (
            sections.map((section) => (
              <Card key={section.id} className="bg-white p-6 shadow-sm border border-gray-200 rounded-xl">
                {editingSection?.id === section.id ? (
                  <div className="space-y-4">
                    <div>
                      <Input
                        value={editingSection.section_key}
                        onChange={(e) => setEditingSection({...editingSection, section_key: e.target.value})}
                        placeholder="Section Key"
                      />
                    </div>
                    <div>
                      <Input
                        value={editingSection.title}
                        onChange={(e) => setEditingSection({...editingSection, title: e.target.value})}
                        placeholder="Title"
                      />
                    </div>
                    <div>
                      <Textarea
                        value={editingSection.content}
                        onChange={(e) => setEditingSection({...editingSection, content: e.target.value})}
                        className="min-h-[150px]"
                        placeholder="Content"
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        value={editingSection.order}
                        onChange={(e) => setEditingSection({...editingSection, order: parseInt(e.target.value)})}
                        placeholder="Order"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setEditingSection(null)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          updateSectionMutation.mutate({
                            id: editingSection.id,
                            data: {
                              section_key: editingSection.section_key,
                              title: editingSection.title,
                              content: editingSection.content,
                              order: editingSection.order,
                            }
                          });
                        }}
                        disabled={updateSectionMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {updateSectionMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-gray-900 text-lg">{section.title}</h3>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {section.section_key}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Order: {section.order}
                        </span>
                      </div>
                      <p className="text-gray-600 whitespace-pre-wrap">{section.content}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingSection(section)}
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this section?')) {
                            deleteSectionMutation.mutate(section.id);
                          }
                        }}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}