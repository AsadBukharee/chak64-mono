const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Vote, Plus, Loader2, ArrowLeft, Edit, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function AdminPolls() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPoll, setEditingPoll] = useState(null);
  const [pollForm, setPollForm] = useState({
    question: '',
    description: '',
    end_date: '',
    is_active: true,
    options: ['', '']
  });

  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => db.auth.me(),
  });

  const { data: polls = [], isLoading } = useQuery({
    queryKey: ['adminPolls'],
    queryFn: () => db.entities.Poll.list('-created_date'),
    enabled: currentUser?.role === 'admin',
  });

  const createPollMutation = useMutation({
    mutationFn: async (pollData) => {
      const poll = await db.entities.Poll.create({
        question: pollData.question,
        description: pollData.description,
        end_date: pollData.end_date,
        is_active: pollData.is_active,
        total_votes: 0,
      });
      
      for (const optionText of pollData.options) {
        if (optionText.trim()) {
          await db.entities.PollOption.create({
            poll_id: poll.id,
            option_text: optionText,
            votes_count: 0,
          });
        }
      }
      
      return poll;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminPolls']);
      setShowCreateDialog(false);
      resetForm();
    },
  });

  const updatePollMutation = useMutation({
    mutationFn: ({ pollId, data }) => db.entities.Poll.update(pollId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminPolls']);
      setEditingPoll(null);
    },
  });

  const deletePollMutation = useMutation({
    mutationFn: (pollId) => db.entities.Poll.delete(pollId),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminPolls']);
    },
  });

  const resetForm = () => {
    setPollForm({
      question: '',
      description: '',
      end_date: '',
      is_active: true,
      options: ['', '']
    });
  };

  const addOption = () => {
    setPollForm({...pollForm, options: [...pollForm.options, '']});
  };

  const removeOption = (index) => {
    const newOptions = pollForm.options.filter((_, i) => i !== index);
    setPollForm({...pollForm, options: newOptions});
  };

  const updateOption = (index, value) => {
    const newOptions = [...pollForm.options];
    newOptions[index] = value;
    setPollForm({...pollForm, options: newOptions});
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
              <h1 className="text-2xl font-bold text-gray-900">Polls Management</h1>
              <p className="text-gray-600 text-sm">{polls.length} total polls</p>
            </div>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Poll
          </Button>
        </div>

        {/* Polls List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : polls.length === 0 ? (
            <Card className="bg-white p-12 text-center shadow-sm border border-gray-200 rounded-xl">
              <Vote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No polls created yet</p>
            </Card>
          ) : (
            polls.map((poll) => (
              <Card key={poll.id} className="bg-white p-6 shadow-sm border border-gray-200 rounded-xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{poll.question}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        poll.is_active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {poll.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {poll.description && (
                      <p className="text-gray-600 mb-2">{poll.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Total Votes: {poll.total_votes || 0}</span>
                      {poll.end_date && (
                        <span>Ends: {new Date(poll.end_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingPoll(poll)}
                      className="text-blue-600 hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this poll?')) {
                          deletePollMutation.mutate(poll.id);
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

        {/* Create Poll Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="bg-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Poll</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div>
                <Label>Question *</Label>
                <Input
                  value={pollForm.question}
                  onChange={(e) => setPollForm({...pollForm, question: e.target.value})}
                  placeholder="Enter poll question"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={pollForm.description}
                  onChange={(e) => setPollForm({...pollForm, description: e.target.value})}
                  placeholder="Enter poll description"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={pollForm.end_date}
                  onChange={(e) => setPollForm({...pollForm, end_date: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={pollForm.is_active}
                  onCheckedChange={(checked) => setPollForm({...pollForm, is_active: checked})}
                />
                <label htmlFor="active" className="text-sm text-gray-700 cursor-pointer">
                  Poll is active
                </label>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Options *</Label>
                  <Button type="button" size="sm" variant="outline" onClick={addOption}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Option
                  </Button>
                </div>
                <div className="space-y-2">
                  {pollForm.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      {pollForm.options.length > 2 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeOption(index)}
                          className="text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => createPollMutation.mutate(pollForm)}
                disabled={!pollForm.question || pollForm.options.filter(o => o.trim()).length < 2 || createPollMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {createPollMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Poll'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Poll Dialog */}
        {editingPoll && (
          <Dialog open={!!editingPoll} onOpenChange={() => setEditingPoll(null)}>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Edit Poll</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Question</Label>
                  <Input
                    value={editingPoll.question}
                    onChange={(e) => setEditingPoll({...editingPoll, question: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={editingPoll.description || ''}
                    onChange={(e) => setEditingPoll({...editingPoll, description: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={editingPoll.end_date || ''}
                    onChange={(e) => setEditingPoll({...editingPoll, end_date: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-active"
                    checked={editingPoll.is_active}
                    onCheckedChange={(checked) => setEditingPoll({...editingPoll, is_active: checked})}
                  />
                  <label htmlFor="edit-active" className="text-sm text-gray-700 cursor-pointer">
                    Poll is active
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingPoll(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    updatePollMutation.mutate({
                      pollId: editingPoll.id,
                      data: {
                        question: editingPoll.question,
                        description: editingPoll.description,
                        end_date: editingPoll.end_date,
                        is_active: editingPoll.is_active,
                      }
                    });
                  }}
                  disabled={updatePollMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {updatePollMutation.isPending ? (
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